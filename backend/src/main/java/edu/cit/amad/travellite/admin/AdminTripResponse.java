package edu.cit.amad.travellite.admin;

import java.time.LocalDate;

public class AdminTripResponse {

    private Integer tripId;
    private String title;
    private String destination;
    private String origin;
    private LocalDate startDate;
    private LocalDate endDate;
    private String createdBy;

    public AdminTripResponse(Integer tripId, String title, String destination, String origin, LocalDate startDate, LocalDate endDate, String createdBy) {
        this.tripId = tripId;
        this.title = title;
        this.destination = destination;
        this.origin = origin;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdBy = createdBy;
    }

    public Integer getTripId() { return tripId; }
    public void setTripId(Integer tripId) { this.tripId = tripId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}