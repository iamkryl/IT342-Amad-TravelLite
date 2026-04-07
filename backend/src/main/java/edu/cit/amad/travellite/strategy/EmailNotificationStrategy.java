package edu.cit.amad.travellite.strategy;

import org.springframework.stereotype.Component;

@Component("emailNotification")
public class EmailNotificationStrategy implements NotificationStrategy {

    @Override
    public void sendNotification(String recipient, String subject, String message) {
        // Production: wire JavaMailSender here
        System.out.println("[EMAIL NOTIFICATION]");
        System.out.println("To: " + recipient);
        System.out.println("Subject: " + subject);
        System.out.println("Message: " + message);
    }
}