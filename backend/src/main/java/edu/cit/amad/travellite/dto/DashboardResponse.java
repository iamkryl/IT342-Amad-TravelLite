package edu.cit.amad.travellite.dto;

import java.math.BigDecimal;

public class DashboardResponse {

    private Integer totalTrips;
    private BigDecimal overallExpense;
    private Integer upcomingTravelsCount;

    // Getters and Setters
    public Integer getTotalTrips() { return totalTrips; }
    public void setTotalTrips(Integer totalTrips) { this.totalTrips = totalTrips; }

    public BigDecimal getOverallExpense() { return overallExpense; }
    public void setOverallExpense(BigDecimal overallExpense) { this.overallExpense = overallExpense; }

    public Integer getUpcomingTravelsCount() { return upcomingTravelsCount; }
    public void setUpcomingTravelsCount(Integer upcomingTravelsCount) { this.upcomingTravelsCount = upcomingTravelsCount; }
}