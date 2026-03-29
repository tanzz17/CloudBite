package com.cloudbite.service.impl;

import com.cloudbite.model.Kitchen;
import com.cloudbite.model.USER_ROLE;
import com.cloudbite.model.User;
import com.cloudbite.repository.UserRepository;
import com.cloudbite.service.AdminService;
import com.cloudbite.service.KitchenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KitchenService kitchenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User createKitchenOwner(User owner) {
        owner.setRole(USER_ROLE.ROLE_KITCHEN_OWNER);
        owner.setPassword(passwordEncoder.encode(owner.getPassword()));
        return userRepository.save(owner);
    }

    @Override
    public Kitchen registerKitchen(Kitchen kitchen, User owner) {
        return kitchenService.registerKitchen(kitchen, owner);
    }
}
