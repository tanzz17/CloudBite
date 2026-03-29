package com.cloudbite.service;

import com.cloudbite.model.Cart;
import com.cloudbite.model.Customer;
import com.cloudbite.model.Food;

public interface CartService {

    /**
     * Retrieves the customer's cart, creating one if it does not exist.
     * @param customer The authenticated customer object.
     * @return The customer's Cart object.
     */
    Cart getCartByCustomer(Customer customer);

    /**
     * Adds a food item to the cart or updates the quantity if the item already exists.
     * @param customer The authenticated customer object.
     * @param food The food item to add.
     * @param quantity The quantity to add (typically 1).
     * @return The updated Cart object.
     */
    Cart addItemToCart(Customer customer, Food food, int quantity);

    /**
     * Removes a specific CartItem entry from the cart by its ID.
     * @param customer The authenticated customer object.
     * @param cartItemId The ID of the CartItem to remove.
     * @return The updated Cart object.
     */
    Cart removeItemFromCart(Customer customer, Long cartItemId);

    /**
     * Clears all items from the customer's cart.
     * @param customer The authenticated customer object.
     * @return The cleared Cart object.
     */
    Cart clearCart(Customer customer);

    /**
     * Calculates the total price of the items currently in the cart.
     * @param cart The Cart object to calculate the total for.
     * @return The calculated total price (Long).
     */
    Long calculateTotal(Cart cart);

    /**
     * Sets a specific quantity for a food item in the cart. Removes the item if quantity is zero or less.
     * @param customer The authenticated customer object.
     * @param food The food item to update.
     * @param quantity The new quantity to set.
     * @return The updated Cart object.
     */
    Cart updateItemQuantity(Customer customer, Food food, int quantity);
}
