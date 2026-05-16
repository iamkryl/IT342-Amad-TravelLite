package edu.cit.amad.travellite.trip;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripCompanionRepository extends JpaRepository<TripCompanion, Integer> {
    List<TripCompanion> findByTripTripId(Integer tripId);
    boolean existsByTripTripIdAndUserUserId(Integer tripId, Long userId);
}