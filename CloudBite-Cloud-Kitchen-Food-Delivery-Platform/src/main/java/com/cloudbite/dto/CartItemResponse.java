package com.cloudbite.dto;

public class CartItemResponse {
    private Long id;
    private Long foodId;
    private String foodName;
    private String foodImage;
    private Double priceAtAddition;
    private int quantity;
    private Double totalPrice;

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFoodId() { return foodId; }
    public void setFoodId(Long foodId) { this.foodId = foodId; }

    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }

    public String getFoodImage() { return foodImage; }
    public void setFoodImage(String foodImage) { this.foodImage = foodImage; }

    public Double getPriceAtAddition() { return priceAtAddition; }
    public void setPriceAtAddition(Double priceAtAddition) { this.priceAtAddition = priceAtAddition; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
}
