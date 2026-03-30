package edu.cit.amad.travellite.api

import edu.cit.amad.travellite.model.AuthResponse
import edu.cit.amad.travellite.model.LoginRequest
import edu.cit.amad.travellite.model.RegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
}