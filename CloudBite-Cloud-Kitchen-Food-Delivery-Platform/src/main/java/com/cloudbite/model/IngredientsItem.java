package com.cloudbite.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class IngredientsItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    private IngredientCategory category;

    @JsonIgnore
    @ManyToOne
    private Kitchen kitchen;

    @ManyToMany(mappedBy = "ingredients")
    private List<Food> foods = new ArrayList<>();

    private boolean inStock = true;
}