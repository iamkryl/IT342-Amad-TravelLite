package edu.cit.amad.travellite.admin;

public class AdminDashboardResponse {

    private long totalUsers;
    private long totalTrips;

    public AdminDashboardResponse(long totalUsers, long totalTrips) {
        this.totalUsers = totalUsers;
        this.totalTrips = totalTrips;
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalTrips() { return totalTrips; }
    public void setTotalTrips(long totalTrips) { this.totalTrips = totalTrips; }
}