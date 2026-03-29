package com.cloudbite.response;

import com.cloudbite.model.USER_ROLE;
import com.cloudbite.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String jwtToken;
    private String message;
    private USER_ROLE role;
    private User user;
}
