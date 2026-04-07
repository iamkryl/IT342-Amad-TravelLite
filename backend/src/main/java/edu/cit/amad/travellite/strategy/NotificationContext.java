package edu.cit.amad.travellite.strategy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class NotificationContext {

    private NotificationStrategy strategy;

    @Autowired
    public NotificationContext(
            @Qualifier("emailNotification") NotificationStrategy strategy) {
        this.strategy = strategy;
    }

    public void setStrategy(NotificationStrategy strategy) {
        this.strategy = strategy;
    }

    public void notify(String recipient, String subject, String message) {
        strategy.sendNotification(recipient, subject, message);
    }
}