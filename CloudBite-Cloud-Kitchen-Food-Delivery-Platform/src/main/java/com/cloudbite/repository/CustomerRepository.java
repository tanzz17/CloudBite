package com.cloudbite.repository;

import com.cloudbite.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // 🔹 Find customer by linked user ID
    Optional<Customer> findByUser_Id(Long userId);

    // 🔹 Manual JPQL query to find by user's email
    @Query("SELECT c FROM Customer c WHERE c.user.email = :email")
    Optional<Customer> findCustomerByEmail(@Param("email") String email);
}
