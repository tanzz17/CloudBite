package com.cloudbite.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = false)
public class KitchenDto {

    private Long id;
    private String name;
    private String description;
    private String openingHours;
    private String closingHours;
    private boolean open;
    private List<String> images;
}
