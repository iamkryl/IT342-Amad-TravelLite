package edu.cit.amad.travellite

import android.content.Intent
import android.os.Bundle
import android.text.InputType
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import edu.cit.amad.travellite.api.RetrofitClient
import edu.cit.amad.travellite.model.RegisterRequest
import edu.cit.amad.travellite.utils.SessionManager
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {

    private lateinit var etFirstName: EditText
    private lateinit var etLastName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var cbTerms: CheckBox
    private lateinit var btnRegister: Button
    private lateinit var tvLogin: TextView
    private lateinit var ivTogglePassword: ImageView
    private lateinit var ivToggleConfirmPassword: ImageView
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        sessionManager = SessionManager(this)

        etFirstName = findViewById(R.id.etFirstName)
        etLastName = findViewById(R.id.etLastName)
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        cbTerms = findViewById(R.id.cbTerms)
        btnRegister = findViewById(R.id.btnRegister)
        tvLogin = findViewById(R.id.tvLogin)
        ivTogglePassword = findViewById(R.id.ivTogglePassword)
        ivToggleConfirmPassword = findViewById(R.id.ivToggleConfirmPassword)

        var isPasswordVisible = false
        ivTogglePassword.setOnClickListener {
            isPasswordVisible = !isPasswordVisible
            if (isPasswordVisible) {
                etPassword.inputType = InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
                ivTogglePassword.setImageResource(R.drawable.ic_eye_off)
            } else {
                etPassword.inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
                ivTogglePassword.setImageResource(R.drawable.ic_eye)
            }
            etPassword.setSelection(etPassword.text.length)
        }

        var isConfirmPasswordVisible = false
        ivToggleConfirmPassword.setOnClickListener {
            isConfirmPasswordVisible = !isConfirmPasswordVisible
            if (isConfirmPasswordVisible) {
                etConfirmPassword.inputType = InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
                ivToggleConfirmPassword.setImageResource(R.drawable.ic_eye_off)
            } else {
                etConfirmPassword.inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
                ivToggleConfirmPassword.setImageResource(R.drawable.ic_eye)
            }
            etConfirmPassword.setSelection(etConfirmPassword.text.length)
        }

        btnRegister.setOnClickListener {
            handleRegister()
        }

        tvLogin.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }

    private fun handleRegister() {
        val firstName = etFirstName.text.toString().trim()
        val lastName = etLastName.text.toString().trim()
        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString().trim()
        val confirmPassword = etConfirmPassword.text.toString().trim()

        if (firstName.isEmpty()) { etFirstName.error = "First name is required"; return }
        if (lastName.isEmpty()) { etLastName.error = "Last name is required"; return }
        val emailRegex = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.(com|net|org|edu|gov|io|dev|app|ph|co\\.ph|edu\\.ph|com\\.ph)$", RegexOption.IGNORE_CASE)
        if (email.isEmpty() || !emailRegex.matches(email)) {
            etEmail.error = "Enter a valid email address"
            return
        }
        if (password.length < 8) { etPassword.error = "Password must be at least 8 characters"; return }
        if (password != confirmPassword) { etConfirmPassword.error = "Passwords do not match"; return }
        if (!cbTerms.isChecked) {
            Toast.makeText(this, "Please agree to the Terms of Service", Toast.LENGTH_SHORT).show()
            return
        }

        btnRegister.isEnabled = false
        btnRegister.text = "Creating account..."

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.register(
                    RegisterRequest(
                        firstName = firstName,
                        lastName = lastName,
                        email = email,
                        password = password
                    )
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
                    Toast.makeText(this@RegisterActivity,
                        "Account created successfully!", Toast.LENGTH_SHORT).show()
                    startActivity(Intent(this@RegisterActivity, DashboardActivity::class.java))
                    finish()
                } else {
                    val errorCode = response.body()?.error?.code
                    val errorMessage = response.body()?.error?.message
                        ?: "Registration failed. Please try again."

                    when (errorCode) {
                        "DB-002" -> etEmail.error = "Email already exists"
                        "VALID-001" -> Toast.makeText(this@RegisterActivity, errorMessage, Toast.LENGTH_SHORT).show()
                        else -> Toast.makeText(this@RegisterActivity, errorMessage, Toast.LENGTH_SHORT).show()
                    }

                    btnRegister.isEnabled = true
                    btnRegister.text = "Create account"
                }
            } catch (e: Exception) {
                Toast.makeText(this@RegisterActivity,
                    "Network error. Please check your connection.", Toast.LENGTH_SHORT).show()
                btnRegister.isEnabled = true
                btnRegister.text = "Create account"
            }
        }
    }
}