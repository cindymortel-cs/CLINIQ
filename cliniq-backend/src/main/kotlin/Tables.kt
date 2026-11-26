package com.cliniq

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.date
import org.jetbrains.exposed.sql.javatime.timestamp

object UsersTable : Table("users") {
    val id = integer("id").autoIncrement()
    val role = varchar("role", 20) // STUDENT, APPLICANT, PERSONNEL, STAFF
    val fullName = varchar("full_name", 120)
    val passwordHash = varchar("password_hash", 255)
    val contactNumber = varchar("contact_number", 30).nullable()
    val profilePhoto = text("profile_photo").nullable()

    val srCode = varchar("sr_code", 30).nullable()
    val applicationNumber = varchar("application_number", 30).nullable()
    val employeeId = varchar("employee_id", 30).nullable()
    val staffUsername = varchar("staff_username", 50).nullable()

    val collegeDepartment = varchar("college_department", 120).nullable()
    val yearLevel = varchar("year_level", 30).nullable()
    val seniorHighSchool = varchar("senior_high_school", 150).nullable()
    val programApplied = varchar("program_applied", 120).nullable()
    val campus = varchar("campus", 80).nullable()
    val position = varchar("position", 80).nullable()
    val email = varchar("email", 120).nullable()

    val inAppAlerts = bool("in_app_alerts").default(true)
    val approachingTurnAlerts = bool("approaching_turn_alerts").default(true)
    val createdAt = timestamp("created_at")

    override val primaryKey = PrimaryKey(id)
}

object ClinicServicesTable : Table("clinic_services") {
    val id = integer("id").autoIncrement()
    val serviceCode = varchar("service_code", 10)
    val name = varchar("name", 100)
    val allowedRoles = varchar("allowed_roles", 100)
    val avgMinutes = integer("avg_minutes")
    val isActive = bool("is_active")

    override val primaryKey = PrimaryKey(id)
}

object QueueTicketsTable : Table("queue_tickets") {
    val id = integer("id").autoIncrement()
    val queueNumber = varchar("queue_number", 20)
    val queueDate = date("queue_date")
    val userId = integer("user_id") references UsersTable.id
    val serviceId = integer("service_id") references ClinicServicesTable.id
    val priority = varchar("priority", 20) // REGULAR, URGENT
    val priorityOrder = integer("priority_order")
    val urgentNote = text("urgent_note").nullable()
    val status = varchar("status", 20) // WAITING, APPROACHING, NOW_SERVING, COMPLETED, CANCELLED
    val staffNotes = text("staff_notes").nullable()
    val checkedInAt = timestamp("checked_in_at")
    val calledAt = timestamp("called_at").nullable()
    val completedAt = timestamp("completed_at").nullable()

    override val primaryKey = PrimaryKey(id)
}

object AnnouncementsTable : Table("announcements") {
    val id = integer("id").autoIncrement()
    val title = varchar("title", 150)
    val message = text("message")
    val announcementType = varchar("announcement_type", 30) // ANNOUNCEMENT, UPCOMING_APPOINTMENT
    val eventDate = varchar("event_date", 60).nullable()
    val createdBy = integer("created_by").nullable()
    val isActive = bool("is_active")
    val createdAt = timestamp("created_at")

    override val primaryKey = PrimaryKey(id)
}

object EnrolledStudentsTable : Table("enrolled_students") {
    val id = integer("id").autoIncrement()
    val srCode = varchar("sr_code", 30).uniqueIndex()
    val fullName = varchar("full_name", 120)
    val collegeDepartment = varchar("college_department", 120).nullable()
    val yearLevel = varchar("year_level", 30).nullable()
    val isEnrolled = bool("is_enrolled").default(true)

    override val primaryKey = PrimaryKey(id)
}