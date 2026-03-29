package com.cloudbite.controller;

import com.cloudbite.model.Customer;
import com.cloudbite.model.USER_ROLE;
import com.cloudbite.model.User;
import com.cloudbite.repository.CustomerRepository;
import com.cloudbite.repository.UserRepository;
import com.cloudbite.response.CustomerProfileResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    // -------------------------------------------------
    // 🔹 1. GET all customers
    // -------------------------------------------------
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllCustomers() {
        List<User> customers = userRepository.findByRole(USER_ROLE.ROLE_CUSTOMER);
        return ResponseEntity.ok(customers);
    }

    // -------------------------------------------------
    // 🔹 2. GET a specific customer by User ID
    // -------------------------------------------------
    @GetMapping("/{userId}")
    public ResponseEntity<?> getCustomerByUserId(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + userId));

            if (user.getRole() != USER_ROLE.ROLE_CUSTOMER) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("This user is not a customer");
            }

            Customer customer = customerRepository.findByUser_Id(userId)
                    .orElseGet(() -> {
                        Customer newCustomer = new Customer();
                        newCustomer.setUser(user);
//                        newCustomer.setPhone(user.getPhone());
//                        newCustomer.setAddress(user.getAddress());
//                        newCustomer.setPlace(user.getPlace());
//                        newCustomer.setPostalCode(user.getPostalCode());
                        return customerRepository.save(newCustomer);
                    });

            return ResponseEntity.ok(customer);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching customer by userId");
        }
    }

    // -------------------------------------------------
    // 🔹 3. UPDATE customer profile
    // -------------------------------------------------
    @PutMapping("/update/{userId}")
    public ResponseEntity<?> updateCustomerProfile(
            @PathVariable Long userId,
            @RequestBody Customer updatedCustomer
    ) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + userId));

            if (user.getRole() != USER_ROLE.ROLE_CUSTOMER) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("This user is not a customer");
            }


            // ✅ Update Customer table fields
            Customer customer = customerRepository.findByUser_Id(userId).orElse(new Customer());
            customer.setUser(user);
            customer.setPhone(updatedCustomer.getPhone());
            customer.setAddress(updatedCustomer.getAddress());
            customer.setPlace(updatedCustomer.getPlace());
            customer.setPostalCode(updatedCustomer.getPostalCode());

            Customer savedCustomer = customerRepository.save(customer);

            return ResponseEntity.ok(savedCustomer);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating customer profile");
        }
    }

    // -------------------------------------------------
    // 🔹 4. GET Customer by Email or User ID (smart)
    // -------------------------------------------------
    @GetMapping("/profile")
    public ResponseEntity<?> getCustomerProfile(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId
    ) {
        try {
            Customer customer = null;
            User user = null;

            if (email != null && !email.isEmpty()) {
                // 🔸 Try via Email (manual query)
                customer = customerRepository.findCustomerByEmail(email).orElse(null);
                user = userRepository.findByEmail(email);
            }

            if (customer == null && userId != null) {
                // 🔸 Fallback via User ID
                customer = customerRepository.findByUser_Id(userId).orElse(null);
                user = userRepository.findById(userId).orElse(null);
            }

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            // 🔸 Auto-create if missing
            if (customer == null) {
                customer = new Customer();
                customer.setUser(user);
                customer = customerRepository.save(customer);
            }

            CustomerProfileResponse response = new CustomerProfileResponse(
                    user.getFullName(),
                    user.getEmail(),
                    customer.getPhone(),
                    customer.getAddress(),
                    customer.getPlace(),
                    customer.getPostalCode()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching customer profile");
        }
    }
}
