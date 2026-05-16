package edu.cit.amad.travellite.shared;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component("emailNotification")
public class EmailNotificationStrategy implements NotificationStrategy {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendNotification(String recipient, String subject, String message) {
        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(recipient);
        email.setSubject(subject);
        email.setText(message);
        mailSender.send(email);
    }
}