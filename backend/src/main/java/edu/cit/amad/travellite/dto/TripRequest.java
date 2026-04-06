package edu.cit.amad.travellite.dto;

import java.time.LocalDate;
import java.util.List;

public class TripRequest {

    private String title;
    private String destination;
    private String origin;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<BudgetItemRequest> budgetItems;
    private List<PlaceRequest> places;
    private List<ChecklistItemRequest> checklistItems;
    private List<CompanionRequest> companions;

    public static class BudgetItemRequest {
        private String category;
        private java.math.BigDecimal amount;

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public java.math.BigDecimal getAmount() { return amount; }
        public void setAmount(java.math.BigDecimal amount) { this.amount = amount; }
    }

    public static class PlaceRequest {
        private String name;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class ChecklistItemRequest {
        private String name;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class CompanionRequest {
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

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

    public List<BudgetItemRequest> getBudgetItems() { return budgetItems; }
    public void setBudgetItems(List<BudgetItemRequest> budgetItems) { this.budgetItems = budgetItems; }

    public List<PlaceRequest> getPlaces() { return places; }
    public void setPlaces(List<PlaceRequest> places) { this.places = places; }

    public List<ChecklistItemRequest> getChecklistItems() { return checklistItems; }
    public void setChecklistItems(List<ChecklistItemRequest> checklistItems) { this.checklistItems = checklistItems; }

    public List<CompanionRequest> getCompanions() { return companions; }
    public void setCompanions(List<CompanionRequest> companions) { this.companions = companions; }
}