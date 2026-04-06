package edu.cit.amad.travellite.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "checklist_items")
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Integer itemId;

    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private String name;

    @Column(name = "is_checked")
    private Boolean isChecked = false;

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Boolean getIsChecked() { return isChecked; }
    public void setIsChecked(Boolean isChecked) { this.isChecked = isChecked; }
}