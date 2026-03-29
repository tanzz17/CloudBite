package com.cloudbite.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "food")
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ Basic Info
    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private Double price;

    // ✅ Category Relation
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties("foods")
    private Category category;

    // ✅ SubCategory Relation (NEW)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sub_category_id")
    @JsonIgnoreProperties({"foods", "category"})
    private SubCategory subCategory;


    // ✅ Image URLs (auto-delete with food)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "food_images",
            joinColumns = @JoinColumn(name = "food_id", referencedColumnName = "id"),
            foreignKey = @ForeignKey(name = "fk_food_images_food_id")
    )
    @Column(length = 1000)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private List<String> images = new ArrayList<>();

    // ✅ Relation with Kitchen
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kitchen_id")
    @JsonIgnoreProperties({"foods", "categories", "orders"})
    private Kitchen kitchen;

    // ✅ Relation with CartItem (cascade delete)
    @OneToMany(mappedBy = "food", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<CartItem> cartItems;

    // ✅ Status & flags
    private boolean available = true;

    @Column(nullable = false)
    private boolean vegetarian = false; // default Non-Veg unless selected

    private boolean seasonal = false;

    // ✅ Ingredients
    @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
    @JoinTable(
            name = "food_ingredients",
            joinColumns = @JoinColumn(name = "food_id"),
            inverseJoinColumns = @JoinColumn(name = "ingredient_item_id")
    )
    private List<IngredientsItem> ingredients = new ArrayList<>();

    // ✅ Tracking timestamps
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
