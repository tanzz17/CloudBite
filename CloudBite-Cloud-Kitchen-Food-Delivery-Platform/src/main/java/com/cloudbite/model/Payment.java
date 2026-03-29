package com.cloudbite.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private String razorpayOrderId;      // from Razorpay
    private String razorpayPaymentId;    // filled after success
    private String razorpaySignature;    // filled after success

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;        // PENDING, PAID, FAILED

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}