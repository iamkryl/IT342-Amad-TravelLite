package edu.cit.amad.travellite.trip;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetItemRepository extends JpaRepository<BudgetItem, Integer> {
    List<BudgetItem> findByTripTripId(Integer tripId);
}