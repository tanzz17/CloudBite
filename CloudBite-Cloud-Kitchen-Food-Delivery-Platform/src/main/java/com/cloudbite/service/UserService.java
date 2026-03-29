package com.cloudbite.service;

import com.cloudbite.model.User;

public interface UserService {
    User findUserById(Long id);
    User findUserByEmail(String email);
    User saveUser(User user); // ← this line causes the error if not implemented
    User findUserByJwt(String jwt);

}
