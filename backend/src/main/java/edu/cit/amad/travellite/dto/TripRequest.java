package edu.cit.amad.travellite.dto;

import java.math.BigDecimal;
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

    public TripRequest() {}

    public static class Builder {
        private String title;
        private String destination;
        private String origin;
        private LocalDate startDate;
        private LocalDate endDate;
        private List<BudgetItemRequest> budgetItems;
        private List<PlaceRequest> places;
        private List<ChecklistItemRequest> checklistItems;
        private List<CompanionRequest> companions;

        public Builder title(String title) {
            this.title = title;
            return this;
        }
        public Builder destination(String destination) {
            this.destination = destination;
            return this;
        }
        public Builder origin(String origin) {
            this.origin = origin;
            return this;
        }
        public Builder startDate(LocalDate startDate) {
            this.startDate = startDate;
            return this;
        }
        public Builder endDate(LocalDate endDate) {
            this.endDate = endDate;
            return this;
        }
        public Builder budgetItems(List<BudgetItemRequest> budgetItems) {
            this.budgetItems = budgetItems;
            return this;
        }
        public Builder places(List<PlaceRequest> places) {
            this.places = places;
            return this;
        }
        public Builder checklistItems(List<ChecklistItemRequest> checklistItems) {
            this.checklistItems = checklistItems;
            return this;
        }
        public Builder companions(List<CompanionRequest> companions) {
            this.companions = companions;
            return this;
        }

        public TripRequest build() {
            TripRequest req = new TripRequest();
            req.title = this.title;
            req.destination = this.destination;
            req.origin = this.origin;
            req.startDate = this.startDate;
            req.endDate = this.endDate;
            req.budgetItems = this.budgetItems;
            req.places = this.places;
            req.checklistItems = this.checklistItems;
            req.companions = this.companions;
            return req;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class BudgetItemRequest {
        private String category;
        private BigDecimal amount;
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
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