package com.cloudbite.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReorderDishDTO {

    private Long dishId;
    private String dishName;
    private Double price;
    private String imageUrl;
    private String kitchenName;
}