package com.cloudbite.dto;

import lombok.Data;

@Data
public class DeliveryPartnerRequest {
    private String Name;
    private String email;
    private String password;
    private String phone;
    private String vehicleType;
}
