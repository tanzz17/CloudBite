package com.cloudbite.controller;

import com.cloudbite.dto.CartResponse;
import com.cloudbite.model.Customer;
import com.cloudbite.model.Food;
import com.cloudbite.service.CartService;
import com.cloudbite.service.CustomerService;
import com.cloudbite.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private FoodService foodService;

    // ✅ 1. Get cart by userId (returns clean DTO)
    @GetMapping("/user/{userId}")
    public ResponseEntity<CartResponse> getCartByUserId(@PathVariable Long userId) {
        CartResponse cartResponse = ((com.cloudbite.service.impl.CartServiceImpl) cartService)
                .getCartResponseByUserId(userId);
        return ResponseEntity.ok(cartResponse);
    }

    // ✅ 2. Add item to cart (returns updated DTO)
    @PostMapping("/add/{userId}/{foodId}")
    public ResponseEntity<CartResponse> addItemToCart(
            @PathVariable Long userId,
            @PathVariable Long foodId,
            @RequestParam(defaultValue = "1") int quantity) {

        Customer customer = customerService.getCustomerByUserId(userId);
        Food food = foodService.findFoodById(foodId);
        cartService.addItemToCart(customer, food, quantity);

        CartResponse updatedCart = ((com.cloudbite.service.impl.CartServiceImpl) cartService)
                .getCartResponseByUserId(userId);
        return ResponseEntity.ok(updatedCart);
    }

    // ✅ 3. Remove item (returns updated DTO)
    @DeleteMapping("/remove/{userId}/{cartItemId}")
    public ResponseEntity<CartResponse> removeItemFromCart(
            @PathVariable Long userId,
            @PathVariable Long cartItemId) {

        Customer customer = customerService.getCustomerByUserId(userId);
        cartService.removeItemFromCart(customer, cartItemId);

        CartResponse updatedCart = ((com.cloudbite.service.impl.CartServiceImpl) cartService)
                .getCartResponseByUserId(userId);
        return ResponseEntity.ok(updatedCart);
    }

    // ✅ 4. Clear cart (returns updated DTO)
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<CartResponse> clearCart(@PathVariable Long userId) {
        Customer customer = customerService.getCustomerByUserId(userId);
        cartService.clearCart(customer);

        CartResponse clearedCart = ((com.cloudbite.service.impl.CartServiceImpl) cartService)
                .getCartResponseByUserId(userId);
        return ResponseEntity.ok(clearedCart);
    }

    // ✅ 5. Update quantity (returns updated DTO)
    @PutMapping("/update/{userId}/{foodId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable Long userId,
            @PathVariable Long foodId,
            @RequestParam int quantity) {

        Customer customer = customerService.getCustomerByUserId(userId);
        Food food = foodService.findFoodById(foodId);
        cartService.updateItemQuantity(customer, food, quantity);

        CartResponse updatedCart = ((com.cloudbite.service.impl.CartServiceImpl) cartService)
                .getCartResponseByUserId(userId);
        return ResponseEntity.ok(updatedCart);
    }
}
