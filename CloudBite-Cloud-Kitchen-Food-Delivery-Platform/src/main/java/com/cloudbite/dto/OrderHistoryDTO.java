package com.cloudbite.dto;

import com.cloudbite.model.OrderStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderHistoryDTO {
    private Long id;
    private String customerName;
    private String deliveryAddress;
    private Double totalPrice;
    private OrderStatus orderStatus;
    private LocalDateTime deliveredTime;
}