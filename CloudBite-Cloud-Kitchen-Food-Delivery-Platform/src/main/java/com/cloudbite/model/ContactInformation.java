package com.cloudbite.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class ContactInformation {
    private String email;
    private String phone;
    private String instagram;
}