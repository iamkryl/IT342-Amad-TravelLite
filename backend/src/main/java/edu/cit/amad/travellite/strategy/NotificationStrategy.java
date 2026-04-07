package edu.cit.amad.travellite.strategy;

public interface NotificationStrategy {
    void sendNotification(String recipient, String subject, String message);
}