package com.cloudbite.service.impl;

import com.cloudbite.model.Kitchen;
import com.cloudbite.model.User;
import com.cloudbite.repository.KitchenRepository;
import com.cloudbite.repository.projection.KitchenPublicRow;
import com.cloudbite.request.KitchenUpdateRequest;
import com.cloudbite.response.KitchenResponse;
import com.cloudbite.service.KitchenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.multipart.MultipartFile;

@Service
public class KitchenServiceImpl implements KitchenService {

    @Value("${app.backend.public-url:}")
    private String backendPublicUrl;

    @Autowired
    private KitchenRepository kitchenRepository;

    private String stripStoredAssetUrl(String storedUrl) {
        if (storedUrl == null || storedUrl.isBlank()) {
            return "";
        }
        String s = storedUrl
                .replace("http://localhost:8080/", "")
                .replace("https://cloudbite-backend-production.up.railway.app/", "");
        if (backendPublicUrl != null && !backendPublicUrl.isBlank()) {
            String prefix = backendPublicUrl.endsWith("/") ? backendPublicUrl : backendPublicUrl + "/";
            s = s.replace(prefix, "");
        }
        return s.replaceFirst("^/+", "");
    }

    @Override
    public Kitchen registerKitchen(Kitchen kitchen, User owner) {
        kitchen.setOwner(owner);
        kitchen.setCreatedAt(LocalDateTime.now());
        kitchen.setOpen(true);
        return kitchenRepository.save(kitchen);
    }
    @Override
    public List<KitchenResponse> getAllKitchens() {
        List<KitchenPublicRow> kitchens = kitchenRepository.findAllPublicKitchenRows();
        List<KitchenResponse> responses = new ArrayList<>();

        for (KitchenPublicRow kitchen : kitchens) {
            KitchenResponse response = new KitchenResponse();
            response.setId(kitchen.getId());
            response.setName(kitchen.getName());
            response.setDescription(kitchen.getDescription());
            response.setOwnerId(null);
            response.setOwnerName(kitchen.getOwnerName());
            response.setAddress(kitchen.getAddress());
            response.setOpeningHours(kitchen.getOpeningHours());
            response.setClosingHours(kitchen.getClosingHours());
            response.setOpen(Boolean.TRUE.equals(kitchen.getOpen()));

            String logoUrl = kitchen.getLogoUrl();
            if (logoUrl == null || logoUrl.isEmpty()) {
                List<String> imageUrls = kitchenRepository.findImageUrlsByKitchenId(kitchen.getId());
                if (imageUrls != null && !imageUrls.isEmpty()) {
                    logoUrl = imageUrls.get(0);
                }
            }

            response.setLogoUrl(logoUrl);

            response.setImages(kitchenRepository.findImageUrlsByKitchenId(kitchen.getId()));

            responses.add(response);
        }
        return responses;
    }


    @Override
    public Kitchen getKitchenById(Long id) {
        return kitchenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kitchen not found with ID: " + id));
    }

    // 🎯 ADDED: Implementation for the DTO-returning method
    @Override
    public KitchenResponse getKitchenResponseById(Long id) {
        return kitchenRepository.findPublicKitchenRowById(id)
                .map(this::convertToKitchenResponse)
                .orElse(null);
    }

    private KitchenResponse convertToKitchenResponse(KitchenPublicRow kitchen) {
        if (kitchen == null) {
            return null;
        }

        KitchenResponse response = new KitchenResponse();
        response.setId(kitchen.getId());
        response.setName(kitchen.getName());
        response.setDescription(kitchen.getDescription());
        response.setAddress(kitchen.getAddress());
        response.setOpeningHours(kitchen.getOpeningHours());
        response.setClosingHours(kitchen.getClosingHours());
        response.setOpen(Boolean.TRUE.equals(kitchen.getOpen()));
        response.setOwnerId(null);
        response.setOwnerName(kitchen.getOwnerName());
        response.setLogoUrl(kitchen.getLogoUrl());
        List<String> images = kitchenRepository.findImageUrlsByKitchenId(kitchen.getId());
        response.setImages(images);

        return response;
    }

    @Override
    public List<Kitchen> searchKitchens(String keyword) {
        return kitchenRepository.findByNameContainingIgnoreCase(keyword);
    }


    @Override
    public void deleteKitchen(Long id) {
        Kitchen kitchen = kitchenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kitchen not found with ID: " + id));

        kitchenRepository.delete(kitchen);
    }


    @Override
    public List<Kitchen> getKitchensByOwner(User owner) {
        return kitchenRepository.findByOwner(owner);
    }

    @Override
    public Kitchen updateKitchen(Long kitchenId, KitchenUpdateRequest request, MultipartFile logoFile) {
        Kitchen kitchen = kitchenRepository.findById(kitchenId)
                .orElseThrow(() -> new RuntimeException("Kitchen not found"));

        // ✅ Update all text fields if provided
        if (request.getName() != null && !request.getName().isEmpty()) {
            kitchen.setName(request.getName());
        }
        if (request.getAddress() != null && !request.getAddress().isEmpty()) {
            kitchen.setAddress(request.getAddress());
        }
        if (request.getDescription() != null) {
            kitchen.setDescription(request.getDescription());
        }
        if (request.getOpeningHours() != null) {
            kitchen.setOpeningHours(request.getOpeningHours());
        }
        if (request.getClosingHours() != null) {
            kitchen.setClosingHours(request.getClosingHours());
        }
        kitchen.setOpen(request.isOpen());
        kitchen.setUpdatedAt(LocalDateTime.now());

        // ✅ Handle logo upload
        if (logoFile != null && !logoFile.isEmpty()) {
            try {
                String uploadDir = "uploads/kitchen-logos/";
                Files.createDirectories(Paths.get(uploadDir));

                // Delete old logo if exists
                if (kitchen.getImages() != null && !kitchen.getImages().isEmpty()) {
                    String oldPath = stripStoredAssetUrl(kitchen.getImages().get(0));
                    File oldFile = new File(oldPath);
                    if (oldFile.exists()) oldFile.delete();
                }

                // Save new logo
                String fileName = "logo_" + kitchenId + "_" + System.currentTimeMillis() + ".png";
                Path filePath = Paths.get(uploadDir, fileName);
                Files.write(filePath, logoFile.getBytes());

                String imageUrl = "/" + uploadDir + fileName;

                List<String> images = kitchen.getImages() == null ? new ArrayList<>() : kitchen.getImages();
                if (images.isEmpty()) images.add(imageUrl);
                else images.set(0, imageUrl);

                kitchen.setImages(images);
            } catch (Exception e) {
                throw new RuntimeException("Error uploading logo: " + e.getMessage());
            }
        }

        return kitchenRepository.save(kitchen);
    }

    @Override
    public Kitchen uploadLogo(Long kitchenId, MultipartFile logoFile) {
        Kitchen kitchen = kitchenRepository.findById(kitchenId)
                .orElseThrow(() -> new RuntimeException("Kitchen not found with ID: " + kitchenId));

        try {
            String uploadDir = "uploads/kitchen-logos/";
            Files.createDirectories(Paths.get(uploadDir));

            // ✅ Delete old logo if exists
            if (kitchen.getLogoUrl() != null && !kitchen.getLogoUrl().isBlank()) {
                String oldPath = stripStoredAssetUrl(kitchen.getLogoUrl());
                File oldFile = new File(oldPath);
                if (oldFile.exists()) oldFile.delete();
            }

            // ✅ Save new file
            String fileName = "logo_" + kitchenId + "_" + System.currentTimeMillis() + ".png";
            Path filePath = Paths.get(uploadDir, fileName);
            Files.write(filePath, logoFile.getBytes());

            // ✅ Build and save URL
            String logoUrl = "/" + uploadDir + fileName;
            kitchen.setLogoUrl(logoUrl);
            kitchen.setUpdatedAt(LocalDateTime.now());

            Kitchen updated = kitchenRepository.save(kitchen);

            return updated; // ✅ returns the updated kitchen with logoUrl

        } catch (Exception e) {
            throw new RuntimeException("Error uploading logo: " + e.getMessage(), e);
        }
    }

    @Override
    public Kitchen updateKitchen(Kitchen kitchen) {
        return kitchenRepository.save(kitchen);
    }

    public Kitchen saveKitchen(Kitchen kitchen) {
        return kitchenRepository.save(kitchen);
    }

    @Override
    public Kitchen saveOrUpdateKitchen(Kitchen kitchen) {
        return kitchenRepository.save(kitchen);
    }
}
