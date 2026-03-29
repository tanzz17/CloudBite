package com.cloudbite.controller;

import com.cloudbite.dto.DeliveryOrderResponse;
import com.cloudbite.model.DeliveryPartner;
import com.cloudbite.model.OrderStatus;
import com.cloudbite.service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
@PreAuthorize("hasAuthority('ROLE_DELIVERY_PARTNER')")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @GetMapping("/orders/active")
    public ResponseEntity<?> getActiveOrders(Authentication authentication) {
        return ResponseEntity.ok(
                deliveryService.getActiveOrders(authentication.getName())
        );
    }

    @GetMapping("/orders/history")
    public ResponseEntity<List<DeliveryOrderResponse>> getOrderHistory(Authentication authentication) {
        List<DeliveryOrderResponse> history = deliveryService.getOrderHistory(authentication.getName());
        return ResponseEntity.ok(history);
    }

    
    @GetMapping("/orders/available-for-delivery")
    public ResponseEntity<List<DeliveryOrderResponse>> getAvailableOrders() {
        List<DeliveryOrderResponse> available = deliveryService.getAvailableOrders();
        return ResponseEntity.ok(available);
    }

    @PostMapping("/orders/{orderId}/accept")
    public ResponseEntity<?> acceptOrder(
            @PathVariable Long orderId,
            Authentication authentication
    ) {
        try {
            DeliveryOrderResponse response = deliveryService.acceptOrderAndReturnDto(
                    orderId,
                    authentication.getName()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status,
            Authentication authentication
    ) {
        if (status != OrderStatus.DELIVERED && status != OrderStatus.OUT_FOR_DELIVERY) {
            return ResponseEntity.badRequest().body("Partners can only mark OUT_FOR_DELIVERY or DELIVERED");
        }

        try {
            DeliveryOrderResponse response = deliveryService.updateStatusAndReturnDto(
                    orderId,
                    status,
                    authentication.getName()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/orders/{orderId}/location")
    public ResponseEntity<?> updateRiderLocation(
            @PathVariable Long orderId,
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(required = false) Double heading,
            @RequestParam(required = false) Double speed,
            Authentication authentication
    ) {
        try {
            deliveryService.updateRiderLocation(orderId, authentication.getName(), lat, lng, heading, speed);
            return ResponseEntity.ok("Location updated");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/online")
    public ResponseEntity<?> goOnline(Authentication authentication) {
        deliveryService.goOnline(authentication.getName());
        return ResponseEntity.ok("You are now AVAILABLE");
    }

    @PutMapping("/offline")
    public ResponseEntity<?> goOffline(Authentication authentication) {
        deliveryService.goOffline(authentication.getName());
        return ResponseEntity.ok("You are now OFFLINE");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        DeliveryPartner partner = deliveryService.getProfile(authentication.getName());
        return ResponseEntity.ok(partner);
    }
}


