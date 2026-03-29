import api from "./api";

// Get full cart by userId
export const getCart = (userId) =>
  api.get(`/customers/cart/user/${userId}`);

// Add food to cart
export const addToCart = (userId, foodId, quantity = 1) =>
  api.post(`/customers/cart/add/${userId}/${foodId}?quantity=${quantity}`);

// Remove specific item from cart
export const removeFromCart = (userId, cartItemId) =>
  api.delete(`/customers/cart/remove/${userId}/${cartItemId}`);

// Clear all items from cart
export const clearCart = (userId) =>
  api.delete(`/customers/cart/clear/${userId}`);

// Update quantity of a food in cart
export const updateCartItemQuantity = (userId, foodId, quantity) =>
  api.put(`/customers/cart/update/${userId}/${foodId}?quantity=${quantity}`);
