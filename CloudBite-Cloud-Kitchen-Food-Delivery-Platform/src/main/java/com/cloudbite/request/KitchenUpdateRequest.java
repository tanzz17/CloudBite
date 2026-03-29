package com.cloudbite.request;

import org.springframework.web.multipart.MultipartFile;

public class KitchenUpdateRequest {

    private String name;
    private String address;  // fixed lowercase naming for consistency
    private String description;
    private String openingHours;
    private String closingHours;
    private boolean open;

    // ✅ optional: in case you want to update logo separately or via form
    private MultipartFile image;
    private String logoUrl; // optional text link if already uploaded logo

    // ===== Getters and Setters =====

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOpeningHours() {
        return openingHours;
    }

    public void setOpeningHours(String openingHours) {
        this.openingHours = openingHours;
    }

    public String getClosingHours() {
        return closingHours;
    }

    public void setClosingHours(String closingHours) {
        this.closingHours = closingHours;
    }

    public boolean isOpen() {
        return open;
    }

    public void setOpen(boolean open) {
        this.open = open;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
}
