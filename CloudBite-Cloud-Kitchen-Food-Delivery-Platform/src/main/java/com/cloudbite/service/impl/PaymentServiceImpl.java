package com.cloudbite.service.impl;

import com.cloudbite.dto.PaymentResponseDto;
import com.cloudbite.dto.PaymentVerifyDto;
import com.cloudbite.model.*;
import com.cloudbite.repository.OrderRepository;
import com.cloudbite.repository.PaymentRepository;
import com.cloudbite.service.PaymentService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepo;
    private final PaymentRepository paymentRepo;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Override
    public PaymentResponseDto createRazorpayOrder(Long orderId) throws Exception {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject options = new JSONObject();
        options.put("amount", (int)(order.getTotalPrice() * 100));
        options.put("currency", "INR");
        options.put("receipt", "order_" + orderId);

        com.razorpay.Order razorpayOrder = client.orders.create(options);
        String razorpayOrderId = razorpayOrder.get("id");

        // Upsert: reuse existing payment record if one already exists for this order
        // This prevents duplicate key errors when the customer retries payment
        Payment payment = paymentRepo.findByOrder_Id(orderId)
                .orElse(new Payment());

        payment.setOrder(order);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setRazorpayPaymentId(null);   // reset on retry
        payment.setRazorpaySignature(null);   // reset on retry
        payment.setStatus(PaymentStatus.PENDING);
        payment.setUpdatedAt(LocalDateTime.now());
        if (payment.getCreatedAt() == null) {
            payment.setCreatedAt(LocalDateTime.now());
        }
        paymentRepo.save(payment);

        return new PaymentResponseDto(razorpayOrderId, order.getTotalPrice(), "INR", keyId);
    }

    @Override
    public boolean verifyPayment(PaymentVerifyDto dto) throws Exception {
        // 1. Reconstruct the signature
        String data = dto.getRazorpayOrderId() + "|" + dto.getRazorpayPaymentId();
        String generatedSignature = hmacSHA256(data, keySecret);

        if (!generatedSignature.equals(dto.getRazorpaySignature())) {
            // Signature mismatch — mark payment FAILED
            paymentRepo.findByRazorpayOrderId(dto.getRazorpayOrderId()).ifPresent(p -> {
                p.setStatus(PaymentStatus.FAILED);
                p.setUpdatedAt(LocalDateTime.now());
                paymentRepo.save(p);
            });
            return false;
        }

        // 2. Signature valid — update Payment record
        Payment payment = paymentRepo.findByRazorpayOrderId(dto.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment record not found"));

        payment.setRazorpayPaymentId(dto.getRazorpayPaymentId());
        payment.setRazorpaySignature(dto.getRazorpaySignature());
        payment.setStatus(PaymentStatus.PAID);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepo.save(payment);

        // 3. Update order's payment status
        Order order = payment.getOrder();
        order.setPaymentStatus(PaymentStatus.PAID);
        orderRepo.save(order);

        return true;
    }

    private String hmacSHA256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        mac.init(secretKey);
        byte[] hash = mac.doFinal(data.getBytes());
        return HexFormat.of().formatHex(hash);
    }
}