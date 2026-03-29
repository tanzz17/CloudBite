package com.cloudbite.response;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KitchenResponse {
    private Long id;
    private String name;           // ✅ match frontend key
    private String description;
    private Long ownerId;
    private String ownerName;
    private String address;
    private String openingHours;
    private String closingHours;
    private boolean isOpen;
    @Column(length = 1000)
    private String logoUrl;
    private List<String> images;   // ✅ Gallery images list (ADDED NOW ✅)




}
