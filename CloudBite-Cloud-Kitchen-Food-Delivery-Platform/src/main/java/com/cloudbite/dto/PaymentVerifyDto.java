package com.cloudbite.dto;

import lombok.Data;

@Data
public class PaymentVerifyDto {

    private String razorpay_order_id;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;


}