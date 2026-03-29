package com.cloudbite.controller;

import com.cloudbite.dto.OrderResponse;
import com.cloudbite.dto.PaymentResponseDto;
import com.cloudbite.model.Address;
import com.cloudbite.model.Customer;
import com.cloudbite.repository.AddressRepository;
import com.cloudbite.service.CustomerService;
import com.cloudbite.service.OrderService;
import com.cloudbite.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private AddressRepository addressRepo;

    @Autowired
    private PaymentService paymentService;  // NEW

    // 1. Place an order (Customer) — handles saved or new address
    @PostMapping("/place/{userId}")
    public ResponseEntity<?> placeOrder(
            @PathVariable Long userId,
            @RequestParam(required = false) String deliveryAddress,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String place,
            @RequestParam(required = false) String postalCode
    ) {
        try {
            Customer customer = customerService.getCustomerByUserId(userId);
            if (customer == null) {
                return ResponseEntity.badRequest().body("Customer not found for this user.");
            }

            String finalAddress = (deliveryAddress != null && !deliveryAddress.isEmpty())
                    ? deliveryAddress
                    : String.format("%s, %s - %s",
                    customer.getAddress() != null ? customer.getAddress() : "N/A",
                    customer.getPlace() != null ? customer.getPlace() : "N/A",
                    customer.getPostalCode() != null ? customer.getPostalCode() : "N/A"
            );

            if (deliveryAddress != null && !deliveryAddress.isEmpty()) {
                boolean exists = addressRepo.existsByCustomerAndStreetIgnoreCase(customer, deliveryAddress);
                if (!exists) {
                    Address newAddress = new Address();
                    newAddress.setCustomer(customer);
                    newAddress.setFullName(customer.getUser().getFullName());
                    newAddress.setStreet(deliveryAddress);
                    newAddress.setCity(place != null ? place : customer.getPlace());
                    newAddress.setPostalCode(postalCode != null ? postalCode : customer.getPostalCode());
                    addressRepo.save(newAddress);
                }
            }

            OrderResponse orderResponse = orderService.placeOrder(customer, finalAddress);
            return ResponseEntity.ok(orderResponse);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error placing order: " + e.getMessage());
        }
    }

    // 2. Get all orders for a specific customer
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getOrdersByCustomer(@PathVariable Long customerId) {
        try {
            List<OrderResponse> orders = orderService.getOrdersByCustomer(customerId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching customer orders: " + e.getMessage());
        }
    }

    // 3. Get all orders for a specific kitchen (for kitchen owner)
    @GetMapping("/kitchen/{kitchenId}")
    public ResponseEntity<?> getOrdersByKitchen(@PathVariable Long kitchenId) {
        try {
            List<OrderResponse> orders = orderService.getOrdersByKitchen(kitchenId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching kitchen orders: " + e.getMessage());
        }
    }

    // 4. Get all orders for a specific user (through customer)
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(@PathVariable Long userId) {
        try {
            List<OrderResponse> orders = orderService.getOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fetching user orders: " + e.getMessage());
        }
    }

    // 5. Get single order details
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
        try {
            OrderResponse order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching order details: " + e.getMessage());
        }
    }

    // 6. Update order status (for kitchen/admin)
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status
    ) {
        try {
            OrderResponse updated = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid order status");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 7. Get all orders (admin)
    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<OrderResponse> orders = orderService.getAllOrdersForAdmin();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching all orders: " + e.getMessage());
        }
    }

    // 8. Reorder slider data (Customer side)
    @GetMapping("/reorder/{userId}")
    public ResponseEntity<?> getReorderItems(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(orderService.getReorderItems(userId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fetching reorder items");
        }
    }

    // 9. NEW: Retry payment for a PAYMENT_PENDING order
    @PostMapping("/{orderId}/retry-payment")
    public ResponseEntity<?> retryPayment(@PathVariable Long orderId) {
        try {
            PaymentResponseDto response = paymentService.createRazorpayOrder(orderId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error retrying payment: " + e.getMessage());
        }
    }
}