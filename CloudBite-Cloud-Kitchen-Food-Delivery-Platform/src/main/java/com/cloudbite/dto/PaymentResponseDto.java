package com.cloudbite.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PaymentResponseDto {
    private String razorpayOrderId;
    private Double amount;
    private String currency;
    private String keyId;

    // Explicit public constructor — avoids Lombok visibility issue
    public PaymentResponseDto(String razorpayOrderId, Double amount, String currency, String keyId) {
        this.razorpayOrderId = razorpayOrderId;
        this.amount = amount;
        this.currency = currency;
        this.keyId = keyId;
    }
}