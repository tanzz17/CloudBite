package com.cloudbite.controller;

import com.cloudbite.dto.LocationResponseDto;
import com.cloudbite.model.Order;
import com.cloudbite.repository.OrderRepository;
import com.cloudbite.service.DeliveryLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
public class DeliveryLocationController {

    private final DeliveryLocationService locationService;
    private final OrderRepository orderRepository;

    /**
     * Customer polls this every 4 seconds.
     * GET /api/location/{orderId}
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<LocationResponseDto> getLocation(@PathVariable Long orderId) {
        try {
            Order order = orderRepository.findByIdWithDetails(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
            return ResponseEntity.ok(locationService.getSimulatedLocation(order));
        } catch (Exception e) {
            System.err.println("Location fetch failed for order " + orderId + ": " + e.getMessage());
            return ResponseEntity.status(404).build();
        }
    }
}
