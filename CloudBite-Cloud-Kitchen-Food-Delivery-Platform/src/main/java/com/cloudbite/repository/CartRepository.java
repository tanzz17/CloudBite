package com.cloudbite.repository;

import com.cloudbite.model.Cart;
import com.cloudbite.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    // ✅ Find cart by customer (existing)
    Optional<Cart> findByCustomer_Id(Long customerId);

    // ✅ Direct way: find cart by user's ID
    @Query("SELECT c FROM Cart c WHERE c.customer.user.id = :userId")
    Optional<Cart> findByUserId(@Param("userId") Long userId);

    Optional<Cart> findByCustomer(Customer customer);  // ✅ this must exist

    @Query("SELECT c FROM Cart c JOIN FETCH c.items WHERE c.id = :cartId")
    Cart findCartWithItems(@Param("cartId") Long cartId);


}
