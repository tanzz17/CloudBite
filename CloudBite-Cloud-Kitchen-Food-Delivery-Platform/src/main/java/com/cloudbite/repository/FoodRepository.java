package com.cloudbite.repository;

import com.cloudbite.model.Food;
import com.cloudbite.model.Kitchen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface FoodRepository extends JpaRepository<Food, Long> {

    // Find all foods for a specific kitchen (useful for kitchen owner)
    List<Food> findByKitchenId(Long kitchenId);

    // Alternative way: find foods by kitchen entity
    List<Food> findByKitchen(Kitchen kitchen);

    // Search foods by name (useful for customer search)
    List<Food> findByNameContainingIgnoreCase(String keyword);

    @Query("""
    SELECT f FROM Food f
    JOIN f.category c
    JOIN FETCH f.kitchen k
    WHERE LOWER(c.name) = LOWER(:categoryName)
    AND f.available = true
""")
    List<Food> findAvailableFoodsByCategoryName(String categoryName);


    @Query(value = """
    SELECT 
        f.id,
        f.name,
        f.description,
        f.price,
        f.available,
        f.kitchen_id AS kitchenId,
        GROUP_CONCAT(fi.images) AS images
    FROM food f
    LEFT JOIN food_images fi ON f.id = fi.food_id
    GROUP BY f.id, f.name, f.description, f.price, f.available, f.kitchen_id
""", nativeQuery = true)
    List<Map<String, Object>> findAllFoodsWithImages();


    // Search foods by name (useful for customer search)
    @Query("SELECT f FROM Food f LEFT JOIN FETCH f.kitchen k WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Food> searchFoodsWithKitchenEagerly(@Param("keyword") String keyword);


    @Query("""
    SELECT f FROM Food f
    JOIN f.subCategory sc
    JOIN FETCH f.kitchen k
    WHERE LOWER(sc.name) = LOWER(:subCategoryName)
    AND f.available = true
""")
    List<Food> findAvailableFoodsBySubCategoryName(@Param("subCategoryName") String subCategoryName);

    List<Food> findByCategory_Name(String categoryName);




}
