package com.cloudbite.repository;

import com.cloudbite.model.Category;
import com.cloudbite.model.Kitchen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // ✅ Find category inside specific kitchen
    Category findByNameAndKitchen(String name, Kitchen kitchen);

    // ✅ Get all unique category names across all kitchens
    @Query("SELECT DISTINCT c.name FROM Category c")
    List<String> findDistinctCategoryNames();

    // ✅ Get all categories of one kitchen
    List<Category> findByKitchen(Kitchen kitchen);
}
