package edu.cit.amad.travellite

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import edu.cit.amad.travellite.utils.SessionManager

class DashboardActivity : AppCompatActivity() {

    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        sessionManager = SessionManager(this)

        if (!sessionManager.isLoggedIn()) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        val firstName = sessionManager.getFirstName() ?: "User"
        findViewById<TextView>(R.id.tvWelcome).text = "Welcome back, $firstName! 👋"

        findViewById<Button>(R.id.btnPlanNewTrip).setOnClickListener {
        }

        findViewById<Button>(R.id.btnLogout).setOnClickListener {
            sessionManager.clearSession()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
}