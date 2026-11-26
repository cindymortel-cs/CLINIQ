package com.cliniq

import com.cliniq.DatabaseFactory.dbQuery
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.mindrot.jbcrypt.BCrypt
import java.io.File
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Collections
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean

private val manilaZone = ZoneId.of("Asia/Manila")
private val timeFormatter = DateTimeFormatter.ofPattern("hh:mm a").withZone(manilaZone)
private val dateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy").withZone(manilaZone)
private val userDeviceSessions = ConcurrentHashMap<Int, MutableSet<String>>()
private val isCheckInPaused = AtomicBoolean(false)

@Volatile
private var pauseReasonMessage: String = "Clinic check-ins are currently paused (Lunch Break / Daily Cut-off)."

private fun ResultRow.toUserDto() = UserDto(
    id = this[UsersTable.id],
    role = this[UsersTable.role],
    fullName = this[UsersTable.fullName],
    contactNumber = this[UsersTable.contactNumber],
    profilePhoto = this[UsersTable.profilePhoto],
    srCode = this[UsersTable.srCode],
    applicationNumber = this[UsersTable.applicationNumber],
    employeeId = this[UsersTable.employeeId],
    staffUsername = this[UsersTable.staffUsername],
    collegeDepartment = this[UsersTable.collegeDepartment],
    yearLevel = this[UsersTable.yearLevel],
    seniorHighSchool = this[UsersTable.seniorHighSchool],
    programApplied = this[UsersTable.programApplied],
    campus = this[UsersTable.campus],
    position = this[UsersTable.position],
    email = this[UsersTable.email],
    inAppAlerts = this[UsersTable.inAppAlerts],
    approachingTurnAlerts = this[UsersTable.approachingTurnAlerts]
)

private suspend fun fetchActiveQueueSorted(): List<QueueTicketDto> = dbQuery {
    val today = LocalDate.now(manilaZone)
    val rows = (QueueTicketsTable innerJoin UsersTable innerJoin ClinicServicesTable)
        .selectAll()
        .where {
            (QueueTicketsTable.queueDate eq today) and
                    (QueueTicketsTable.status inList listOf("NOW_SERVING", "APPROACHING", "WAITING"))
        }
        .toList()

    val sorted = rows.sortedWith(
        compareBy<ResultRow>(
            { if (it[QueueTicketsTable.status] == "NOW_SERVING") 0 else 1 },
            { if (it[QueueTicketsTable.priority] == "URGENT") 0 else 1 },
            { it[QueueTicketsTable.priorityOrder] },
            { it[QueueTicketsTable.id] }
        )
    )

    val nowServingNum = sorted.firstOrNull { it[QueueTicketsTable.status] == "NOW_SERVING" }
        ?.get(QueueTicketsTable.queueNumber) ?: "None"

    var waitingIndex = 0
    sorted.map { row ->
        val status = row[QueueTicketsTable.status]
        val ahead = if (status == "NOW_SERVING") 0 else waitingIndex++
        val avgMin = row[ClinicServicesTable.avgMinutes]
        val role = row[UsersTable.role]
        val identifier = when (role) {
            "STUDENT" -> row[UsersTable.srCode] ?: ""
            "APPLICANT" -> row[UsersTable.applicationNumber] ?: ""
            "PERSONNEL" -> row[UsersTable.employeeId] ?: ""
            else -> row[UsersTable.staffUsername] ?: ""
        }

        QueueTicketDto(
            id = row[QueueTicketsTable.id],
            queueNumber = row[QueueTicketsTable.queueNumber],
            queueDate = row[QueueTicketsTable.queueDate].toString(),
            userId = row[QueueTicketsTable.userId],
            patientName = row[UsersTable.fullName],
            patientRole = role,
            patientIdentifier = identifier,
            serviceId = row[QueueTicketsTable.serviceId],
            serviceName = row[ClinicServicesTable.name],
            priority = row[QueueTicketsTable.priority],
            priorityOrder = row[QueueTicketsTable.priorityOrder],
            urgentNote = row[QueueTicketsTable.urgentNote],
            status = status,
            staffNotes = row[QueueTicketsTable.staffNotes],
            checkedInAt = timeFormatter.format(row[QueueTicketsTable.checkedInAt]),
            calledAt = row[QueueTicketsTable.calledAt]?.let { timeFormatter.format(it) },
            completedAt = row[QueueTicketsTable.completedAt]?.let { timeFormatter.format(it) },
            peopleAhead = ahead,
            estimatedWaitMinutes = ahead * avgMin,
            nowServingNumber = nowServingNum
        )
    }
}

private suspend fun updateApproachingPatient() {
    val active = fetchActiveQueueSorted()
    val nextWaiting = active.firstOrNull { it.status == "WAITING" || it.status == "APPROACHING" }
    if (nextWaiting != null && nextWaiting.status == "WAITING") {
        dbQuery {
            QueueTicketsTable.update({ QueueTicketsTable.id eq nextWaiting.id }) {
                it[status] = "APPROACHING"
            }
        }
        QueueBroadcaster.broadcast(
            WsEvent(
                event = "APPROACHING_TURN",
                targetUserId = nextWaiting.userId,
                queueNumber = nextWaiting.queueNumber,
                message = "Your turn is approaching! Please stay near the university clinic."
            )
        )
    }
}

fun Application.configureRouting() {
    DatabaseFactory.init()

    routing {
        staticResources("/", "static", index = "index.html")

        get("/app-debug.apk") {
            val candidates = listOf(
                File("apk-release/app-debug.apk"),
                File("../apk-release/app-debug.apk")
            )
            val apkFile = candidates.firstOrNull { it.exists() && it.isFile }
            if (apkFile == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("error" to "APK not found in apk-release/app-debug.apk"))
                return@get
            }
            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(
                    ContentDisposition.Parameters.FileName,
                    "app-debug.apk"
                ).toString()
            )
            call.respondFile(apkFile)
        }

        get("/api/health") {
            val serviceCount = dbQuery { ClinicServicesTable.selectAll().count() }
            call.respond(mapOf("status" to "CONNECTED", "database" to "cliniq_db", "servicesLoaded" to serviceCount.toString()))
        }

        // ==================== 1. AUTHENTICATION ====================
        post("/api/auth/register") {
            val req = call.receive<RegisterRequest>()
            val role = req.role.uppercase()

            if (req.fullName.isBlank() || req.password.length < 4) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Full name and password (min 4 chars) are required."))
                return@post
            }

            if (role == "STUDENT") {
                val srInput = req.srCode?.trim().orEmpty()
                if (srInput.isBlank()) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "SR-CODE is required for student registration."))
                    return@post
                }
                val isEnrolled = dbQuery {
                    EnrolledStudentsTable.selectAll().where {
                        (EnrolledStudentsTable.srCode eq srInput) and (EnrolledStudentsTable.isEnrolled eq true)
                    }.count() > 0
                }
                if (!isEnrolled) {
                    call.respond(
                        HttpStatusCode.Forbidden,
                        mapOf("error" to "SR-CODE ($srInput) is not listed in the enrolled students dataset.")
                    )
                    return@post
                }
            }

            val duplicate = dbQuery {
                when (role) {
                    "STUDENT" -> UsersTable.selectAll().where { UsersTable.srCode eq req.srCode?.trim() }.count() > 0
                    "APPLICANT" -> UsersTable.selectAll().where { UsersTable.applicationNumber eq req.applicationNumber?.trim() }.count() > 0
                    "PERSONNEL" -> UsersTable.selectAll().where { UsersTable.employeeId eq req.employeeId?.trim() }.count() > 0
                    else -> false
                }
            }
            if (duplicate) {
                call.respond(HttpStatusCode.Conflict, mapOf("error" to "An account with this ID already exists."))
                return@post
            }

            val hashed = BCrypt.hashpw(req.password, BCrypt.gensalt())
            val insertedUser = dbQuery {
                val id = UsersTable.insert {
                    it[UsersTable.role] = role
                    it[fullName] = req.fullName.trim()
                    it[passwordHash] = hashed
                    it[contactNumber] = req.contactNumber?.trim()
                    it[srCode] = if (role == "STUDENT") req.srCode?.trim() else null
                    it[collegeDepartment] = if (role == "STUDENT" || role == "PERSONNEL") req.collegeDepartment?.trim() else null
                    it[yearLevel] = if (role == "STUDENT") req.yearLevel?.trim() else null
                    it[applicationNumber] = if (role == "APPLICANT") req.applicationNumber?.trim() else null
                    it[seniorHighSchool] = if (role == "APPLICANT") req.seniorHighSchool?.trim() else null
                    it[programApplied] = if (role == "APPLICANT") req.programApplied?.trim() else null
                    it[campus] = if (role == "APPLICANT") req.campus?.trim() else null
                    it[employeeId] = if (role == "PERSONNEL") req.employeeId?.trim() else null
                    it[position] = if (role == "PERSONNEL") req.position?.trim() else null
                    it[createdAt] = Instant.now()
                } get UsersTable.id

                UsersTable.selectAll().where { UsersTable.id eq id }.single().toUserDto()
            }

            val token = JwtConfig.generateToken(insertedUser.id, insertedUser.role, insertedUser.fullName)
            call.respond(HttpStatusCode.Created, AuthResponse(token, insertedUser))
        }

        post("/api/auth/login") {
            val req = call.receive<LoginRequest>()
            val idInput = req.identifier.trim()

            val userDto = dbQuery {
                val userRow = UsersTable.selectAll().where {
                    (UsersTable.srCode eq idInput) or
                            (UsersTable.applicationNumber eq idInput) or
                            (UsersTable.employeeId eq idInput) or
                            (UsersTable.staffUsername eq idInput)
                }.firstOrNull()

                if (userRow != null && BCrypt.checkpw(req.password, userRow[UsersTable.passwordHash])) {
                    userRow.toUserDto()
                } else {
                    null
                }
            }

            if (userDto == null) {
                call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Invalid ID/Username or password."))
                return@post
            }

            if (userDto.role == "STUDENT") {
                val stillEnrolled = dbQuery {
                    EnrolledStudentsTable.selectAll().where {
                        (EnrolledStudentsTable.srCode eq (userDto.srCode ?: "")) and
                                (EnrolledStudentsTable.isEnrolled eq true)
                    }.count() > 0
                }
                if (!stillEnrolled) {
                    call.respond(
                        HttpStatusCode.Forbidden,
                        mapOf("error" to "Access denied. Your SR-CODE is not listed as currently enrolled.")
                    )
                    return@post
                }
            }

            val token = JwtConfig.generateToken(userDto.id, userDto.role, userDto.fullName)
            call.respond(AuthResponse(token, userDto))
        }

        post("/api/auth/forgot-password") {
            val req = call.receive<ForgotPasswordRequest>()
            val idInput = req.identifier.trim()

            if (idInput.isBlank() || req.newPassword.length < 4) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    mapOf("error" to "Valid ID and password (min 4 chars) are required.")
                )
                return@post
            }

            val updated = dbQuery {
                val userRow = UsersTable.selectAll().where {
                    (UsersTable.srCode eq idInput) or
                            (UsersTable.applicationNumber eq idInput) or
                            (UsersTable.employeeId eq idInput) or
                            (UsersTable.staffUsername eq idInput)
                }.firstOrNull()

                if (userRow == null) {
                    false
                } else {
                    val newHash = BCrypt.hashpw(req.newPassword, BCrypt.gensalt())
                    UsersTable.update({ UsersTable.id eq userRow[UsersTable.id] }) {
                        it[passwordHash] = newHash
                    }
                    true
                }
            }

            if (!updated) {
                call.respond(
                    HttpStatusCode.NotFound,
                    mapOf("error" to "No account found with that ID.")
                )
            } else {
                call.respond(
                    HttpStatusCode.OK,
                    mapOf("message" to "Password updated successfully.")
                )
            }
        }

        // ==================== 2. USER PROFILE & SETTINGS ====================
        get("/api/users/{id}") {
            val userId = call.parameters["id"]?.toIntOrNull() ?: return@get call.respond(HttpStatusCode.BadRequest)
            val user = dbQuery { UsersTable.selectAll().where { UsersTable.id eq userId }.firstOrNull()?.toUserDto() }
                ?: return@get call.respond(HttpStatusCode.NotFound, mapOf("error" to "User not found"))
            call.respond(user)
        }

        put("/api/users/{id}") {
            val userId = call.parameters["id"]?.toIntOrNull() ?: return@put call.respond(HttpStatusCode.BadRequest)
            val req = call.receive<UpdateProfileRequest>()
            val deptValue = req.collegeDepartment ?: req.officeDepartment
            val programValue = req.programApplied ?: req.programAppliedFor
            val updated = dbQuery {
                UsersTable.update({ UsersTable.id eq userId }) {
                    it[fullName] = req.fullName.trim()
                    if (req.contactNumber != null) it[contactNumber] = req.contactNumber.trim()
                    if (deptValue != null) it[collegeDepartment] = deptValue.trim()
                    if (req.yearLevel != null) it[yearLevel] = req.yearLevel.trim()
                    if (req.seniorHighSchool != null) it[seniorHighSchool] = req.seniorHighSchool.trim()
                    if (programValue != null) it[programApplied] = programValue.trim()
                    if (req.campus != null) it[campus] = req.campus.trim()
                    if (req.position != null) it[position] = req.position.trim()
                    if (req.email != null) it[email] = req.email.trim()
                    if (req.profilePhoto != null) it[profilePhoto] = req.profilePhoto
                }
                UsersTable.selectAll().where { UsersTable.id eq userId }.single().toUserDto()
            }
            call.respond(updated)
        }

        put("/api/users/{id}/password") {
            val userId = call.parameters["id"]?.toIntOrNull() ?: return@put call.respond(HttpStatusCode.BadRequest)
            val req = call.receive<ChangePasswordRequest>()
            val userRow = dbQuery { UsersTable.selectAll().where { UsersTable.id eq userId }.firstOrNull() }
                ?: return@put call.respond(HttpStatusCode.NotFound)

            if (!BCrypt.checkpw(req.currentPassword, userRow[UsersTable.passwordHash])) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Current password is incorrect."))
                return@put
            }

            val newHash = BCrypt.hashpw(req.newPassword, BCrypt.gensalt())
            dbQuery {
                UsersTable.update({ UsersTable.id eq userId }) { it[passwordHash] = newHash }
            }
            call.respond(mapOf("message" to "Password updated successfully."))
        }

        put("/api/users/{id}/notifications") {
            val userId = call.parameters["id"]?.toIntOrNull() ?: return@put call.respond(HttpStatusCode.BadRequest)
            val req = call.receive<NotificationPrefsRequest>()
            dbQuery {
                UsersTable.update({ UsersTable.id eq userId }) {
                    it[inAppAlerts] = req.inAppAlerts
                    it[approachingTurnAlerts] = req.approachingTurnAlerts
                }
            }
            call.respond(mapOf("message" to "Notification preferences saved."))
        }

        get("/api/users/{id}/devices") {
            val userId = call.parameters["id"]?.toIntOrNull() ?: return@get call.respond(HttpStatusCode.BadRequest)
            val currentDevice = call.request.queryParameters["device"]?.trim()?.takeIf { it.isNotBlank() }
            val devices = userDeviceSessions.computeIfAbsent(userId) {
                Collections.synchronizedSet(linkedSetOf())
            }
            if (currentDevice != null) {
                devices.add(currentDevice)
            }
            call.respond(mapOf("devices" to devices.toList()))
        }

        post("/api/users/{id}/devices/signout-all") {
            val userId = call.parameters["id"]?.toIntOrNull() ?: return@post call.respond(HttpStatusCode.BadRequest)
            userDeviceSessions.remove(userId)
            QueueBroadcaster.broadcast(
                WsEvent(
                    event = "FORCE_SIGNOUT",
                    targetUserId = userId,
                    message = "Signed out from all devices."
                )
            )
            call.respond(mapOf("message" to "Signed out from all devices."))
        }

        // ==================== 3. CLINIC SERVICES & QUEUE STATUS ====================
        get("/api/services") {
            val roleFilter = call.request.queryParameters["role"]?.uppercase()
            val services = dbQuery {
                ClinicServicesTable.selectAll()
                    .where { ClinicServicesTable.isActive eq true }
                    .map {
                        ClinicServiceDto(
                            id = it[ClinicServicesTable.id],
                            serviceCode = it[ClinicServicesTable.serviceCode],
                            name = it[ClinicServicesTable.name],
                            allowedRoles = it[ClinicServicesTable.allowedRoles],
                            avgMinutes = it[ClinicServicesTable.avgMinutes]
                        )
                    }
                    .filter { svc -> roleFilter == null || svc.allowedRoles.split(",").contains(roleFilter) }
            }
            call.respond(services)
        }

        get("/api/queue/status") {
            call.respond(
                mapOf(
                    "paused" to isCheckInPaused.get().toString(),
                    "reason" to pauseReasonMessage
                )
            )
        }

        // ==================== 4. PATIENT QUEUE & CHECK-IN ====================
        post("/api/queue/checkin") {
            if (isCheckInPaused.get()) {
                call.respond(
                    HttpStatusCode.ServiceUnavailable,
                    mapOf("error" to pauseReasonMessage)
                )
                return@post
            }

            val req = call.receive<CheckInRequest>()
            val today = LocalDate.now(manilaZone)

            val existingActive = fetchActiveQueueSorted().firstOrNull { it.userId == req.userId }
            if (existingActive != null) {
                call.respond(HttpStatusCode.Conflict, existingActive)
                return@post
            }

            val ticketId = dbQuery {
                val serviceRow = ClinicServicesTable.selectAll().where { ClinicServicesTable.id eq req.serviceId }.single()
                val serviceTodayCount = QueueTicketsTable.selectAll().where {
                    (QueueTicketsTable.queueDate eq today) and (QueueTicketsTable.serviceId eq req.serviceId)
                }.count()
                val nextServiceNum = serviceTodayCount + 1
                val formattedQueueNum = String.format("%s-%03d", serviceRow[ClinicServicesTable.serviceCode], nextServiceNum)

                val totalTodayCount = QueueTicketsTable.selectAll().where { QueueTicketsTable.queueDate eq today }.count()

                QueueTicketsTable.insert {
                    it[queueNumber] = formattedQueueNum
                    it[queueDate] = today
                    it[userId] = req.userId
                    it[serviceId] = req.serviceId
                    it[priority] = "REGULAR"
                    it[priorityOrder] = (totalTodayCount + 1).toInt()
                    it[urgentNote] = req.urgentNote?.takeIf { n -> n.isNotBlank() }
                    it[status] = "WAITING"
                    it[checkedInAt] = Instant.now()
                } get QueueTicketsTable.id
            }

            updateApproachingPatient()
            val createdTicket = fetchActiveQueueSorted().first { it.id == ticketId }

            QueueBroadcaster.broadcast(
                WsEvent(
                    event = "QUEUE_UPDATED",
                    queueNumber = createdTicket.queueNumber,
                    message = "New patient checked in: ${createdTicket.queueNumber}"
                )
            )
            call.respond(HttpStatusCode.Created, createdTicket)
        }

        get("/api/queue/my-active/{userId}") {
            val userId = call.parameters["userId"]?.toIntOrNull() ?: return@get call.respond(HttpStatusCode.BadRequest)
            val active = fetchActiveQueueSorted().firstOrNull { it.userId == userId }
            if (active == null) {
                call.respond(HttpStatusCode.NotFound, mapOf("message" to "No active queue"))
            } else {
                call.respond(active)
            }
        }

        post("/api/queue/{ticketId}/cancel") {
            val ticketId = call.parameters["ticketId"]?.toIntOrNull() ?: return@post call.respond(HttpStatusCode.BadRequest)
            val currentStatus = dbQuery {
                QueueTicketsTable.selectAll().where { QueueTicketsTable.id eq ticketId }
                    .firstOrNull()?.get(QueueTicketsTable.status)
            }
            if (currentStatus == "NOW_SERVING" || currentStatus == "COMPLETED") {
                call.respond(
                    HttpStatusCode.BadRequest,
                    mapOf("error" to "Cannot cancel a ticket that is already being served or completed.")
                )
                return@post
            }

            dbQuery {
                QueueTicketsTable.update({ QueueTicketsTable.id eq ticketId }) {
                    it[status] = "CANCELLED"
                    it[completedAt] = Instant.now()
                }
            }
            updateApproachingPatient()
            QueueBroadcaster.broadcast(WsEvent(event = "QUEUE_UPDATED", message = "Queue ticket cancelled"))
            call.respond(mapOf("message" to "Queue request cancelled."))
        }

        get("/api/visits/history/{userId}") {
            val userId = call.parameters["userId"]?.toIntOrNull() ?: return@get call.respond(HttpStatusCode.BadRequest)
            val activeMap = fetchActiveQueueSorted().associateBy { it.id }

            val history = dbQuery {
                (QueueTicketsTable innerJoin UsersTable innerJoin ClinicServicesTable)
                    .selectAll()
                    .where { QueueTicketsTable.userId eq userId }
                    .orderBy(QueueTicketsTable.id, SortOrder.DESC)
                    .map { row ->
                        val id = row[QueueTicketsTable.id]
                        activeMap[id] ?: QueueTicketDto(
                            id = id,
                            queueNumber = row[QueueTicketsTable.queueNumber],
                            queueDate = dateFormatter.format(row[QueueTicketsTable.checkedInAt]),
                            userId = userId,
                            patientName = row[UsersTable.fullName],
                            patientRole = row[UsersTable.role],
                            patientIdentifier = row[UsersTable.srCode] ?: row[UsersTable.applicationNumber] ?: row[UsersTable.employeeId] ?: "",
                            serviceId = row[QueueTicketsTable.serviceId],
                            serviceName = row[ClinicServicesTable.name],
                            priority = row[QueueTicketsTable.priority],
                            priorityOrder = row[QueueTicketsTable.priorityOrder],
                            urgentNote = row[QueueTicketsTable.urgentNote],
                            status = row[QueueTicketsTable.status],
                            staffNotes = row[QueueTicketsTable.staffNotes],
                            checkedInAt = timeFormatter.format(row[QueueTicketsTable.checkedInAt]),
                            calledAt = row[QueueTicketsTable.calledAt]?.let { timeFormatter.format(it) },
                            completedAt = row[QueueTicketsTable.completedAt]?.let { timeFormatter.format(it) }
                        )
                    }
            }
            call.respond(history)
        }

        // ==================== 5. STAFF QUEUE MANAGEMENT ====================
        get("/api/staff/dashboard") {
            val activeQueue = fetchActiveQueueSorted()
            val waitingItems = activeQueue.filter { it.status != "NOW_SERVING" }
            val nowServing = activeQueue.firstOrNull { it.status == "NOW_SERVING" }?.queueNumber ?: "None"
            val urgentCount = activeQueue.count { it.priority == "URGENT" }
            val avgWait = if (waitingItems.isEmpty()) 0 else (waitingItems.size * 15) / 2
            val nextInLine = waitingItems.firstOrNull()

            call.respond(
                DashboardSummaryDto(
                    waitingCount = waitingItems.size,
                    nowServing = nowServing,
                    urgentCount = urgentCount,
                    avgWaitMinutes = avgWait,
                    activeQueue = activeQueue,
                    nextInLine = nextInLine
                )
            )
        }

        post("/api/staff/queue-status") {
            val rawBody = call.receiveText()
            val jsonObj = runCatching { Json.parseToJsonElement(rawBody).jsonObject }.getOrNull()
            val paused = jsonObj?.get("paused")?.jsonPrimitive?.content?.toBooleanStrictOrNull()
                ?: !isCheckInPaused.get()
            val customReason = jsonObj?.get("reason")?.jsonPrimitive?.content?.trim()?.takeIf { it.isNotBlank() }

            isCheckInPaused.set(paused)
            if (customReason != null) {
                pauseReasonMessage = customReason
            } else if (paused) {
                pauseReasonMessage = "Clinic check-ins are currently paused (Lunch Break / Daily Cut-off)."
            }

            QueueBroadcaster.broadcast(
                WsEvent(
                    event = "QUEUE_STATUS_CHANGED",
                    message = if (paused) pauseReasonMessage else "Clinic check-ins are now open."
                )
            )

            call.respond(
                mapOf(
                    "paused" to isCheckInPaused.get().toString(),
                    "reason" to pauseReasonMessage,
                    "message" to if (paused) "Check-ins paused (Clinic Cut-Off active)." else "Check-ins resumed (Clinic is open)."
                )
            )
        }

        post("/api/staff/call-next") {
            val activeQueue = fetchActiveQueueSorted()
            val currentServing = activeQueue.firstOrNull { it.status == "NOW_SERVING" }
            val nextPatient = activeQueue.firstOrNull { it.status == "APPROACHING" || it.status == "WAITING" }
                ?: return@post call.respond(HttpStatusCode.BadRequest, mapOf("error" to "No waiting patients in queue."))

            dbQuery {
                if (currentServing != null) {
                    QueueTicketsTable.update({ QueueTicketsTable.id eq currentServing.id }) {
                        it[status] = "COMPLETED"
                        it[completedAt] = Instant.now()
                    }
                }
                QueueTicketsTable.update({ QueueTicketsTable.id eq nextPatient.id }) {
                    it[status] = "NOW_SERVING"
                    it[calledAt] = Instant.now()
                }
            }

            updateApproachingPatient()
            val updated = fetchActiveQueueSorted().first { it.id == nextPatient.id }

            QueueBroadcaster.broadcast(
                WsEvent(
                    event = "NOW_SERVING",
                    targetUserId = updated.userId,
                    queueNumber = updated.queueNumber,
                    message = "It is your turn! ${updated.queueNumber} is now being called."
                )
            )
            QueueBroadcaster.broadcast(WsEvent(event = "QUEUE_UPDATED", queueNumber = updated.queueNumber))

            call.respond(updated)
        }

        post("/api/staff/no-show") {
            val activeQueue = fetchActiveQueueSorted()
            val currentServing = activeQueue.firstOrNull { it.status == "NOW_SERVING" }
                ?: return@post call.respond(
                    HttpStatusCode.BadRequest,
                    mapOf("error" to "No patient is currently being served.")
                )

            val nextPatient = activeQueue.firstOrNull { it.status == "APPROACHING" || it.status == "WAITING" }

            dbQuery {
                QueueTicketsTable.update({ QueueTicketsTable.id eq currentServing.id }) {
                    it[status] = "NO_SHOW"
                    it[completedAt] = Instant.now()
                    it[staffNotes] = "Marked as No-Show by clinic staff"
                }

                if (nextPatient != null) {
                    QueueTicketsTable.update({ QueueTicketsTable.id eq nextPatient.id }) {
                        it[status] = "NOW_SERVING"
                        it[calledAt] = Instant.now()
                    }
                }
            }

            QueueBroadcaster.broadcast(
                WsEvent(
                    event = "TICKET_NO_SHOW",
                    targetUserId = currentServing.userId,
                    queueNumber = currentServing.queueNumber,
                    message = "Your ticket (${currentServing.queueNumber}) was marked as No-Show. Please check in again at the clinic."
                )
            )

            if (nextPatient != null) {
                updateApproachingPatient()
                val updatedNext = fetchActiveQueueSorted().first { it.id == nextPatient.id }

                QueueBroadcaster.broadcast(
                    WsEvent(
                        event = "NOW_SERVING",
                        targetUserId = updatedNext.userId,
                        queueNumber = updatedNext.queueNumber,
                        message = "It is your turn! ${updatedNext.queueNumber} is now being called."
                    )
                )
            }

            QueueBroadcaster.broadcast(WsEvent(event = "QUEUE_UPDATED", queueNumber = currentServing.queueNumber))
            call.respond(mapOf("message" to "Marked ${currentServing.queueNumber} as No-Show."))
        }

        put("/api/staff/queue/{ticketId}/priority") {
            val ticketId = call.parameters["ticketId"]?.toIntOrNull() ?: return@put call.respond(HttpStatusCode.BadRequest)
            val req = call.receive<PriorityRequest>()
            val newPriority = req.priority.uppercase()

            dbQuery {
                QueueTicketsTable.update({ QueueTicketsTable.id eq ticketId }) {
                    it[priority] = newPriority
                    if (req.urgentNote != null) it[urgentNote] = req.urgentNote
                }
            }

            updateApproachingPatient()
            QueueBroadcaster.broadcast(WsEvent(event = "QUEUE_UPDATED", message = "Queue priority updated"))
            call.respond(mapOf("message" to "Priority updated to $newPriority"))
        }

        post("/api/staff/queue/{ticketId}/complete") {
            val ticketId = call.parameters["ticketId"]?.toIntOrNull() ?: return@post call.respond(HttpStatusCode.BadRequest)
            val req = call.receive<CompleteVisitRequest>()

            val completedTicket = dbQuery {
                QueueTicketsTable.update({ QueueTicketsTable.id eq ticketId }) {
                    it[status] = "COMPLETED"
                    it[staffNotes] = req.staffNotes
                    it[completedAt] = Instant.now()
                }
                QueueTicketsTable.selectAll().where { QueueTicketsTable.id eq ticketId }.single()
            }

            updateApproachingPatient()
            QueueBroadcaster.broadcast(
                WsEvent(
                    event = "VISIT_COMPLETED",
                    targetUserId = completedTicket[QueueTicketsTable.userId],
                    queueNumber = completedTicket[QueueTicketsTable.queueNumber],
                    message = "Your clinic visit has been completed."
                )
            )
            QueueBroadcaster.broadcast(WsEvent(event = "QUEUE_UPDATED"))
            call.respond(mapOf("message" to "Visit completed and saved."))
        }

        get("/api/staff/visit-records") {
            val records = dbQuery {
                (QueueTicketsTable innerJoin UsersTable innerJoin ClinicServicesTable)
                    .selectAll()
                    .orderBy(QueueTicketsTable.id, SortOrder.DESC)
                    .limit(100)
                    .map { row ->
                        QueueTicketDto(
                            id = row[QueueTicketsTable.id],
                            queueNumber = row[QueueTicketsTable.queueNumber],
                            queueDate = dateFormatter.format(row[QueueTicketsTable.checkedInAt]),
                            userId = row[QueueTicketsTable.userId],
                            patientName = row[UsersTable.fullName],
                            patientRole = row[UsersTable.role],
                            patientIdentifier = row[UsersTable.srCode] ?: row[UsersTable.applicationNumber] ?: row[UsersTable.employeeId] ?: "",
                            serviceId = row[QueueTicketsTable.serviceId],
                            serviceName = row[ClinicServicesTable.name],
                            priority = row[QueueTicketsTable.priority],
                            priorityOrder = row[QueueTicketsTable.priorityOrder],
                            urgentNote = row[QueueTicketsTable.urgentNote],
                            status = row[QueueTicketsTable.status],
                            staffNotes = row[QueueTicketsTable.staffNotes],
                            checkedInAt = timeFormatter.format(row[QueueTicketsTable.checkedInAt]),
                            calledAt = row[QueueTicketsTable.calledAt]?.let { timeFormatter.format(it) },
                            completedAt = row[QueueTicketsTable.completedAt]?.let { timeFormatter.format(it) }
                        )
                    }
            }
            call.respond(records)
        }

        // ==================== 6. ANNOUNCEMENTS ====================
        get("/api/announcements") {
            val list = dbQuery {
                AnnouncementsTable.selectAll()
                    .where { AnnouncementsTable.isActive eq true }
                    .orderBy(AnnouncementsTable.id, SortOrder.DESC)
                    .map {
                        AnnouncementDto(
                            id = it[AnnouncementsTable.id],
                            title = it[AnnouncementsTable.title],
                            message = it[AnnouncementsTable.message],
                            announcementType = it[AnnouncementsTable.announcementType],
                            eventDate = it[AnnouncementsTable.eventDate],
                            createdAt = dateFormatter.format(it[AnnouncementsTable.createdAt])
                        )
                    }
            }
            call.respond(list)
        }

        post("/api/announcements") {
            val req = call.receive<CreateAnnouncementRequest>()
            val created = dbQuery {
                val id = AnnouncementsTable.insert {
                    it[title] = req.title.trim()
                    it[message] = req.message.trim()
                    it[announcementType] = req.announcementType
                    it[eventDate] = req.eventDate?.trim()
                    it[createdBy] = req.createdBy
                    it[isActive] = true
                    it[createdAt] = Instant.now()
                } get AnnouncementsTable.id

                val row = AnnouncementsTable.selectAll().where { AnnouncementsTable.id eq id }.single()
                AnnouncementDto(
                    id = row[AnnouncementsTable.id],
                    title = row[AnnouncementsTable.title],
                    message = row[AnnouncementsTable.message],
                    announcementType = row[AnnouncementsTable.announcementType],
                    eventDate = row[AnnouncementsTable.eventDate],
                    createdAt = dateFormatter.format(row[AnnouncementsTable.createdAt])
                )
            }
            QueueBroadcaster.broadcast(WsEvent(event = "ANNOUNCEMENT_UPDATED", message = created.title))
            call.respond(HttpStatusCode.Created, created)
        }

        delete("/api/announcements/{id}") {
            val id = call.parameters["id"]?.toIntOrNull() ?: return@delete call.respond(HttpStatusCode.BadRequest)
            dbQuery {
                AnnouncementsTable.update({ AnnouncementsTable.id eq id }) { it[isActive] = false }
            }
            QueueBroadcaster.broadcast(WsEvent(event = "ANNOUNCEMENT_UPDATED"))
            call.respond(mapOf("message" to "Announcement deleted."))
        }
    }
}