package com.cloudbite.service.impl;

import com.cloudbite.dto.DeliveryOrderResponse;
import com.cloudbite.dto.OrderStatusUpdateDto;
import com.cloudbite.model.*;
import com.cloudbite.repository.DeliveryPartnerRepository;
import com.cloudbite.repository.OrderRepository;
import com.cloudbite.service.DeliveryLocationService;
import com.cloudbite.service.DeliveryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final OrderRepository orderRepository;
    private final DeliveryPartnerRepository partnerRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final DeliveryLocationService locationService;   // NEW

    @Override
    @Transactional
    public Order assignOrderAutomatically(Order order) {
        DeliveryPartner partner = partnerRepository
                .findFirstByStatus(DeliveryPartnerStatus.AVAILABLE)
                .orElse(null);

        if (partner == null) {
            return order;
        }

        order.setDeliveryPartner(partner);
        order.setAssignedTime(LocalDateTime.now());

        partner.setStatus(DeliveryPartnerStatus.BUSY);
        partnerRepository.save(partner);

        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order updateStatus(Long orderId, OrderStatus status, String email) {
        DeliveryPartner partner = partnerRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getDeliveryPartner().getId().equals(partner.getId())) {
            throw new RuntimeException("This order is not assigned to you.");
        }

        if (status == OrderStatus.DELIVERED) {
            order.setOrderStatus(OrderStatus.DELIVERED);
            order.setDeliveredTime(LocalDateTime.now());

            partner.setStatus(DeliveryPartnerStatus.AVAILABLE);
            partnerRepository.save(partner);

            locationService.stopSimulation(order.getId());   // NEW: clean up simulation
        } else if (status == OrderStatus.OUT_FOR_DELIVERY) {
            order.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);

            locationService.startSimulation(order);  // ✅ fixed
        }

        Order savedOrder = orderRepository.save(order);

        messagingTemplate.convertAndSend(
                "/topic/orders/" + savedOrder.getId(),
                new OrderStatusUpdateDto(savedOrder.getId(), savedOrder.getOrderStatus(), "Status updated by driver")
        );

        return savedOrder;
    }

    @Override
    @Transactional
    public List<DeliveryOrderResponse> getActiveOrders(String email) {
        List<Order> orders = orderRepository.findByDeliveryPartner_User_EmailAndOrderStatusIn(
                email,
                List.of(
                        OrderStatus.READY_FOR_PICKUP,
                        OrderStatus.ON_THE_WAY,
                        OrderStatus.OUT_FOR_DELIVERY
                )
        );

        return orders.stream()
                .map(order -> new DeliveryOrderResponse(order.getId(), order.getCustomer().getUser().getFullName(), order.getKitchen() != null ? order.getKitchen().getId() : null, order.getKitchen() != null ? order.getKitchen().getName() : null, order.getDeliveryAddress(),
                        order.getOrderStatus(),
                        order.getOrderDate(),
                        order.getTotalPrice(),
                        30.0,
                        5.0
                ))
                .toList();
    }

    @Override
    @Transactional
    public List<DeliveryOrderResponse> getAvailableOrders() {
        List<Order> orders = orderRepository.findByOrderStatusAndDeliveryPartnerIsNull(
                OrderStatus.READY_FOR_PICKUP
        );

        return orders.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public Order acceptOrder(Long orderId, String email) {
        DeliveryPartner partner = partnerRepository
                .findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        if (partner.getStatus() == DeliveryPartnerStatus.OFFLINE) {
            throw new RuntimeException("You are currently offline. Go online to accept missions.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new RuntimeException("Order is no longer ready for pickup.");
        }

        order.setDeliveryPartner(partner);
        order.setOrderStatus(OrderStatus.ON_THE_WAY);
        order.setAssignedTime(LocalDateTime.now());

        partner.setStatus(DeliveryPartnerStatus.BUSY);
        partnerRepository.save(partner);

        Order savedOrder = orderRepository.save(order);

        messagingTemplate.convertAndSend(
                "/topic/orders/" + savedOrder.getId(),
                new OrderStatusUpdateDto(savedOrder.getId(), savedOrder.getOrderStatus(), "Partner is on the way")
        );

        return savedOrder;
    }

    @Override
    @Transactional
    public List<DeliveryOrderResponse> getOrderHistory(String email) {
        DeliveryPartner partner = partnerRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        List<Order> orders = orderRepository.findByDeliveryPartnerAndOrderStatus(partner, OrderStatus.DELIVERED);

        return orders.stream()
                .map(order -> new DeliveryOrderResponse(order.getId(), order.getCustomer().getUser().getFullName(), order.getKitchen() != null ? order.getKitchen().getId() : null, order.getKitchen() != null ? order.getKitchen().getName() : null, order.getDeliveryAddress(),
                        order.getOrderStatus(),
                        order.getOrderDate(),
                        order.getTotalPrice(),
                        30.0,
                        5.0
                ))
                .toList();
    }

    @Override
    public DeliveryPartner goOnline(String email) {
        DeliveryPartner partner = partnerRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));
        partner.setStatus(DeliveryPartnerStatus.AVAILABLE);
        return partnerRepository.save(partner);
    }

    @Override
    public DeliveryPartner goOffline(String email) {
        DeliveryPartner partner = partnerRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        boolean hasActive = orderRepository.findByDeliveryPartnerAndOrderStatusNot(
                partner, OrderStatus.DELIVERED
        ).size() > 0;

        if (hasActive) {
            throw new RuntimeException("Cannot go offline during delivery");
        }

        partner.setStatus(DeliveryPartnerStatus.OFFLINE);
        return partnerRepository.save(partner);
    }

    @Override
    public DeliveryPartner getProfile(String email) {
        return partnerRepository.findByUser_Email(email)
                .
                orElseThrow(() -> new RuntimeException("Delivery partner not found"));
    }

    @Override
    @Transactional
    public DeliveryOrderResponse acceptOrderAndReturnDto(Long orderId, String email) {
        Order order = acceptOrder(orderId, email);
        return mapToResponse(order);
    }

    @Override
    @Transactional
    public DeliveryOrderResponse updateStatusAndReturnDto(Long orderId, OrderStatus status, String email) {
        Order order = updateStatus(orderId, status, email);
        return mapToResponse(order);
    }

    @Override
    @Transactional
    public void updateRiderLocation(Long orderId, String email, double lat, double lng, Double heading, Double speed) {
        DeliveryPartner partner = partnerRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getDeliveryPartner() == null || !order.getDeliveryPartner().getId().equals(partner.getId())) {
            throw new RuntimeException("This order is not assigned to you.");
        }

        if (order.getOrderStatus() != OrderStatus.OUT_FOR_DELIVERY) {
            throw new RuntimeException("Location updates are allowed only for OUT_FOR_DELIVERY orders.");
        }

        locationService.updateLiveLocation(orderId, lat, lng, heading, speed);
    }
    private DeliveryOrderResponse mapToResponse(Order order) {
        return new DeliveryOrderResponse(order.getId(), order.getCustomer().getUser().getFullName(), order.getKitchen() != null ? order.getKitchen().getId() : null, order.getKitchen() != null ? order.getKitchen().getName() : null, order.getDeliveryAddress(),
                order.getOrderStatus(),
                order.getOrderDate(),
                order.getTotalPrice(),
                30.0,
                5.0
        );
    }
}




