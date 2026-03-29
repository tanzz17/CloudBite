package com.cloudbite.dto;

import com.cloudbite.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrderStatusUpdateDto {
    private Long orderId;
    private OrderStatus status;
    private String message;
}
