package edu.cit.amad.travellite.strategy;

import org.springframework.stereotype.Component;

@Component("logNotification")
public class LogNotificationStrategy implements NotificationStrategy {

    @Override
    public void sendNotification(String recipient, String subject, String message) {
        System.out.println("[LOG NOTIFICATION]"
                + " To: " + recipient
                + " | Subject: " + subject
                + " | Message: " + message);
    }
}