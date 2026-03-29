package com.cloudbite.controller;

import com.cloudbite.dto.PaymentResponseDto;
import com.cloudbite.dto.PaymentVerifyDto;
import com.cloudbite.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order/{orderId}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<?> createOrder(@PathVariable Long orderId, Authentication authentication) {
        try {
            PaymentResponseDto response = paymentService.createRazorpayOrder(orderId /*, authentication.getName()*/);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating Razorpay order"));
        }
    }

    @PostMapping("/verify")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyDto dto, Authentication authentication) {
        try {
            boolean isValid = paymentService.verifyPayment(dto /*, authentication.getName()*/);
            if (isValid) {
                return ResponseEntity.ok(Map.of("message", "Payment verified successfully"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Payment verification failed"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error verifying payment"));
        }
    }
}
