package com.cloudbite.service.impl;

import com.cloudbite.dto.OrderItemResponse;
import com.cloudbite.dto.OrderResponse;
import com.cloudbite.dto.ReorderDishDTO;
import com.cloudbite.model.*;
import com.cloudbite.repository.*;
import com.cloudbite.service.DeliveryService;
import com.cloudbite.service.OrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepo;
    private final CartRepository cartRepo;
    private final CartItemRepository cartItemRepo;
    private final CustomerRepository customerRepo;
    private final AddressRepository addressRepo;
    private final DeliveryService deliveryService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public OrderResponse placeOrder(Customer customer, String deliveryAddress) {

        Cart cart = cartRepo.findByCustomer(customer)
                .orElseThrow(() -> new RuntimeException("Cart not found for this customer"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty, cannot place order.");
        }

        Kitchen kitchen = cart.getItems().get(0).getFood().getKitchen();

        String finalAddress = (deliveryAddress != null && !deliveryAddress.isEmpty())
                ? deliveryAddress
                : String.format("%s, %s - %s",
                customer.getAddress(),
                customer.getPlace(),
                customer.getPostalCode());

        // Address persistence logic
        boolean isExisting = addressRepo.existsByCustomerAndStreetIgnoreCase(customer, finalAddress);
        if (!isExisting) {
            Address newAddress = new Address();
            newAddress.setCustomer(customer);
            newAddress.setFullName(customer.getUser().getFullName());
            newAddress.setStreet(finalAddress);
            newAddress.setCity(customer.getPlace());
            newAddress.setPostalCode(customer.getPostalCode());
            addressRepo.save(newAddress);
        }

        // Create new order
        Order order = new Order();
        order.setCustomer(customer);
        order.setKitchen(kitchen);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus(OrderStatus.PENDING);  // kitchen won't see it yet
        order.setPaymentStatus(PaymentStatus.PENDING);       // new field from updated Order.java
        order.setDeliveryAddress(finalAddress);

        // Convert cart items → order items
        List<OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> {
                    OrderItem item = new OrderItem();
                    item.setOrder(order);
                    item.setFood(cartItem.getFood());
                    item.setFoodName(cartItem.getFood().getName());
                    item.setUnitPrice(cartItem.getFood().getPrice());
                    item.setQuantity(cartItem.getQuantity());
                    return item;
                })
                .collect(Collectors.toList());

        order.setOrderItems(orderItems);

        // --- FIXED FEE PERSISTENCE LOGIC ---
        // 1. Calculate Food Subtotal
        double foodSubtotal = orderItems.stream()
                .mapToDouble(i -> i.getUnitPrice() * i.getQuantity())
                .sum();

        // 2. Define Fees
        double deliveryFee = 30.0;
        double platformFee = 5.0;

        // 3. SET VALUES TO ENTITY
        order.setDeliveryFee(deliveryFee);
        order.setPlatformFee(platformFee);

        // 4. Set Total Price (Subtotal + deliveryFee + platformFee)
        order.setTotalPrice(foodSubtotal + deliveryFee + platformFee);
        // -----------------------------------

        Order savedOrder = orderRepo.save(order);

        // Clear the customer's cart
        cartItemRepo.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepo.save(cart);

        return mapToOrderResponse(savedOrder);
    }

    @Transactional
    private OrderResponse mapToOrderResponse(Order order) {
        Kitchen kitchen = order.getKitchen();

        return new OrderResponse(
                order.getId(),                                                    // 1
                order.getCustomer().getId(),                                      // 2
                order.getCustomer().getUser().getFullName(),                      // 3
                kitchen != null ? kitchen.getId() : null,                         // 4
                kitchen != null ? kitchen.getName() : null,                       // 5
                order.getDeliveryAddress(),                                       // 6
                order.getTotalPrice(),                                            // 7
                order.getDeliveryFee() != null ? order.getDeliveryFee() : 30.0,  // 8
                order.getPlatformFee() != null ? order.getPlatformFee() : 5.0,   // 9
                order.getOrderStatus(),                                           // 10
                order.getOrderDate(),                                             // 11
                order.getOrderItems().stream()                                    // 12
                        .map(item -> new OrderItemResponse(
                                item.getFoodName(),
                                item.getUnitPrice(),
                                item.getQuantity()
                        ))
                        .collect(Collectors.toList()),
                order.getPaymentStatus(),                                         // 13 NEW
                order.getPaymentMode()                                            // 14 NEW
        );
    }

    @Override
    @Transactional
    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        return orderRepo.findByCustomer_Id(customerId)
                .stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<OrderResponse> getOrdersByKitchen(Long kitchenId) {
        return orderRepo.findByKitchen_Id(kitchenId)
                .stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepo.findByCustomer_User_Id(userId)
                .stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());

        if (newStatus == OrderStatus.READY_FOR_PICKUP) {
            order.setOrderStatus(OrderStatus.READY_FOR_PICKUP);
            deliveryService.assignOrderAutomatically(order);
        } else {
            order.setOrderStatus(newStatus);
        }

        Order savedOrder = orderRepo.save(order);

        messagingTemplate.convertAndSend(
                "/topic/kitchen/" + (savedOrder.getKitchen() != null ? savedOrder.getKitchen().getId() : "all"),
                mapToOrderResponse(savedOrder)
        );

        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional
    public List<OrderResponse> getAllOrdersForAdmin() {
        return orderRepo.findAll()
                .stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<ReorderDishDTO> getReorderItems(Long userId) {

        // If this user has no Customer record (admin, kitchen owner, delivery partner)
        // simply return an empty list -- no error, no log noise
        Optional<Customer> customerOpt = customerRepo.findByUser_Id(userId);
        if (customerOpt.isEmpty()) {
            return List.of();
        }
        Customer customer = customerOpt.get();

        List<Order> orders = orderRepo
                .findByCustomer_IdAndOrderStatusOrderByOrderDateDesc(
                        customer.getId(),
                        OrderStatus.DELIVERED
                );

        Map<Long, ReorderDishDTO> uniqueDishes = new LinkedHashMap<>();

        for (Order order : orders) {
            for (OrderItem item : order.getOrderItems()) {

                Food food = item.getFood();

                String imageUrl = (food.getImages() != null && !food.getImages().isEmpty())
                        ? food.getImages().get(0)
                        : null;

                uniqueDishes.putIfAbsent(food.getId(),
                        new ReorderDishDTO(
                                food.getId(),
                                food.getName(),
                                food.getPrice(),
                                imageUrl,
                                order.getKitchen().getName()
                        ));
            }
        }

        return uniqueDishes.values().stream().limit(10).toList();
    }
}