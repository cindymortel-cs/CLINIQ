package com.cliniq

import kotlinx.serialization.Serializable

// --- AUTH & PROFILE MODELS ---
@Serializable
data class RegisterRequest(
    val role: String, // STUDENT, APPLICANT, PERSONNEL
    val fullName: String,
    val password: String,
    val contactNumber: String? = null,
    val srCode: String? = null,
    val collegeDepartment: String? = null,
    val yearLevel: String? = null,
    val applicationNumber: String? = null,
    val seniorHighSchool: String? = null,
    val programApplied: String? = null,
    val campus: String? = null,
    val employeeId: String? = null,
    val position: String? = null
)

@Serializable
data class LoginRequest(
    val identifier: String, // SR-Code, Application No., Employee ID, or Staff Username
    val password: String
)

@Serializable
data class UserDto(
    val id: Int,
    val role: String,
    val fullName: String,
    val contactNumber: String? = null,
    val profilePhoto: String? = null,
    val srCode: String? = null,
    val applicationNumber: String? = null,
    val employeeId: String? = null,
    val staffUsername: String? = null,
    val collegeDepartment: String? = null,
    val yearLevel: String? = null,
    val seniorHighSchool: String? = null,
    val programApplied: String? = null,
    val campus: String? = null,
    val position: String? = null,
    val email: String? = null,
    val inAppAlerts: Boolean = true,
    val approachingTurnAlerts: Boolean = true
)

@Serializable
data class AuthResponse(
    val token: String,
    val user: UserDto
)

@Serializable
data class UpdateProfileRequest(
    val id: Int? = null,
    val role: String? = null,
    val fullName: String,
    val contactNumber: String? = null,
    val srCode: String? = null,
    val applicationNumber: String? = null,
    val employeeId: String? = null,
    val staffUsername: String? = null,
    val collegeDepartment: String? = null,
    val officeDepartment: String? = null,
    val yearLevel: String? = null,
    val seniorHighSchool: String? = null,
    val programApplied: String? = null,
    val programAppliedFor: String? = null,
    val campus: String? = null,
    val position: String? = null,
    val email: String? = null,
    val profilePhoto: String? = null,
    val inAppAlerts: Boolean? = null,
    val approachingTurnAlerts: Boolean? = null
)

@Serializable
data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)

@Serializable
data class ForgotPasswordRequest(
    val identifier: String,
    val newPassword: String
)
@Serializable
data class NotificationPrefsRequest(
    val inAppAlerts: Boolean,
    val approachingTurnAlerts: Boolean
)

// --- SERVICES & QUEUE MODELS ---
@Serializable
data class ClinicServiceDto(
    val id: Int,
    val serviceCode: String,
    val name: String,
    val allowedRoles: String,
    val avgMinutes: Int
)

@Serializable
data class CheckInRequest(
    val userId: Int,
    val serviceId: Int,
    val urgentNote: String? = null
)

@Serializable
data class QueueTicketDto(
    val id: Int,
    val queueNumber: String,
    val queueDate: String,
    val userId: Int,
    val patientName: String,
    val patientRole: String,
    val patientIdentifier: String,
    val serviceId: Int,
    val serviceName: String,
    val priority: String,
    val priorityOrder: Int,
    val urgentNote: String? = null,
    val status: String,
    val staffNotes: String? = null,
    val checkedInAt: String,
    val calledAt: String? = null,
    val completedAt: String? = null,
    val peopleAhead: Int = 0,
    val estimatedWaitMinutes: Int = 0,
    val nowServingNumber: String = "None"
)

@Serializable
data class PriorityRequest(
    val priority: String, // URGENT or REGULAR
    val urgentNote: String? = null
)

@Serializable
data class CompleteVisitRequest(
    val serviceName: String? = null,
    val staffNotes: String? = null
)

@Serializable
data class DashboardSummaryDto(
    val waitingCount: Int,
    val nowServing: String,
    val urgentCount: Int,
    val avgWaitMinutes: Int,
    val activeQueue: List<QueueTicketDto>,
    val nextInLine: QueueTicketDto? = null
)

// --- ANNOUNCEMENTS ---
@Serializable
data class AnnouncementDto(
    val id: Int,
    val title: String,
    val message: String,
    val announcementType: String,
    val eventDate: String? = null,
    val createdAt: String
)

@Serializable
data class CreateAnnouncementRequest(
    val title: String,
    val message: String,
    val announcementType: String = "ANNOUNCEMENT",
    val eventDate: String? = null,
    val createdBy: Int? = null
)

// --- WEBSOCKET REAL-TIME EVENT ---
@Serializable
data class WsEvent(
    val event: String, // QUEUE_UPDATED, NOW_SERVING, APPROACHING_TURN, ANNOUNCEMENT_UPDATED
    val targetUserId: Int? = null,
    val queueNumber: String? = null,
    val message: String? = null
)