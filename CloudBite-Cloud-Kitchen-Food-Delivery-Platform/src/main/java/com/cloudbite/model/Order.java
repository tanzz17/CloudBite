package com.cloudbite.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // CUSTOMER
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "orders", "cart"})
    private Customer customer;

    // KITCHEN
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kitchen_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "menuItems", "owner"})
    private Kitchen kitchen;

    // DELIVERY PARTNER
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_partner_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private DeliveryPartner deliveryPartner;

    // INFO
    private LocalDateTime orderDate = LocalDateTime.now();

    @Column(name = "delivery_fee")
    private Double deliveryFee = 30.0;

    @Column(name = "platform_fee")
    private Double platformFee = 5.0;

    @Column(name = "total_price")
    private Double totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", length = 50)
    private OrderStatus orderStatus = OrderStatus.PENDING;

    // ✅ NEW: Payment status (PENDING → PAID or FAILED after Razorpay)
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    // ✅ NEW: Payment mode (ONLINE by default, COD if you add it later)
    @Column(name = "payment_mode", length = 20)
    private String paymentMode = "ONLINE";

    private LocalDateTime assignedTime;
    private LocalDateTime deliveredTime;

    private String deliveryAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"order"})
    private List<OrderItem> orderItems = new ArrayList<>();
}