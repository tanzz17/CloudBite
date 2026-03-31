package com.cloudbite.repository.projection;

public interface KitchenPublicRow {
    Long getId();
    String getName();
    String getDescription();
    String getAddress();
    String getOwnerName();
    String getOpeningHours();
    String getClosingHours();
    Boolean getOpen();
    String getLogoUrl();
}
