package com.cloudbite.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Kitchen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ Cloud Kitchen Name
    @Column(nullable = false)
    private String name;

    // ✅ Owner Name (for quick access)
    private String ownerName;

    // ✅ Address
    @Column(nullable = false)
    private String address;

    // ✅ Description
    @Column(length = 2000)
    private String description;

    // ✅ Timings
    private String openingHours;
    private String closingHours;

    // ✅ Kitchen open/close status
    private boolean isOpen = true;

    // ✅ Profile Logo (Single Image URL)
    @Column(length = 1000)
    private String logoUrl;

    // ✅ Additional Images (e.g., menu or gallery)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "kitchen_images", joinColumns = @JoinColumn(name = "kitchen_id"))
    @Column(length = 1000)
    private List<String> images = new ArrayList<>();

    // ✅ Owner Relationship
    @OneToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    // ✅ Foods, Categories, and Orders
    @OneToMany(mappedBy = "kitchen", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("kitchen")
    private List<Food> foods = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "kitchen", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> categories = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "kitchen", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    // ✅ Timestamps
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ✅ Custom setters for clarity (optional but clean)
    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getLogoUrl() {
        return this.logoUrl;
    }
}
