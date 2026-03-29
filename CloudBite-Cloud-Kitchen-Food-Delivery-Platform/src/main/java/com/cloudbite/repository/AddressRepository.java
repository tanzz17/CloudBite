package com.cloudbite.repository;

import com.cloudbite.model.Address;
import com.cloudbite.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {

    boolean existsByCustomerAndStreetIgnoreCase(Customer customer, String street);
}
