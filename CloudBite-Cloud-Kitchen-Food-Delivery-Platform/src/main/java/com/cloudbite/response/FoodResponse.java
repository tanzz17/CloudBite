package com.cloudbite.response;

import java.util.List;

public class FoodResponse {

    private Long id;
    private String name;
    private String description;
    private double price;
    private boolean available;
    private boolean vegetarian;
    private boolean seasonal;

    private String categoryName;
    private String subCategoryName;   // ✅ NEW FIELD

    private List<String> images;

    private Long kitchenId;
    private String kitchenName;

    // ✅ No-arg constructor
    public FoodResponse() {}

    // ✅ Parameterized constructor
    public FoodResponse(Long id, String name, String description,
                        double price, boolean available,
                        List<String> images) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.available = available;
        this.images = images;
    }

    // ---------------- GETTERS & SETTERS ----------------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public boolean isVegetarian() { return vegetarian; }
    public void setVegetarian(boolean vegetarian) { this.vegetarian = vegetarian; }

    public boolean isSeasonal() { return seasonal; }
    public void setSeasonal(boolean seasonal) { this.seasonal = seasonal; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    // ✅ NEW
    public String getSubCategoryName() { return subCategoryName; }
    public void setSubCategoryName(String subCategoryName) { this.subCategoryName = subCategoryName; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public Long getKitchenId() { return kitchenId; }
    public void setKitchenId(Long kitchenId) { this.kitchenId = kitchenId; }

    public String getKitchenName() { return kitchenName; }
    public void setKitchenName(String kitchenName) { this.kitchenName = kitchenName; }
}
