package com.cloudbite.service;

import com.cloudbite.model.Kitchen;
import com.cloudbite.model.User;
import com.cloudbite.request.KitchenUpdateRequest;
import com.cloudbite.response.KitchenResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface KitchenService {

    Kitchen registerKitchen(Kitchen kitchen, User owner);

    List<KitchenResponse> getAllKitchens();

    KitchenResponse getKitchenResponseById(Long id); // 🎯 Correct DTO-returning method

    Kitchen getKitchenById(Long id);

    List<Kitchen> searchKitchens(String keyword);

    void deleteKitchen(Long id);

    List<Kitchen> getKitchensByOwner(User owner);

    Kitchen updateKitchen(Long kitchenId, KitchenUpdateRequest request, MultipartFile logoFile);

    // ✅ Only upload logo (optional separate use)
    Kitchen uploadLogo(Long kitchenId, MultipartFile logoFile);
    Kitchen updateKitchen(Kitchen kitchen);

    Kitchen saveKitchen(Kitchen kitchen);

    Kitchen saveOrUpdateKitchen(Kitchen kitchen);
}