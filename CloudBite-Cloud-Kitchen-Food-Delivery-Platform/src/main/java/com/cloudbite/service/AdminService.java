package com.cloudbite.service;

import com.cloudbite.model.Kitchen;
import com.cloudbite.model.User;

public interface AdminService {
    User createKitchenOwner(User owner);
    Kitchen registerKitchen(Kitchen kitchen, User owner);
}
