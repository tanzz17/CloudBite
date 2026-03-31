package com.cloudbite.repository;

import com.cloudbite.dto.AdminDeliveryPartnerRow;
import com.cloudbite.model.DeliveryPartner;
import com.cloudbite.model.DeliveryPartnerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DeliveryPartnerRepository
        extends JpaRepository<DeliveryPartner, Long> {

    Optional<DeliveryPartner> findByUser_Email(String email);

    Optional<DeliveryPartner> findFirstByStatus(DeliveryPartnerStatus status);

    long countByStatusNot(DeliveryPartnerStatus status);

    @Query("""
            SELECT new com.cloudbite.dto.AdminDeliveryPartnerRow(
                dp.id,
                u.fullName,
                u.email,
                dp.phone,
                dp.vehicleType,
                dp.status
            )
            FROM DeliveryPartner dp
            LEFT JOIN dp.user u
            ORDER BY dp.id DESC
            """)
    List<AdminDeliveryPartnerRow> findAllAdminRows();

}
