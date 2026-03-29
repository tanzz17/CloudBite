package com.cloudbite.service;

import com.cloudbite.dto.ReorderDishDTO;
import com.cloudbite.model.Customer;
import com.cloudbite.dto.OrderResponse;
import java.util.List;

public interface OrderService {

    OrderResponse placeOrder(Customer customer, String deliveryAddress);

    List<OrderResponse> getOrdersByCustomer(Long customerId);

    List<OrderResponse> getOrdersByKitchen(Long kitchenId);

    List<OrderResponse> getOrdersByUserId(Long userId);

    OrderResponse getOrderById(Long orderId);

    OrderResponse updateOrderStatus(Long orderId, String status);

    // Add this to com.cloudbite.service.OrderService
    List<OrderResponse> getAllOrdersForAdmin();

    List<ReorderDishDTO> getReorderItems(Long userId);
}
