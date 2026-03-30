package edu.cit.amad.travellite

import android.content.Intent
import android.os.Bundle
import android.text.InputType
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import edu.cit.amad.travellite.api.RetrofitClient
import edu.cit.amad.travellite.model.LoginRequest
import edu.cit.amad.travellite.utils.SessionManager
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var tvSignUp: TextView
    private lateinit var ivTogglePassword: ImageView
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        sessionManager = SessionManager(this)

        if (sessionManager.isLoggedIn()) {
            startActivity(Intent(this, DashboardActivity::class.java))
            finish()
            return
        }

        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        tvSignUp = findViewById(R.id.tvSignUp)
        ivTogglePassword = findViewById(R.id.ivTogglePassword)

        var isPasswordVisible = false
        ivTogglePassword.setOnClickListener {
            isPasswordVisible = !isPasswordVisible
            if (isPasswordVisible) {
                etPassword.inputType = InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
                ivTogglePassword.setImageResource(R.drawable.ic_eye_off)
            } else {
                etPassword.inputType = InputType.TYPE_CLASS_TEXT or
                        InputType.TYPE_TEXT_VARIATION_PASSWORD
                ivTogglePassword.setImageResource(R.drawable.ic_eye)
            }
            etPassword.setSelection(etPassword.text.length)
        }

        btnLogin.setOnClickListener {
            handleLogin()
        }

        tvSignUp.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
            finish()
        }
    }

    private fun handleLogin() {
        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString().trim()

        val emailRegex = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.(com|net|org|edu|gov|io|dev|app|ph|co\\.ph|edu\\.ph|com\\.ph)$", RegexOption.IGNORE_CASE)
        if (email.isEmpty() || !emailRegex.matches(email)) {
            etEmail.error = "Enter a valid email address"
            return
        }
        if (password.isEmpty()) {
            etPassword.error = "Password is required"
            return
        }

        btnLogin.isEnabled = false
        btnLogin.text = "Signing in..."

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.login(
                    LoginRequest(email = email, password = password)
                )

                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    val accessToken = data?.accessToken
                    if (accessToken != null) {
                        sessionManager.saveTokens(accessToken, data.refreshToken ?: "")
                    }
                    data?.user?.let { user ->
                        sessionManager.saveUser(
                            user.first_name ?: "",
                            user.last_name ?: "",
                            user.email ?: ""
                        )
                    }
                    Toast.makeText(
                        this@LoginActivity,
                        "Welcome back!", Toast.LENGTH_SHORT
                    ).show()
                    startActivity(Intent(this@LoginActivity, DashboardActivity::class.java))
                    finish()
                } else {
                    val errorMessage = response.body()?.error?.message
                        ?: "Invalid email or password"
                    Toast.makeText(this@LoginActivity, errorMessage, Toast.LENGTH_SHORT).show()
                    btnLogin.isEnabled = true
                    btnLogin.text = "Sign in"
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@LoginActivity,
                    "Network error. Please check your connection.",
                    Toast.LENGTH_SHORT
                ).show()
                btnLogin.isEnabled = true
                btnLogin.text = "Sign in"
            }
        }
    }
}