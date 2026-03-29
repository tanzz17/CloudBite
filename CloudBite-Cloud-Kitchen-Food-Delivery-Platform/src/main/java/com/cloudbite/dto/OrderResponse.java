package com.cloudbite.dto;

import com.cloudbite.model.OrderStatus;
import com.cloudbite.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class OrderResponse {
    private Long orderId;
    private Long customerId;
    private String customerName;
    private Long kitchenId;
    private String kitchenName;
    private String deliveryAddress;
    private Double totalPrice;
    private Double deliveryFee;   // Added: To show Rider their share
    private Double platformFee;   // Added: To show Company share
    private OrderStatus orderStatus;
    private LocalDateTime orderDate;
    private List<OrderItemResponse> items;
    private PaymentStatus paymentStatus;   // ← NEW
    private String paymentMode;            // ← NEW
}

