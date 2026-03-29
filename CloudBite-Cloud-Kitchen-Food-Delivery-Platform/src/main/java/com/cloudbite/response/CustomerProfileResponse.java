package com.cloudbite.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerProfileResponse {
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String place;
    private String postalCode;
}
