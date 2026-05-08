package edu.cit.amad.travellite.admin;

import edu.cit.amad.travellite.trip.TripRepository;
import edu.cit.amad.travellite.user.UserRepository;
import edu.cit.amad.travellite.trip.Trip;
import edu.cit.amad.travellite.user.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    public AdminService(UserRepository userRepository, TripRepository tripRepository) {
        this.userRepository = userRepository;
        this.tripRepository = tripRepository;
    }

    public AdminDashboardResponse getDashboard() {
        long totalUsers = userRepository.count();
        long totalTrips = tripRepository.count();
        return new AdminDashboardResponse(totalUsers, totalTrips);
    }

    public List<AdminUserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(u -> new AdminUserResponse(
                        u.getUserId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEmail(),
                        u.getIsActive()
                ))
                .collect(Collectors.toList());
    }

    public void suspendUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public List<AdminTripResponse> getAllTrips() {
        List<Trip> trips = tripRepository.findAll();
        return trips.stream()
                .map(t -> new AdminTripResponse(
                        t.getTripId(),
                        t.getTitle(),
                        t.getDestination(),
                        t.getOrigin(),
                        t.getStartDate(),
                        t.getEndDate(),
                        t.getUser().getFirstName() + " " + t.getUser().getLastName()
                ))
                .collect(Collectors.toList());
    }

    public AdminTripResponse getTripById(Integer tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        return new AdminTripResponse(
                trip.getTripId(),
                trip.getTitle(),
                trip.getDestination(),
                trip.getOrigin(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getUser().getFirstName() + " " + trip.getUser().getLastName()
        );
    }

    public void deleteTrip(Integer tripId) {
        tripRepository.deleteById(tripId);
    }
}