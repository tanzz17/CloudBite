package com.cloudbite.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fullName;

    private String street;
    private String city;
    private String postalCode;
//
//    @OneToOne(mappedBy = "address")
//    @JsonIgnore
//    private Kitchen kitchen;

    // ✅ Fix here — link to Customer instead of User
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
}
