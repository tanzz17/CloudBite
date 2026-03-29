package com.cloudbite.request;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
    private String role;  // e.g. "ADMIN", "KITCHEN_OWNER", "CUSTOMER"

}
