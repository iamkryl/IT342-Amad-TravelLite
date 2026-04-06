package edu.cit.amad.travellite.service;

import edu.cit.amad.travellite.dto.DashboardResponse;
import edu.cit.amad.travellite.dto.TripRequest;
import edu.cit.amad.travellite.dto.TripResponse;
import edu.cit.amad.travellite.entity.*;
import edu.cit.amad.travellite.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    @Autowired private TripRepository tripRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private BudgetItemRepository budgetItemRepository;
    @Autowired private PlaceRepository placeRepository;
    @Autowired private ChecklistItemRepository checklistItemRepository;
    @Autowired private TripCompanionRepository tripCompanionRepository;

    public List<TripResponse> getAllTrips(Long userId) {
        return tripRepository.findByUserUserId(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public TripResponse getTripById(Integer tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        return mapToResponse(trip);
    }

    public TripResponse createTrip(Long userId, TripRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Trip trip = new Trip();
        trip.setUser(user);
        trip.setTitle(request.getTitle());
        trip.setDestination(request.getDestination());
        trip.setOrigin(request.getOrigin());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        Trip savedTrip = tripRepository.save(trip);

        if (request.getBudgetItems() != null) {
            for (TripRequest.BudgetItemRequest b : request.getBudgetItems()) {
                BudgetItem item = new BudgetItem();
                item.setTrip(savedTrip);
                item.setCategory(b.getCategory());
                item.setAmount(b.getAmount());
                budgetItemRepository.save(item);
            }
        }

        if (request.getPlaces() != null) {
            for (TripRequest.PlaceRequest p : request.getPlaces()) {
                Place place = new Place();
                place.setTrip(savedTrip);
                place.setName(p.getName());
                placeRepository.save(place);
            }
        }

        if (request.getChecklistItems() != null) {
            for (TripRequest.ChecklistItemRequest c : request.getChecklistItems()) {
                ChecklistItem item = new ChecklistItem();
                item.setTrip(savedTrip);
                item.setName(c.getName());
                item.setIsChecked(false);
                checklistItemRepository.save(item);
            }
        }

        if (request.getCompanions() != null) {
            for (TripRequest.CompanionRequest c : request.getCompanions()) {
                userRepository.findByEmail(c.getEmail()).ifPresent(companionUser -> {
                    TripCompanion companion = new TripCompanion();
                    companion.setTrip(savedTrip);
                    companion.setUser(companionUser);
                    tripCompanionRepository.save(companion);
                });
            }
        }

        return mapToResponse(tripRepository.findById(savedTrip.getTripId()).get());
    }

    public TripResponse updateTrip(Integer tripId, TripRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        trip.setTitle(request.getTitle());
        trip.setDestination(request.getDestination());
        trip.setOrigin(request.getOrigin());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        tripRepository.save(trip);

        budgetItemRepository.deleteAll(budgetItemRepository.findByTripTripId(tripId));
        placeRepository.deleteAll(placeRepository.findByTripTripId(tripId));
        checklistItemRepository.deleteAll(checklistItemRepository.findByTripTripId(tripId));
        tripCompanionRepository.deleteAll(tripCompanionRepository.findByTripTripId(tripId));

        if (request.getBudgetItems() != null) {
            for (TripRequest.BudgetItemRequest b : request.getBudgetItems()) {
                BudgetItem item = new BudgetItem();
                item.setTrip(trip);
                item.setCategory(b.getCategory());
                item.setAmount(b.getAmount());
                budgetItemRepository.save(item);
            }
        }

        if (request.getPlaces() != null) {
            for (TripRequest.PlaceRequest p : request.getPlaces()) {
                Place place = new Place();
                place.setTrip(trip);
                place.setName(p.getName());
                placeRepository.save(place);
            }
        }

        if (request.getChecklistItems() != null) {
            for (TripRequest.ChecklistItemRequest c : request.getChecklistItems()) {
                ChecklistItem item = new ChecklistItem();
                item.setTrip(trip);
                item.setName(c.getName());
                item.setIsChecked(false);
                checklistItemRepository.save(item);
            }
        }

        if (request.getCompanions() != null) {
            for (TripRequest.CompanionRequest c : request.getCompanions()) {
                userRepository.findByEmail(c.getEmail()).ifPresent(companionUser -> {
                    TripCompanion companion = new TripCompanion();
                    companion.setTrip(trip);
                    companion.setUser(companionUser);
                    tripCompanionRepository.save(companion);
                });
            }
        }

        return mapToResponse(tripRepository.findById(tripId).get());
    }

    public void deleteTrip(Integer tripId) {
        tripRepository.deleteById(tripId);
    }

    public DashboardResponse getDashboard(Long userId) {
        List<Trip> trips = tripRepository.findByUserUserId(userId);
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Trip trip : trips) {
            List<BudgetItem> items = budgetItemRepository.findByTripTripId(trip.getTripId());
            for (BudgetItem item : items) {
                totalExpense = totalExpense.add(item.getAmount());
            }
        }

        List<Trip> upcoming = tripRepository.findByUserUserIdAndStartDateAfter(userId, LocalDate.now());

        DashboardResponse response = new DashboardResponse();
        response.setTotalTrips(trips.size());
        response.setOverallExpense(totalExpense);
        response.setUpcomingTravelsCount(upcoming.size());
        return response;
    }

    public List<TripResponse> getUpcomingTrips(Long userId) {
        return tripRepository.findByUserUserIdAndStartDateAfter(userId, LocalDate.now())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private TripResponse mapToResponse(Trip trip) {
        TripResponse response = new TripResponse();
        response.setTripId(trip.getTripId());
        response.setTitle(trip.getTitle());
        response.setDestination(trip.getDestination());
        response.setOrigin(trip.getOrigin());
        response.setStartDate(trip.getStartDate());
        response.setEndDate(trip.getEndDate());
        response.setCreatedAt(trip.getCreatedAt());

        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            response.setDuration(ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()));
        }

        List<BudgetItem> budgetItems = budgetItemRepository.findByTripTripId(trip.getTripId());
        BigDecimal total = budgetItems.stream()
                .map(BudgetItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalExpenses(total);

        response.setBudgetItems(budgetItems.stream().map(b -> {
            TripResponse.BudgetItemResponse br = new TripResponse.BudgetItemResponse();
            br.setBudgetId(b.getBudgetId());
            br.setCategory(b.getCategory());
            br.setAmount(b.getAmount());
            return br;
        }).collect(Collectors.toList()));

        List<Place> places = placeRepository.findByTripTripId(trip.getTripId());
        response.setPlaces(places.stream().map(p -> {
            TripResponse.PlaceResponse pr = new TripResponse.PlaceResponse();
            pr.setPlaceId(p.getPlaceId());
            pr.setName(p.getName());
            return pr;
        }).collect(Collectors.toList()));

        List<ChecklistItem> checklistItems = checklistItemRepository.findByTripTripId(trip.getTripId());
        response.setChecklistItems(checklistItems.stream().map(c -> {
            TripResponse.ChecklistItemResponse cr = new TripResponse.ChecklistItemResponse();
            cr.setItemId(c.getItemId());
            cr.setName(c.getName());
            cr.setIsChecked(c.getIsChecked());
            return cr;
        }).collect(Collectors.toList()));

        List<TripCompanion> companions = tripCompanionRepository.findByTripTripId(trip.getTripId());
        response.setCompanions(companions.stream().map(c -> {
            TripResponse.CompanionResponse cr = new TripResponse.CompanionResponse();
            cr.setCompanionId(c.getCompanionId());
            cr.setFirstName(c.getUser().getFirstName());
            cr.setLastName(c.getUser().getLastName());
            cr.setEmail(c.getUser().getEmail());
            return cr;
        }).collect(Collectors.toList()));

        return response;
    }
}