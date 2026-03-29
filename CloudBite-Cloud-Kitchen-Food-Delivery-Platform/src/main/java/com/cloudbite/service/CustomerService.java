package com.cloudbite.service;

import com.cloudbite.model.Customer;
import com.cloudbite.model.User;
import com.cloudbite.repository.CustomerRepository;
import com.cloudbite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    // 🔹 Get customer by User ID
    public Customer getCustomerByUserId(Long userId) {
        return customerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found for User ID: " + userId));
    }

    // 🔹 Get customer by User Email (manual JPQL query)
    public Customer getCustomerByEmail(String email) {
        return customerRepository.findCustomerByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found for Email: " + email));
    }

    // 🔹 Update both User + Customer tables
    public Customer updateCustomer(Long userId, Customer updatedCustomer) {
        // Fetch linked user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Update user details (if you allow editing name/email)
        if (updatedCustomer.getUser() != null) {
            User updatedUser = updatedCustomer.getUser();
            if (updatedUser.getFullName() != null) user.setFullName(updatedUser.getFullName());
            if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
        }

        userRepository.save(user);

        // Update Customer table
        Customer existing = customerRepository.findByUser_Id(userId).orElse(new Customer());
        existing.setUser(user);
        existing.setPhone(updatedCustomer.getPhone());
        existing.setAddress(updatedCustomer.getAddress());
        existing.setPlace(updatedCustomer.getPlace());
        existing.setPostalCode(updatedCustomer.getPostalCode());

        return customerRepository.save(existing);
    }
}
