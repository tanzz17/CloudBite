package com.cloudbite.repository;

import com.cloudbite.model.Kitchen;
import com.cloudbite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KitchenRepository extends JpaRepository<Kitchen, Long> {

    Optional<Kitchen> findByName(String name);

    List<Kitchen> findByNameContainingIgnoreCase(String keyword);

    List<Kitchen> findByOwner(User owner);

    @Query(value = "SELECT images FROM kitchen_images WHERE kitchen_id = :kitchenId", nativeQuery = true)
    List<String> findImageUrlsByKitchenId(@Param("kitchenId") Long kitchenId);


}
