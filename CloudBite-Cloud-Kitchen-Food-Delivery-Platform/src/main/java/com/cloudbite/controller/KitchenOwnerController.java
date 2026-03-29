package com.cloudbite.controller;

import com.cloudbite.config.JwtProvider;
import com.cloudbite.repository.SubCategoryRepository;
import com.cloudbite.request.KitchenUpdateRequest;
import com.cloudbite.response.FoodResponse;
import com.cloudbite.model.*;
import com.cloudbite.repository.CategoryRepository;
import com.cloudbite.repository.UserRepository;
import com.cloudbite.service.FoodService;
import com.cloudbite.service.KitchenService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kitchen-owner")
public class KitchenOwnerController {

    @Autowired
    private KitchenService kitchenService;

    @Autowired
    private FoodService foodService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    // =====================================================
    // ✅ GET FOODS (FIXED – prevents 404)
    // =====================================================

    @GetMapping("/foods/{kitchenId}")
    @PreAuthorize("hasAuthority('ROLE_KITCHEN_OWNER')")
    public ResponseEntity<List<FoodResponse>> getFoodsByKitchen(
            @PathVariable Long kitchenId,
            Authentication authentication) {

        String email = authentication.getName();
        User owner = userRepository.findByEmail(email);
        Kitchen kitchen = kitchenService.getKitchenById(kitchenId);

        if (kitchen == null || !kitchen.getOwner().getId().equals(owner.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<FoodResponse> foods =
                foodService.getFoodsResponseByKitchen(kitchenId);

        return ResponseEntity.ok(foods);
    }

    // =====================================================
    // ✅ ADD ITEM WITH SUBCATEGORY
    // =====================================================

    @PostMapping("/add-item/{kitchenId}")
    @PreAuthorize("hasAuthority('ROLE_KITCHEN_OWNER')")
    public ResponseEntity<?> addItemToMenu(
            @PathVariable Long kitchenId,
            @RequestBody Food food,
            Authentication authentication) {

        String email = authentication.getName();
        User owner = userRepository.findByEmail(email);
        if (owner == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid owner credentials");
        }
        Kitchen kitchen = kitchenService.getKitchenById(kitchenId);

        if (kitchen == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Kitchen not found");

        if (kitchen.getOwner() == null || !kitchen.getOwner().getId().equals(owner.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");

        food.setKitchen(kitchen);

        if (food == null) {
            return ResponseEntity.badRequest().body("Food payload is required");
        }
        if (food.getName() == null || food.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Food name is required");
        }
        if (food.getPrice() == null || food.getPrice() <= 0) {
            return ResponseEntity.badRequest().body("Price must be greater than 0");
        }

        // Validate required fields
        if (food.getCategory() == null || food.getCategory().getName() == null || food.getCategory().getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Category is required");
        }

        // ================= CATEGORY =================

        String categoryName = food.getCategory().getName().trim();

        Category category =
                categoryRepository.findByNameAndKitchen(categoryName, kitchen);

        if (category == null) {
            category = new Category();
            category.setName(categoryName);
            category.setKitchen(kitchen);
            categoryRepository.save(category);
        }

        food.setCategory(category);

        // ================= SUBCATEGORY =================

        if (food.getSubCategory() != null &&
                food.getSubCategory().getName() != null &&
                !food.getSubCategory().getName().trim().isEmpty()) {

            String subCategoryName =
                    food.getSubCategory().getName().trim();

            SubCategory subCategory =
                    subCategoryRepository.findByNameAndCategory(
                            subCategoryName,
                            category
                    );

            if (subCategory == null) {
                subCategory = new SubCategory();
                subCategory.setName(subCategoryName);
                subCategory.setCategory(category);
                subCategoryRepository.save(subCategory);
            }

            food.setSubCategory(subCategory);
        }

        if (food.getImages() == null) {
            food.setImages(new ArrayList<>());
        } else {
            food.setImages(new ArrayList<>(food.getImages()));
        }

        Food savedFood = foodService.saveFood(food);

        return new ResponseEntity<>(
                new FoodResponse(
                        savedFood.getId(),
                        savedFood.getName(),
                        savedFood.getDescription(),
                        savedFood.getPrice(),
                        savedFood.isAvailable(),
                        savedFood.getImages()
                ),
                HttpStatus.CREATED
        );
    }

    // =====================================================
    // ✅ UPDATE FOOD WITH FULL SUBCATEGORY FIX
    // =====================================================

    @PutMapping("/foods/{kitchenId}/{foodId}")
    @PreAuthorize("hasAuthority('ROLE_KITCHEN_OWNER')")
    public ResponseEntity<?> updateFood(
            @PathVariable Long kitchenId,
            @PathVariable Long foodId,
            @RequestBody Food updatedFood,
            Authentication authentication) {

        String email = authentication.getName();
        User owner = userRepository.findByEmail(email);
        if (owner == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid owner credentials");
        }

        Kitchen kitchen = kitchenService.getKitchenById(kitchenId);
        Food existingFood;
        try {
            existingFood = foodService.findFoodById(foodId);
        } catch (RuntimeException ex) {
            existingFood = null;
        }

        if (kitchen == null || existingFood == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Kitchen or Food not found");

        if (kitchen.getOwner() == null || owner == null || !kitchen.getOwner().getId().equals(owner.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");

        if (existingFood.getKitchen() == null ||
                !existingFood.getKitchen().getId().equals(kitchenId))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Food does not belong to this kitchen");

        // ================= BASIC FIELDS =================

        if (updatedFood.getName() == null || updatedFood.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Food name is required");
        }
        if (updatedFood.getPrice() == null || updatedFood.getPrice() <= 0) {
            return ResponseEntity.badRequest().body("Price must be greater than 0");
        }

        existingFood.setName(updatedFood.getName());
        existingFood.setDescription(updatedFood.getDescription() != null ? updatedFood.getDescription() : existingFood.getDescription());
        existingFood.setPrice(updatedFood.getPrice());
        existingFood.setAvailable(updatedFood.isAvailable());
        existingFood.setVegetarian(updatedFood.isVegetarian());
        existingFood.setSeasonal(updatedFood.isSeasonal());
        if (updatedFood.getImages() != null) {
            existingFood.setImages(updatedFood.getImages());
        }

        // ================= CATEGORY =================

        if (updatedFood.getCategory() != null &&
                updatedFood.getCategory().getName() != null &&
                !updatedFood.getCategory().getName().trim().isEmpty()) {

            String categoryName =
                    updatedFood.getCategory().getName().trim();

            Category category =
                    categoryRepository.findByNameAndKitchen(categoryName, kitchen);

            if (category == null) {
                category = new Category();
                category.setName(categoryName);
                category.setKitchen(kitchen);
                categoryRepository.save(category);
            }

            existingFood.setCategory(category);

            // ================= SUBCATEGORY =================

            if (updatedFood.getSubCategory() != null &&
                    updatedFood.getSubCategory().getName() != null &&
                    !updatedFood.getSubCategory().getName().trim().isEmpty()) {

                String subCategoryName =
                        updatedFood.getSubCategory().getName().trim();

                SubCategory subCategory =
                        subCategoryRepository.findByNameAndCategory(
                                subCategoryName,
                                category
                        );

                if (subCategory == null) {
                    subCategory = new SubCategory();
                    subCategory.setName(subCategoryName);
                    subCategory.setCategory(category);
                    subCategoryRepository.save(subCategory);
                }

                existingFood.setSubCategory(subCategory);
            } else {
                existingFood.setSubCategory(null);
            }
        }

        Food savedFood = foodService.saveFood(existingFood);

        return ResponseEntity.ok(
                new FoodResponse(
                        savedFood.getId(),
                        savedFood.getName(),
                        savedFood.getDescription(),
                        savedFood.getPrice(),
                        savedFood.isAvailable(),
                        savedFood.getImages()
                )
        );
    }
    // =====================================================
    // =====================================================
    // ? DELETE FOOD
    // =====================================================

    @DeleteMapping("/foods/{kitchenId}/{foodId}")
    @PreAuthorize("hasAuthority('ROLE_KITCHEN_OWNER')")
    public ResponseEntity<?> deleteFood(
            @PathVariable Long kitchenId,
            @PathVariable Long foodId,
            Authentication authentication) {

        String email = authentication.getName();
        User owner = userRepository.findByEmail(email);
        Kitchen kitchen = kitchenService.getKitchenById(kitchenId);
        Food existingFood = foodService.findFoodById(foodId);

        if (kitchen == null || existingFood == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Kitchen or Food not found");
        }

        if (!kitchen.getOwner().getId().equals(owner.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        if (existingFood.getKitchen() == null ||
                !existingFood.getKitchen().getId().equals(kitchenId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Food does not belong to this kitchen");
        }

        foodService.deleteFood(foodId);
        return ResponseEntity.ok(Map.of("message", "Food deleted successfully"));
    }
    // UPDATE MY KITCHEN PROFILE (matches frontend route)
    // =====================================================
    @PutMapping(value = "/update-my-kitchen/{kitchenId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_KITCHEN_OWNER')")
    public ResponseEntity<?> updateMyKitchen(
            @PathVariable Long kitchenId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String openingHours,
            @RequestParam(required = false) String closingHours,
            @RequestParam(required = false) Boolean open,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication) {

        String email = authentication.getName();
        User owner = userRepository.findByEmail(email);

        Kitchen kitchen;
        try {
            kitchen = kitchenService.getKitchenById(kitchenId);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Kitchen not found"));
        }

        if (owner == null || kitchen.getOwner() == null || !kitchen.getOwner().getId().equals(owner.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
        }

        try {
            KitchenUpdateRequest request = new KitchenUpdateRequest();
            request.setName(name);
            request.setAddress(address);
            request.setDescription(description);
            request.setOpeningHours(openingHours);
            request.setClosingHours(closingHours);
            request.setOpen(open != null ? open : kitchen.isOpen());

            Kitchen updated = kitchenService.updateKitchen(kitchenId, request, image);

            return ResponseEntity.ok(Map.of(
                    "id", updated.getId(),
                    "name", updated.getName(),
                    "address", updated.getAddress(),
                    "description", updated.getDescription(),
                    "openingHours", updated.getOpeningHours(),
                    "closingHours", updated.getClosingHours(),
                    "open", updated.isOpen(),
                    "logoUrl", updated.getLogoUrl(),
                    "images", updated.getImages() == null ? List.of() : updated.getImages(),
                    "message", "Kitchen updated successfully"
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update kitchen", "error", ex.getMessage()));
        }
    }
}









