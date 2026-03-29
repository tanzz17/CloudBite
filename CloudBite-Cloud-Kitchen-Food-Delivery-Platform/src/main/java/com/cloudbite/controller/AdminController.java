package com.cloudbite.controller;

import com.cloudbite.dto.DeliveryPartnerRequest;
import com.cloudbite.model.*;
import com.cloudbite.repository.DeliveryPartnerRepository;
import com.cloudbite.repository.OrderRepository;
import com.cloudbite.repository.UserRepository;
import com.cloudbite.service.KitchenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private KitchenService kitchenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DeliveryPartnerRepository deliveryPartnerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Autowired
    private OrderRepository orderRepository; // Inject this for stats

    // ✅ NEW: Unified Dashboard Stats for React Frontend
    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Total Kitchens
        long totalKitchens = kitchenService.getAllKitchens().size();

        // 2. Active Partners (Count those who are not OFFLINE)
        long activePartners = deliveryPartnerRepository.findAll().stream()
                .filter(p -> p.getStatus() != DeliveryPartnerStatus.OFFLINE)
                .count();

        // 3. Total Orders
        List<Order> allOrders = orderRepository.findAll();
        long totalOrders = allOrders.size();

        // 4. Total Revenue (Summing up totalPrice from all orders)
        double totalRevenue = allOrders.stream()
                .mapToDouble(order -> order.getTotalPrice() != null ? order.getTotalPrice() : 0.0)
                .sum();

        stats.put("totalKitchens", totalKitchens);
        stats.put("activePartners", activePartners);
        stats.put("totalOrders", totalOrders);
        stats.put("revenue", totalRevenue);

        return ResponseEntity.ok(stats);
    }


    // ✅ Register a new kitchen and assign an existing owner (admin only)
    @PostMapping("/register-kitchen")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> registerKitchen(
            @RequestBody Kitchen kitchen,
            @RequestParam("ownerEmail") String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail);

        if (owner == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ No user found with email: " + ownerEmail);
        }

        // If not already a kitchen owner → make them one
        if (owner.getRole() != USER_ROLE.ROLE_KITCHEN_OWNER) {
            owner.setRole(USER_ROLE.ROLE_KITCHEN_OWNER);
        }

        // ⏰ Set creation time and status
        kitchen.setCreatedAt(LocalDateTime.now());
        kitchen.setOpen(true);

        // Link owner <-> kitchen both ways
        kitchen.setOwner(owner);
        owner.setKitchen(kitchen);

        // Save kitchen first (to generate ID), then owner to update relationship
        Kitchen savedKitchen = kitchenService.registerKitchen(kitchen, owner);
        userRepository.save(owner);

        return new ResponseEntity<>(savedKitchen, HttpStatus.CREATED);
    }

//    // ✅ Get all kitchens (for admin dashboard)
//    @GetMapping("/kitchens")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
//    public ResponseEntity<List<Kitchen>> getAllKitchens() {
//        List<Kitchen> kitchens = kitchenService.getAllKitchens();
//        return ResponseEntity.ok(kitchens);
//    }
//
//    // ✅ Get a specific kitchen by ID
//    @GetMapping("/kitchens/{id}")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
//    public ResponseEntity<?> getKitchenById(@PathVariable Long id) {
//        try {
//            Kitchen kitchen = kitchenService.getKitchenById(id);
//            return ResponseEntity.ok(kitchen);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body("❌ Kitchen not found with ID: " + id);
//        }
//    }

    // ✅ Search kitchens by name/keyword
    @GetMapping("/kitchens/search")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> searchKitchens(@RequestParam("keyword") String keyword) {
        List<Kitchen> kitchens = kitchenService.searchKitchens(keyword);
        if (kitchens.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("❌ No kitchens found matching: " + keyword);
        }
        return ResponseEntity.ok(kitchens);
    }

//    // ✅ Delete a kitchen by ID
//    @DeleteMapping("/kitchens/{id}")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
//    public ResponseEntity<String> deleteKitchen(@PathVariable Long id) {
//        try {
//            kitchenService.deleteKitchen(id);
//            return ResponseEntity.ok("✅ Kitchen deleted successfully");
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body("❌ Kitchen not found with ID: " + id);
//        }
//    }

    // ✅ Get all registered users (for admin panel)
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }


    @PostMapping("/register-delivery-partner")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> registerDeliveryPartner(
            @RequestBody DeliveryPartnerRequest request
    ) {

        // 1️⃣ Check if user exists
        User existing = userRepository.findByEmail(request.getEmail());
        if (existing != null) {
            return ResponseEntity.badRequest()
                    .body("User already exists with email: " + request.getEmail());
        }

        // 2️⃣ Create User
        User user = new User();
        user.setFullName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(USER_ROLE.ROLE_DELIVERY_PARTNER);

        userRepository.save(user);

        // 3️⃣ Create Delivery Partner
        DeliveryPartner partner = new DeliveryPartner();
        partner.setUser(user);
        partner.setPhone(request.getPhone());
        partner.setVehicleType(request.getVehicleType());
        partner.setStatus(DeliveryPartnerStatus.OFFLINE);

        // ✅ THIS IS NOW CORRECT
        deliveryPartnerRepository.save(partner);

        return ResponseEntity.ok("Delivery partner registered successfully");
    }

// ================= DELIVERY PARTNER MANAGEMENT =================

    @GetMapping("/delivery-partners")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<DeliveryPartner>> getAllDeliveryPartners() {
        return ResponseEntity.ok(deliveryPartnerRepository.findAll());
    }

    @PutMapping("/delivery-partners/{id}/offline")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> forceOffline(@PathVariable Long id) {
        DeliveryPartner partner = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        partner.setStatus(DeliveryPartnerStatus.OFFLINE);
        deliveryPartnerRepository.save(partner);

        return ResponseEntity.ok("Partner forced offline");
    }


    @DeleteMapping("/delivery-partners/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteDeliveryPartner(@PathVariable Long id) {
        DeliveryPartner partner = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        User user = partner.getUser();

        // TODO: Add real active-order check from OrderRepository before delete
        // if (hasActiveOrder) return ResponseEntity.status(HttpStatus.CONFLICT).body("Partner has active orders");

        deliveryPartnerRepository.delete(partner);

        if (user != null) {
            userRepository.delete(user);
        }

        return ResponseEntity.ok("Delivery partner deleted successfully");
    }


}
