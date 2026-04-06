package edu.cit.amad.travellite.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class TripResponse {

    private Integer tripId;
    private String title;
    private String destination;
    private String origin;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long duration;
    private BigDecimal totalExpenses;
    private LocalDateTime createdAt;
    private List<BudgetItemResponse> budgetItems;
    private List<PlaceResponse> places;
    private List<ChecklistItemResponse> checklistItems;
    private List<CompanionResponse> companions;

    // Nested classes
    public static class BudgetItemResponse {
        private Integer budgetId;
        private String category;
        private BigDecimal amount;

        public Integer getBudgetId() { return budgetId; }
        public void setBudgetId(Integer budgetId) { this.budgetId = budgetId; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }

    public static class PlaceResponse {
        private Integer placeId;
        private String name;

        public Integer getPlaceId() { return placeId; }
        public void setPlaceId(Integer placeId) { this.placeId = placeId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class ChecklistItemResponse {
        private Integer itemId;
        private String name;
        private Boolean isChecked;

        public Integer getItemId() { return itemId; }
        public void setItemId(Integer itemId) { this.itemId = itemId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Boolean getIsChecked() { return isChecked; }
        public void setIsChecked(Boolean isChecked) { this.isChecked = isChecked; }
    }

    public static class CompanionResponse {
        private Integer companionId;
        private String firstName;
        private String lastName;
        private String email;

        public Integer getCompanionId() { return companionId; }
        public void setCompanionId(Integer companionId) { this.companionId = companionId; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    // Getters and Setters
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

    public Long getDuration() { return duration; }
    public void setDuration(Long duration) { this.duration = duration; }

    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<BudgetItemResponse> getBudgetItems() { return budgetItems; }
    public void setBudgetItems(List<BudgetItemResponse> budgetItems) { this.budgetItems = budgetItems; }

    public List<PlaceResponse> getPlaces() { return places; }
    public void setPlaces(List<PlaceResponse> places) { this.places = places; }

    public List<ChecklistItemResponse> getChecklistItems() { return checklistItems; }
    public void setChecklistItems(List<ChecklistItemResponse> checklistItems) { this.checklistItems = checklistItems; }

    public List<CompanionResponse> getCompanions() { return companions; }
    public void setCompanions(List<CompanionResponse> companions) { this.companions = companions; }
}