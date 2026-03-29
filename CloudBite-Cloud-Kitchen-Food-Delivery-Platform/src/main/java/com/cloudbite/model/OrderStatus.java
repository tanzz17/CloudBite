package com.cloudbite.model;

public enum OrderStatus {
    PAYMENT_PENDING,   // <-- add this
    PENDING,        // Waiting for kitchen confirmation
    CONFIRMED,      // Kitchen accepted the order
    PREPARING,      // Food is being cooked
    READY_FOR_PICKUP, // Ready for delivery partner
    ON_THE_WAY,
    OUT_FOR_DELIVERY,
    DELIVERED,      // Completed
    CANCELLED,      // Cancelled by customer or kitchen
    REJECTED        // Rejected by the kitchen
}