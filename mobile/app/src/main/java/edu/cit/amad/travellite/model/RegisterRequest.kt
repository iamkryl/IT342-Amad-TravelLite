package edu.cit.amad.travellite.model

data class RegisterRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String
)