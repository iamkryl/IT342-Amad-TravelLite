package edu.cit.amad.travellite.shared;

public interface NotificationStrategy {
    void sendNotification(String recipient, String subject, String message);
}