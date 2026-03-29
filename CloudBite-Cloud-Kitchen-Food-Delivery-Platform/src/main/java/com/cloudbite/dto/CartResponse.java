package com.cloudbite.dto;

import java.util.List;

public class CartResponse {
    private Long id;
    private double total;
    private List<CartItemResponse> items;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public List<CartItemResponse> getItems() { return items; }
    public void setItems(List<CartItemResponse> items) { this.items = items; }
}
