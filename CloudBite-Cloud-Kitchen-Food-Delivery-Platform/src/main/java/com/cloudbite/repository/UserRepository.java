package com.cloudbite.repository;

import com.cloudbite.model.USER_ROLE;
import com.cloudbite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    // ✅ Find user by email (used in login & JWT)
    User findByEmail(String email);

    // ✅ Check if email already exists (used during registration)
    boolean existsByEmail(String email);

    // ✅ Get all users by their role (ADMIN, CUSTOMER, KITCHEN_OWNER)
    List<User> findByRole(USER_ROLE role);

    // ✅ Fetch all customers (role = 'ROLE_CUSTOMER')
    @Query(value = "SELECT * FROM user WHERE role = 'ROLE_CUSTOMER'", nativeQuery = true)
    List<User> findAllCustomers();
}
