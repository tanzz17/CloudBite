package com.cloudbite.config;

import com.cloudbite.model.USER_ROLE;
import com.cloudbite.model.User;
import com.cloudbite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "cloudbiteowner@gmail.com";

        if (userRepository.findByEmail(adminEmail) == null) {
            User admin = new User();
            admin.setFullName("CloudBite Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123")); // Default password
            admin.setRole(USER_ROLE.ROLE_ADMIN);

            userRepository.save(admin);
            System.out.println("✅ Admin user created: " + adminEmail + " / admin123");
        } else {
            System.out.println("✅ Admin already exists: " + adminEmail);
        }
    }
}
