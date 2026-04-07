package edu.cit.amad.travellite.service;

import edu.cit.amad.travellite.dto.TripRequest;
import edu.cit.amad.travellite.entity.*;
import edu.cit.amad.travellite.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import edu.cit.amad.travellite.strategy.NotificationContext;

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
        for (TripRequest.CompanionRequest c : request.getCompanions()) {
            userRepository.findByEmail(c.getEmail()).ifPresent(companionUser -> {
                TripCompanion companion = new TripCompanion();
                companion.setTrip(trip);
                companion.setUser(companionUser);
                tripCompanionRepository.save(companion);

                notificationContext.notify(
                        c.getEmail(),
                        "You've been invited to a trip!",
                        "You have been added as a companion to: "
                                + trip.getTitle()
                                + ". Log in to TravelLite to view it."
                );
            });
        }
    }
}