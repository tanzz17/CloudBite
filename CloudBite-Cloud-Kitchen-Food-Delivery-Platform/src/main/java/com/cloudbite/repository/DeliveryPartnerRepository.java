package com.cloudbite.repository;

import com.cloudbite.model.DeliveryPartner;
import com.cloudbite.model.DeliveryPartnerStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryPartnerRepository
        extends JpaRepository<DeliveryPartner, Long> {

    Optional<DeliveryPartner> findByUser_Email(String email);

    Optional<DeliveryPartner> findFirstByStatus(DeliveryPartnerStatus status);

    long countByStatusNot(DeliveryPartnerStatus status);

}
