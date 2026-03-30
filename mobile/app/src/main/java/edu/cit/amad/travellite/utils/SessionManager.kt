package edu.cit.amad.travellite.utils

import android.content.Context

class SessionManager(context: Context) {

    private val prefs = context.getSharedPreferences("TravelLitePrefs", Context.MODE_PRIVATE)

    fun saveTokens(accessToken: String, refreshToken: String) {
        prefs.edit()
            .putString("access_token", accessToken)
            .putString("refresh_token", refreshToken)
            .apply()
    }

    fun saveUser(firstName: String, lastName: String, email: String) {
        prefs.edit()
            .putString("first_name", firstName)
            .putString("last_name", lastName)
            .putString("email", email)
            .apply()
    }

    fun getFirstName(): String? = prefs.getString("first_name", null)
    fun getAccessToken(): String? = prefs.getString("access_token", null)
    fun isLoggedIn(): Boolean = getAccessToken() != null

    fun clearSession() {
        prefs.edit().clear().apply()
    }
}