package com.cloudbite.repository;

import com.cloudbite.model.SubCategory;
import com.cloudbite.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {

    // ✅ Find subcategory under specific category
    SubCategory findByNameAndCategory(String name, Category category);

    // ✅ Get all subcategories under one category
    List<SubCategory> findByCategory(Category category);
}
