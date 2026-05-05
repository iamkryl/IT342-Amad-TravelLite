package edu.cit.amad.travellite.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendCompanionInvitation(String toEmail, String tripTitle, String ownerName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("You've been added to a trip on TravelLite!");
        message.setText(
                "Hi!\n\n" +
                        ownerName + " has added you as a travel companion for the trip: \"" + tripTitle + "\".\n\n" +
                        "Log in to your TravelLite account to view the trip details.\n\n" +
                        "Safe travels!\nThe TravelLite Team"
        );
        mailSender.send(message);
    }
}