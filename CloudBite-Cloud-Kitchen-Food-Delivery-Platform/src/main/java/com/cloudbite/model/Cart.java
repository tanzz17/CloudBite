package com.cloudbite.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @ToString.Include
    private Long id;

    @OneToOne
    @JoinColumn(name = "customer_id")
    @JsonIgnoreProperties({"cart", "user"})
    private Customer customer;


    private Long total;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"cart", "food"})  // ✅ prevent recursion
    private List<CartItem> items = new ArrayList<>();

    public Long calculateTotal() {
        return items.stream()
                .mapToLong(CartItem::getTotalPrice)
                .sum();
    }
}
