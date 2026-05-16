package edu.cit.amad.travellite.trip;

import edu.cit.amad.travellite.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import edu.cit.amad.travellite.shared.NotificationContext;

@Service
public class TripFacade {

    @Autowired private BudgetItemRepository budgetItemRepository;
    @Autowired private PlaceRepository placeRepository;
    @Autowired private ChecklistItemRepository checklistItemRepository;
    @Autowired private TripCompanionRepository tripCompanionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationContext notificationContext;

    public void saveTripComponents(Trip savedTrip, TripRequest request) {
        saveBudgetItems(savedTrip, request);
        savePlaces(savedTrip, request);
        saveChecklistItems(savedTrip, request);
        saveCompanions(savedTrip, request);
    }

    public void updateTripComponents(Trip trip, TripRequest request) {
        clearTripComponents(trip.getTripId());
        saveTripComponents(trip, request);
    }

    private void clearTripComponents(Integer tripId) {
        budgetItemRepository.deleteAll(budgetItemRepository.findByTripTripId(tripId));
        placeRepository.deleteAll(placeRepository.findByTripTripId(tripId));
        checklistItemRepository.deleteAll(checklistItemRepository.findByTripTripId(tripId));
        tripCompanionRepository.deleteAll(tripCompanionRepository.findByTripTripId(tripId));
    }

    private void saveBudgetItems(Trip trip, TripRequest request) {
        if (request.getBudgetItems() == null) return;
        for (TripRequest.BudgetItemRequest b : request.getBudgetItems()) {
            BudgetItem item = new BudgetItem();
            item.setTrip(trip);
            item.setCategory(b.getCategory());
            item.setAmount(b.getAmount());
            budgetItemRepository.save(item);
        }
    }

    private void savePlaces(Trip trip, TripRequest request) {
        if (request.getPlaces() == null) return;
        for (TripRequest.PlaceRequest p : request.getPlaces()) {
            Place place = new Place();
            place.setTrip(trip);
            place.setName(p.getName());
            placeRepository.save(place);
        }
    }

    private void saveChecklistItems(Trip trip, TripRequest request) {
        if (request.getChecklistItems() == null) return;
        for (TripRequest.ChecklistItemRequest c : request.getChecklistItems()) {
            ChecklistItem item = new ChecklistItem();
            item.setTrip(trip);
            item.setName(c.getName());
            item.setIsChecked(false);
            checklistItemRepository.save(item);
        }
    }

    private void saveCompanions(Trip trip, TripRequest request) {
        if (request.getCompanions() == null) return;
        String ownerEmail = trip.getUser().getEmail();
        String ownerName = trip.getUser().getFirstName() + " " + trip.getUser().getLastName();
        for (TripRequest.CompanionRequest c : request.getCompanions()) {
            if (c.getEmail().equalsIgnoreCase(ownerEmail)) continue;
            userRepository.findByEmail(c.getEmail()).ifPresent(companionUser -> {
                TripCompanion companion = new TripCompanion();
                companion.setTrip(trip);
                companion.setUser(companionUser);
                tripCompanionRepository.save(companion);

                notificationContext.notify(
                        c.getEmail(),
                        "You've been added to a trip on TravelLite!",
                        "Hi " + companionUser.getFirstName() + "!\n\n" +
                                ownerName + " has added you as a travel companion for the trip:\n" +
                                "🌍 " + trip.getTitle() + "\n" +
                                "📍 " + trip.getOrigin() + " → " + trip.getDestination() + "\n" +
                                "📅 " + trip.getStartDate() + " to " + trip.getEndDate() + "\n\n" +
                                "Log in to your TravelLite account to view the full trip details.\n\n" +
                                "Safe travels!\n" +
                                "The TravelLite Team"
                );
            });
        }
    }
}