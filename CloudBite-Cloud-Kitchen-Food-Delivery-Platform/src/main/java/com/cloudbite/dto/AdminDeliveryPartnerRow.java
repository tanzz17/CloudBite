package com.cloudbite.dto;

import com.cloudbite.model.DeliveryPartnerStatus;

public record AdminDeliveryPartnerRow(
        Long id,
        String fullName,
        String email,
        String phone,
        String vehicleType,
        DeliveryPartnerStatus status
) {
}
