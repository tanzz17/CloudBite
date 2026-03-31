package com.cloudbite.repository;

import com.cloudbite.model.Kitchen;
import com.cloudbite.model.User;
import com.cloudbite.repository.projection.KitchenAdminRow;
import com.cloudbite.repository.projection.KitchenPublicRow;
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

    @Query(value = """
            SELECT
                k.id AS id,
                k.name AS name,
                k.address AS address,
                COALESCE(k.owner_name, 'No owner') AS ownerName,
                COALESCE(u.email, 'No owner') AS ownerEmail
            FROM kitchen k
            LEFT JOIN user u ON k.owner_id = u.id
            ORDER BY k.id DESC
            """, nativeQuery = true)
    List<KitchenAdminRow> findAllAdminKitchenRows();

    @Query(value = """
            SELECT
                k.id AS id,
                k.name AS name,
                k.description AS description,
                k.address AS address,
                k.owner_name AS ownerName,
                k.opening_hours AS openingHours,
                k.closing_hours AS closingHours,
                k.is_open AS open,
                k.logo_url AS logoUrl
            FROM kitchen k
            ORDER BY k.id DESC
            """, nativeQuery = true)
    List<KitchenPublicRow> findAllPublicKitchenRows();

    @Query(value = """
            SELECT
                k.id AS id,
                k.name AS name,
                k.description AS description,
                k.address AS address,
                k.owner_name AS ownerName,
                k.opening_hours AS openingHours,
                k.closing_hours AS closingHours,
                k.is_open AS open,
                k.logo_url AS logoUrl
            FROM kitchen k
            WHERE k.id = :kitchenId
            """, nativeQuery = true)
    Optional<KitchenPublicRow> findPublicKitchenRowById(@Param("kitchenId") Long kitchenId);


}
