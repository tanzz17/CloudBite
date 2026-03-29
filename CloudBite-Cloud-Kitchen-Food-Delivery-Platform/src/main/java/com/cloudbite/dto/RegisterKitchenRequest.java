package com.cloudbite.dto;

import lombok.Data;

@Data
public class RegisterKitchenRequest {
    private String ownerName;
    private String ownerEmail;
    private String password;
    private String Name;
    private String description;
    private String address;
}
