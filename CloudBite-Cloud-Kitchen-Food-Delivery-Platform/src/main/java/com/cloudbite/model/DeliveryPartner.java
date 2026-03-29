package com.cloudbite.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "delivery_partner")
@Data
public class DeliveryPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String phone;
    private String vehicleType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DeliveryPartnerStatus status;

}
