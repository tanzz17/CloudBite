package com.cloudbite.service;

import com.cloudbite.dto.DeliveryOrderResponse;
import com.cloudbite.model.DeliveryPartner;
import com.cloudbite.model.Order;
import com.cloudbite.model.OrderStatus;
import java.util.List;

public interface DeliveryService {
    Order assignOrderAutomatically(Order order);

    Order updateStatus(Long orderId, OrderStatus status, String email);
    Order acceptOrder(Long orderId, String email);

    DeliveryOrderResponse acceptOrderAndReturnDto(Long orderId, String email);
    DeliveryOrderResponse updateStatusAndReturnDto(Long orderId, OrderStatus status, String email);

    List<DeliveryOrderResponse> getActiveOrders(String email);
    List<DeliveryOrderResponse> getOrderHistory(String email);
    List<DeliveryOrderResponse> getAvailableOrders();

    DeliveryPartner goOnline(String email);
    DeliveryPartner goOffline(String email);
    DeliveryPartner getProfile(String email);

    void updateRiderLocation(Long orderId, String email, double lat, double lng, Double heading, Double speed);
}

