import api from "./api";

// Place order (supports query params used by backend)
export const placeOrder = (userId, params = {}) =>
  api.post(`/orders/place/${userId}`, null, { params });

// Orders by customerId
export const getOrdersByCustomer = (customerId) =>
  api.get(`/orders/customer/${customerId}`);

// Orders by userId
export const getOrdersByUser = (userId) =>
  api.get(`/orders/user/${userId}`);

// Kitchen orders
export const getOrdersByKitchen = (kitchenId) =>
  api.get(`/orders/kitchen/${kitchenId}`);

// Single order
export const getOrderById = (orderId) =>
  api.get(`/orders/${orderId}`);

// Update status
export const updateOrderStatus = (orderId, status) =>
  api.put(`/orders/${orderId}/status?status=${status}`);

// Admin all orders
export const getAllOrders = () =>
  api.get(`/orders/all`);

// Reorder data
export const getReorderItems = (userId) =>
  api.get(`/orders/reorder/${userId}`);

// Retry payment
export const retryPayment = (orderId) =>
  api.post(`/orders/${orderId}/retry-payment`);
