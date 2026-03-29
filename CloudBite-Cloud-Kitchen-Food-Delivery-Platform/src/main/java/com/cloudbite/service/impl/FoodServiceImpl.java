package com.cloudbite.service.impl;

import com.cloudbite.response.FoodResponse;
import com.cloudbite.model.Food;
import com.cloudbite.model.Kitchen;
import com.cloudbite.repository.FoodRepository;
import com.cloudbite.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class FoodServiceImpl implements FoodService {

    @Autowired
    private FoodRepository foodRepository;

    @Override
    public Food findFoodById(Long id) {
        return foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found with id: " + id));
    }

    @Override
    public List<Food> getAllFoods() {
        return foodRepository.findAll();
    }

    @Override
    public List<Food> getFoodsByKitchen(Long kitchenId) {
        return foodRepository.findByKitchenId(kitchenId);
    }

    @Override
    public List<Food> getFoodsByKitchen(Kitchen kitchen) {
        return foodRepository.findByKitchen(kitchen);
    }

    @Override
    public Food saveFood(Food food) {
        return foodRepository.save(food);
    }

    @Override
    public void deleteFood(Long id) {
        if (!foodRepository.existsById(id)) {
            throw new RuntimeException("Food not found with id: " + id);
        }
        foodRepository.deleteById(id);
    }

    // ✅ Kitchen Owner View
    @Override
    public List<FoodResponse> getFoodsResponseByKitchen(Long kitchenId) {

        List<Food> foods = foodRepository.findByKitchenId(kitchenId);

        return foods.stream().map(food -> {

            FoodResponse response = new FoodResponse();

            response.setId(food.getId());
            response.setName(food.getName());
            response.setDescription(food.getDescription());
            response.setPrice(food.getPrice());
            response.setAvailable(food.isAvailable());
            response.setVegetarian(food.isVegetarian());
            response.setSeasonal(food.isSeasonal());
            response.setImages(food.getImages());

            // ✅ Category
            response.setCategoryName(
                    food.getCategory() != null ?
                            food.getCategory().getName() :
                            "Uncategorized"
            );

            // ✅ NEW: SubCategory
            response.setSubCategoryName(
                    food.getSubCategory() != null ?
                            food.getSubCategory().getName() :
                            null
            );

            return response;

        }).collect(Collectors.toList());
    }


    // ✅ Public All Foods
    @Override
    public List<FoodResponse> getAllFoodsResponse() {

        List<Map<String, Object>> rows = foodRepository.findAllFoodsWithImages();

        return rows.stream().map(row -> {

            String imagesStr = (String) row.get("images");
            List<String> imageList = (imagesStr != null)
                    ? List.of(imagesStr.split(","))
                    : List.of();

            FoodResponse response = new FoodResponse();

            response.setId(((Number) row.get("id")).longValue());
            response.setName((String) row.get("name"));
            response.setDescription((String) row.get("description"));
            response.setPrice(((Number) row.get("price")).doubleValue());
            response.setAvailable((Boolean) row.get("available"));
            response.setImages(imageList);
            response.setKitchenId(((Number) row.get("kitchenId")).longValue());

            return response;

        }).toList();
    }


    // ✅ Search Dishes
    @Override
    public List<FoodResponse> searchFoods(String keyword) {

        List<Food> foods = foodRepository.searchFoodsWithKitchenEagerly(keyword);

        return foods.stream().map(food -> {

            FoodResponse response = new FoodResponse();

            response.setId(food.getId());
            response.setName(food.getName());
            response.setDescription(food.getDescription());
            response.setPrice(food.getPrice());
            response.setAvailable(food.isAvailable());
            response.setVegetarian(food.isVegetarian());
            response.setSeasonal(food.isSeasonal());
            response.setImages(food.getImages());

            // Category
            response.setCategoryName(
                    food.getCategory() != null ?
                            food.getCategory().getName() :
                            "Uncategorized"
            );

            // ✅ SubCategory
            response.setSubCategoryName(
                    food.getSubCategory() != null ?
                            food.getSubCategory().getName() :
                            null
            );

            // Kitchen
            if (food.getKitchen() != null) {
                response.setKitchenId(food.getKitchen().getId());
                response.setKitchenName(food.getKitchen().getName());
            } else {
                response.setKitchenName("Unknown Kitchen");
            }

            return response;

        }).collect(Collectors.toList());
    }


    // ✅ Filter by Category
    @Override
    public List<FoodResponse> getFoodsByCategoryName(String categoryName) {

        List<Food> foods =
                foodRepository.findAvailableFoodsByCategoryName(categoryName);

        return foods.stream().map(food -> {

            FoodResponse response = new FoodResponse();

            response.setId(food.getId());
            response.setName(food.getName());
            response.setDescription(food.getDescription());
            response.setPrice(food.getPrice());
            response.setAvailable(food.isAvailable());
            response.setVegetarian(food.isVegetarian());
            response.setSeasonal(food.isSeasonal());
            response.setImages(food.getImages());

            response.setCategoryName(
                    food.getCategory() != null ?
                            food.getCategory().getName() :
                            "Uncategorized"
            );

            response.setSubCategoryName(
                    food.getSubCategory() != null ?
                            food.getSubCategory().getName() :
                            null
            );

            if (food.getKitchen() != null) {
                response.setKitchenId(food.getKitchen().getId());
                response.setKitchenName(food.getKitchen().getName());
            }

            return response;

        }).toList();
    }


    // ✅ NEW: Filter by SubCategory
    @Override
    public List<FoodResponse> getFoodsBySubCategoryName(String subCategoryName) {

        List<Food> foods =
                foodRepository.findAvailableFoodsBySubCategoryName(subCategoryName);

        return foods.stream().map(food -> {

            FoodResponse response = new FoodResponse();

            response.setId(food.getId());
            response.setName(food.getName());
            response.setDescription(food.getDescription());
            response.setPrice(food.getPrice());
            response.setAvailable(food.isAvailable());
            response.setVegetarian(food.isVegetarian());
            response.setSeasonal(food.isSeasonal());
            response.setImages(food.getImages());

            response.setCategoryName(
                    food.getCategory() != null ?
                            food.getCategory().getName() :
                            "Uncategorized"
            );

            response.setSubCategoryName(
                    food.getSubCategory() != null ?
                            food.getSubCategory().getName() :
                            null
            );

            if (food.getKitchen() != null) {
                response.setKitchenId(food.getKitchen().getId());
                response.setKitchenName(food.getKitchen().getName());
            }

            return response;

        }).toList();
    }


    @Override
    public List<String> getSubCategoriesByCategoryName(String categoryName) {

        List<Food> foods = foodRepository.findByCategory_Name(categoryName);

        return foods.stream()
                .filter(food -> food.getSubCategory() != null)
                .map(food -> food.getSubCategory().getName())
                .distinct()
                .toList();
    }

    @Override
    public List<FoodResponse> getAddonRecommendations(Long foodId, int limit) {
        Food baseFood = findFoodById(foodId);
        if (baseFood.getKitchen() == null) {
            return List.of();
        }

        List<Food> kitchenFoods = foodRepository.findByKitchenId(baseFood.getKitchen().getId());
        if (kitchenFoods.isEmpty()) {
            return List.of();
        }

        String baseSubCategory =
                baseFood.getSubCategory() != null ? baseFood.getSubCategory().getName() : null;
        String baseCategory =
                baseFood.getCategory() != null ? baseFood.getCategory().getName() : null;

        List<Food> preferred = kitchenFoods.stream()
                .filter(food -> food.isAvailable() && !food.getId().equals(foodId))
                .filter(food -> {
                    if (baseSubCategory != null) {
                        return food.getSubCategory() != null
                                && baseSubCategory.equalsIgnoreCase(food.getSubCategory().getName());
                    }
                    if (baseCategory != null) {
                        return food.getCategory() != null
                                && baseCategory.equalsIgnoreCase(food.getCategory().getName());
                    }
                    return false;
                })
                .toList();

        List<Food> fallback = kitchenFoods.stream()
                .filter(food -> food.isAvailable() && !food.getId().equals(foodId))
                .filter(food -> preferred.stream().noneMatch(p -> p.getId().equals(food.getId())))
                .toList();

        List<Food> combined = new ArrayList<>();
        combined.addAll(preferred);
        combined.addAll(fallback);

        return combined.stream()
                .limit(Math.max(0, limit))
                .map(this::mapToFoodResponse)
                .toList();
    }

    private FoodResponse mapToFoodResponse(Food food) {
        FoodResponse response = new FoodResponse();
        response.setId(food.getId());
        response.setName(food.getName());
        response.setDescription(food.getDescription());
        response.setPrice(food.getPrice());
        response.setAvailable(food.isAvailable());
        response.setVegetarian(food.isVegetarian());
        response.setSeasonal(food.isSeasonal());
        response.setImages(food.getImages());
        response.setCategoryName(
                food.getCategory() != null ? food.getCategory().getName() : "Uncategorized"
        );
        response.setSubCategoryName(
                food.getSubCategory() != null ? food.getSubCategory().getName() : null
        );
        if (food.getKitchen() != null) {
            response.setKitchenId(food.getKitchen().getId());
            response.setKitchenName(food.getKitchen().getName());
        }
        return response;
    }

}
