package com.cloudbite.controller;

import com.cloudbite.model.Kitchen;
import com.cloudbite.model.USER_ROLE;
import com.cloudbite.model.User;
import com.cloudbite.repository.UserRepository;
import com.cloudbite.service.KitchenService;
import com.cloudbite.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KitchenService kitchenService;

    // ✅ Register a new user (Customer by default)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("❌ Email already registered: " + user.getEmail());
            }

            // Default role: CUSTOMER
            if (user.getRole() == null) {
                user.setRole(USER_ROLE.ROLE_CUSTOMER);
            }

            User savedUser = userService.saveUser(user);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error during registration: " + e.getMessage());
        }
    }

    // ✅ Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.findUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("❌ User not found with ID: " + id);
        }
    }

    // ✅ Get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        User user = userService.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("❌ User not found with email: " + email);
        }
        return ResponseEntity.ok(user);
    }

    // ✅ Update user profile (Customer or Kitchen Owner)
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            User existingUser = userService.findUserById(id);

            existingUser.setFullName(updatedUser.getFullName());
            existingUser.setEmail(updatedUser.getEmail());
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                existingUser.setPassword(updatedUser.getPassword());
            }

            userRepository.save(existingUser);
            return ResponseEntity.ok("✅ Profile updated successfully");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("❌ User not found or update failed: " + e.getMessage());
        }
    }

    // ✅ Get all users (Admin only)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // ✅ Get all customers (Admin only)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/customers")
    public ResponseEntity<List<User>> getAllCustomers() {
        List<User> customers = userRepository.findByRole(USER_ROLE.ROLE_CUSTOMER);
        return ResponseEntity.ok(customers);
    }

    // ✅ Get all kitchen owners (Admin only)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/owners")
    public ResponseEntity<List<User>> getAllKitchenOwners() {
        List<User> owners = userRepository.findByRole(USER_ROLE.ROLE_KITCHEN_OWNER);
        return ResponseEntity.ok(owners);
    }

    // ✅ Kitchen Owner → Get their own kitchen details
    @PreAuthorize("hasAuthority('ROLE_KITCHEN_OWNER')")
    @GetMapping("/my-kitchen/{email}")
    public ResponseEntity<?> getOwnerKitchen(@PathVariable String email) {
        try {
            User owner = userRepository.findByEmail(email);

            if (owner == null || owner.getKitchen() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("❌ No kitchen found for this owner.");
            }

            Kitchen kitchen = owner.getKitchen();
            return ResponseEntity.ok(kitchen);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ Failed to fetch kitchen details: " + e.getMessage());
        }
    }
}
