package com.cloudbite.dto;

import lombok.Data;

@Data
public class OrderRequest {
    private Long customerId;
    private String paymentMethod; // COD, CARD, etc.
    private String deliveryAddress;
}
