package com.cloudbite.service;

import com.cloudbite.dto.PaymentResponseDto;
import com.cloudbite.dto.PaymentVerifyDto;

public interface PaymentService {

    PaymentResponseDto createRazorpayOrder(Long orderId) throws Exception;
    boolean verifyPayment(PaymentVerifyDto dto) throws Exception;




}