package edu.cit.amad.travellite.repository;

import edu.cit.amad.travellite.entity.TripCompanion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripCompanionRepository extends JpaRepository<TripCompanion, Integer> {
    List<TripCompanion> findByTripTripId(Integer tripId);
}