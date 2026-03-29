package com.cloudbite.dto;

import lombok.Data;

@Data
public class PaymentRequestDto {

    private Long orderId;
    private Double amount;
    private String currency;    // "INR"


}