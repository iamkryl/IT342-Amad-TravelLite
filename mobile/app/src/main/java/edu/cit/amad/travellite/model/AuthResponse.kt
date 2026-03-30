package edu.cit.amad.travellite.model

data class AuthResponse(
    val success: Boolean,
    val data: AuthData?,
    val error: ErrorData?,
    val timestamp: String?
)

data class AuthData(
    val user: UserData?,
    val accessToken: String?,
    val refreshToken: String?
)

data class UserData(
    val first_name: String?,
    val last_name: String?,
    val email: String?
)

data class ErrorData(
    val code: String?,
    val message: String?,
    val details: Any?
)