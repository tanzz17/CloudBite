package com.cloudbite.controller;

import com.cloudbite.repository.CategoryRepository;
import com.cloudbite.response.FoodResponse;
import com.cloudbite.response.KitchenResponse;
import com.cloudbite.service.FoodService;
import com.cloudbite.service.KitchenService;
import jakarta.annotation.security.PermitAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api")
public class FoodController {

    @Autowired
    private FoodService foodService;

    @Autowired
    private KitchenService kitchenService;

    @Autowired
    private CategoryRepository categoryRepository;

    // =====================================================
    // PUBLIC FOOD ENDPOINTS
    // =====================================================

    // ✅ Get all foods
    @GetMapping("/foods/all")
    @PermitAll
    public ResponseEntity<List<FoodResponse>> getAllFoods() {
        return ResponseEntity.ok(foodService.getAllFoodsResponse());
    }

    // ✅ Get foods by kitchen
    @GetMapping("/kitchen/{kitchenId}")
    @PermitAll
    public ResponseEntity<List<FoodResponse>> getFoodsByKitchen(
            @PathVariable Long kitchenId) {

        return ResponseEntity.ok(
                foodService.getFoodsResponseByKitchen(kitchenId)
        );
    }

    // =====================================================
    // SEARCH
    // =====================================================

    // ✅ Search dishes globally
    @GetMapping("/public/search/dishes")
    @PermitAll
    public ResponseEntity<List<FoodResponse>> searchDishes(
            @RequestParam("q") String keyword) {

        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        return ResponseEntity.ok(
                foodService.searchFoods(keyword)
        );
    }

    // ✅ Add-on recommendations for a specific food
    @GetMapping("/public/foods/{foodId}/addons")
    @PermitAll
    public ResponseEntity<List<FoodResponse>> getAddonRecommendations(
            @PathVariable Long foodId,
            @RequestParam(defaultValue = "4") int limit) {

        int safeLimit = Math.min(Math.max(limit, 1), 8);
        return ResponseEntity.ok(foodService.getAddonRecommendations(foodId, safeLimit));
    }

    // =====================================================
    // CATEGORY & SUBCATEGORY FILTERS
    // =====================================================

    // ✅ Get all distinct category names
    @GetMapping("/public/categories")
    @PermitAll
    public ResponseEntity<List<String>> getAllCategoryNames() {

        return ResponseEntity.ok(
                categoryRepository.findDistinctCategoryNames()
        );
    }

    // ✅ Get foods by Category
    @GetMapping("/public/category/{categoryName}")
    @PermitAll
    public ResponseEntity<List<FoodResponse>> getFoodsByCategory(
            @PathVariable String categoryName) {

        return ResponseEntity.ok(
                foodService.getFoodsByCategoryName(categoryName)
        );
    }

    // ✅ NEW: Get foods by SubCategory
    @GetMapping("/public/subcategory/{subCategoryName}")
    @PermitAll
    public ResponseEntity<List<FoodResponse>> getFoodsBySubCategory(
            @PathVariable String subCategoryName) {

        return ResponseEntity.ok(
                foodService.getFoodsBySubCategoryName(subCategoryName)
        );
    }

    // =====================================================
    // KITCHEN ENDPOINTS
    // =====================================================

    // ✅ Get all kitchens
    @GetMapping("/kitchens/all")
    @PermitAll
    public ResponseEntity<List<KitchenResponse>> getAllKitchens() {

        return ResponseEntity.ok(
                kitchenService.getAllKitchens()
        );
    }

    // ✅ Get kitchen details
    @GetMapping("/kitchens/{kitchenId}")
    @PermitAll
    public ResponseEntity<KitchenResponse> getKitchenDetails(
            @PathVariable Long kitchenId) {

        KitchenResponse kitchen =
                kitchenService.getKitchenResponseById(kitchenId);

        if (kitchen == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(kitchen);
    }

    // ==============================
// ✅ GET SUBCATEGORIES BY CATEGORY
// ==============================

    @GetMapping("/public/subcategories/{categoryName}")
    @PermitAll
    public ResponseEntity<List<String>> getSubCategoriesByCategory(
            @PathVariable String categoryName) {

        List<String> subCategories =
                foodService.getSubCategoriesByCategoryName(categoryName);

        return ResponseEntity.ok(subCategories);
    }

}
