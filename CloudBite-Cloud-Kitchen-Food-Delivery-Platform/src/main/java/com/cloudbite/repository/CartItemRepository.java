package com.cloudbite.repository;

import com.cloudbite.model.Cart;
import com.cloudbite.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // Currently empty besides JpaRepository methods.

    List<CartItem> findByCart(Cart cart);

}