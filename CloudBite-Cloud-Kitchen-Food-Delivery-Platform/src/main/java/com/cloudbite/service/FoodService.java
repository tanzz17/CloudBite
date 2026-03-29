package com.cloudbite.service;

import com.cloudbite.response.FoodResponse;
import com.cloudbite.model.Food;
import com.cloudbite.model.Kitchen;
import java.util.List;

public interface FoodService {

    // ✅ Find a single food by its ID
    Food findFoodById(Long id);

    // ✅ Get all food items (for admin or browsing)
    List<Food> getAllFoods();

    // ✅ Get all foods for a specific kitchen (by ID)
    List<Food> getFoodsByKitchen(Long kitchenId);

    // ✅ Get all foods for a specific kitchen (by Kitchen entity)
    List<Food> getFoodsByKitchen(Kitchen kitchen);

    // ✅ Save or update a food item
    Food saveFood(Food food);

    // ✅ Delete a food item
    void deleteFood(Long id);

    // ✅ Kitchen Owner View (DTO based)
    List<FoodResponse> getFoodsResponseByKitchen(Long kitchenId);

    // ✅ All foods (DTO based)
    List<FoodResponse> getAllFoodsResponse();

    // ✅ Search foods by name
    List<FoodResponse> searchFoods(String keyword);

    // ✅ Filter by Category
    List<FoodResponse> getFoodsByCategoryName(String categoryName);

    // ✅ NEW: Filter by SubCategory
    List<FoodResponse> getFoodsBySubCategoryName(String subCategoryName);

    List<String> getSubCategoriesByCategoryName(String categoryName);

    // ✅ Add-on recommendations for a specific food
    List<FoodResponse> getAddonRecommendations(Long foodId, int limit);


}
