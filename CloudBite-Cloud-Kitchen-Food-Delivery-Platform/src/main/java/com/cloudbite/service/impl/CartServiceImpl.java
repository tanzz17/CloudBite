package com.cloudbite.service.impl;

import com.cloudbite.dto.CartItemResponse;
import com.cloudbite.dto.CartResponse;
import com.cloudbite.model.*;
import com.cloudbite.repository.CartItemRepository;
import com.cloudbite.repository.CartRepository;
import com.cloudbite.repository.CustomerRepository;
import com.cloudbite.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CustomerRepository customerRepository;


    // ✅ 1. Get Cart by Customer
    @Override
    public Cart getCartByCustomer(Customer customer) {
        return cartRepository.findByCustomer(customer)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setCustomer(customer);
                    newCart.setTotal(0L);
                    newCart.setItems(new ArrayList<>());
                    return cartRepository.save(newCart);
                });
    }

    // ✅ 2. Add Item to Cart (MODIFIED FOR ONE KITCHEN RULE)
    @Override
    public Cart addItemToCart(Customer customer, Food food, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be positive.");

        Cart cart = getCartByCustomer(customer);
        Long foodPriceAsLong = (food.getPrice() != null) ? food.getPrice().longValue() : 0L;

        // 1. Check if the item is from the same kitchen (if you want to keep the policy)
        if (!cart.getItems().isEmpty()) {
            Long existingKitchenId = cart.getItems().get(0).getFood().getKitchen().getId();
            Long newFoodKitchenId = food.getKitchen().getId();

            if (!newFoodKitchenId.equals(existingKitchenId)) {
                // Instead of clearing silently, throw an error so the frontend knows why it failed
                throw new RuntimeException("Single Kitchen Policy: Clear your current cart first.");
            }
        }

        // 2. Find if the food already exists in the cart
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getFood().getId().equals(food.getId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            // Update existing quantity
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            existingItem.setTotalPrice(existingItem.getPriceAtAddition() * existingItem.getQuantity());
        } else {
            // Create new item and RELATE it to the cart
            CartItem newItem = new CartItem();
            newItem.setFood(food);
            newItem.setQuantity(quantity);
            newItem.setCart(cart);
            newItem.setPriceAtAddition(foodPriceAsLong);
            newItem.setTotalPrice(foodPriceAsLong * quantity);
            cart.getItems().add(newItem); // Add to the list to maintain the object relationship
        }

        // 3. Save the parent (Cart) and let JPA Cascade save the items
        cart.setTotal(calculateTotal(cart));
        return cartRepository.save(cart);
    }


    // ... (Rest of the methods remain unchanged: removeItemFromCart, clearCart, etc.)

    // ✅ 3. Remove Item from Cart
    @Override
    public Cart removeItemFromCart(Customer customer, Long cartItemId) {
        Cart cart = getCartByCustomer(customer);

        CartItem itemToRemove = cart.getItems().stream()
                .filter(item -> item.getId() != null && item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("CartItem not found with ID: " + cartItemId));

        if (!itemToRemove.getCart().getId().equals(cart.getId())) {
            throw new SecurityException("Item does not belong to the customer's cart.");
        }

        cart.getItems().remove(itemToRemove);
        cartItemRepository.delete(itemToRemove);

        cart.setTotal(calculateTotal(cart));
        return cartRepository.save(cart);
    }

    // ✅ 4. Clear Entire Cart
    @Override
    public Cart clearCart(Customer customer) {
        Cart cart = getCartByCustomer(customer);

        if (!cart.getItems().isEmpty()) {
            cartItemRepository.deleteAll(cart.getItems());
            cart.getItems().clear();
        }

        cart.setTotal(0L);
        return cartRepository.save(cart);
    }

    // ✅ 5. Calculate Total
    @Override
    public Long calculateTotal(Cart cart) {
        return cart.getItems().stream()
                .mapToLong(CartItem::getTotalPrice)
                .sum();
    }

    // ✅ 6. Update Quantity
    @Override
    public Cart updateItemQuantity(Customer customer, Food food, int quantity) {
        Cart cart = getCartByCustomer(customer);

        CartItem itemToUpdate = cart.getItems().stream()
                .filter(item -> item.getFood().getId().equals(food.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Food item not found in cart."));

        if (quantity <= 0) {
            cart.getItems().remove(itemToUpdate);
            cartItemRepository.delete(itemToUpdate);
        } else {
            itemToUpdate.setQuantity(quantity);
            itemToUpdate.setTotalPrice(itemToUpdate.getPriceAtAddition() * quantity);
            cartItemRepository.save(itemToUpdate);
        }

        cart.setTotal(calculateTotal(cart));
        return cartRepository.save(cart);
    }

    // ✅ 7. Get Cart by User ID (bridge from User → Customer → Cart)
    public Cart getCartByUserId(Long userId) {
        Customer customer = customerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found for User ID: " + userId));
        return getCartByCustomer(customer);
    }

    @Transactional(readOnly = true)
    public CartResponse getCartResponseByUserId(Long userId) {
        // ... (Unchanged DTO mapping logic)
        Cart cart = getCartByUserId(userId);

        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setTotal(cart.getTotal());

        response.setItems(
                cart.getItems().stream().map(item -> {
                    CartItemResponse i = new CartItemResponse();
                    i.setId(item.getId());
                    i.setFoodId(item.getFood().getId());
                    i.setFoodName(item.getFood().getName());
                    i.setFoodImage(
                            item.getFood().getImages() != null && !item.getFood().getImages().isEmpty()
                                    ? item.getFood().getImages().get(0)
                                    : null
                    );
                    i.setQuantity(item.getQuantity());
                    i.setPriceAtAddition(item.getPriceAtAddition().doubleValue());
                    i.setTotalPrice(item.getTotalPrice().doubleValue());
                    return i;
                }).collect(Collectors.toList())
        );

        return response;
    }

}