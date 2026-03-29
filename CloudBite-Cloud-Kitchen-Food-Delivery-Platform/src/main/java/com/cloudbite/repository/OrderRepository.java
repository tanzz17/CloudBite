package com.cloudbite.repository;

import com.cloudbite.model.DeliveryPartner;
import com.cloudbite.model.Order;
import com.cloudbite.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Modifying
    @Query("UPDATE Order o SET o.deliveryPartner = :partner, o.orderStatus = :status, o.assignedTime = :time " +
            "WHERE o.id = :orderId AND o.deliveryPartner IS NULL")
    int claimOrder(Long orderId, DeliveryPartner partner, OrderStatus status, LocalDateTime time);
    // =================================================
    // CUSTOMER
    // =================================================
    List<Order> findByCustomer_Id(Long customerId);

    List<Order> findByCustomer_User_Id(Long userId);

    // =================================================
    // KITCHEN
    // =================================================
    List<Order> findByKitchen_Id(Long kitchenId);

    // =================================================
    // DELIVERY PARTNER
    // =================================================

    // 1️⃣ Orders ready for pickup & not assigned
    List<Order> findByOrderStatusAndDeliveryPartnerIsNull(
            OrderStatus orderStatus
    );

    // 2️⃣ Active orders of delivery partner (not delivered)
    List<Order> findByDeliveryPartnerAndOrderStatusNot(
            DeliveryPartner deliveryPartner,
            OrderStatus orderStatus
    );

    // 3️⃣ Delivered order history
    List<Order> findByDeliveryPartnerAndOrderStatus(
            DeliveryPartner deliveryPartner,
            OrderStatus orderStatus
    );

    List<Order> findByDeliveryPartner_User_EmailAndOrderStatusIn(
            String email,
            List<OrderStatus> statuses
    );

    // ✅ Reorder logic — latest delivered orders first
    List<Order> findByCustomer_IdAndOrderStatusOrderByOrderDateDesc(
            Long customerId,
            OrderStatus orderStatus
    );

    @Query("SELECT o FROM Order o " +
            "LEFT JOIN FETCH o.kitchen " +
            "LEFT JOIN FETCH o.customer c " +
            "LEFT JOIN FETCH c.user " +
            "WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") Long id);

}
