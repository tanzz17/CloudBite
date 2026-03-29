package com.cloudbite.dto;

import com.cloudbite.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class DeliveryOrderResponse {

    private Long orderId;
    private String customerName;
    private Long kitchenId;
    private String kitchenName;
    private String deliveryAddress;
    private OrderStatus orderStatus;
    private LocalDateTime orderDate;
    private Double totalPrice;
    private Double deliveryFee;   // Stored separately for rider payout tracking
    private Double platformFee;   // Stored separately for company revenue
}

