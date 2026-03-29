package com.cloudbite.service.impl;

import com.cloudbite.config.JwtProvider;
import com.cloudbite.model.USER_ROLE;
import com.cloudbite.model.User;
import com.cloudbite.repository.UserRepository;
import com.cloudbite.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;



@Service
public class UserServiceImpl implements UserService, UserDetailsService {

    @Autowired
    private JwtProvider jwtProvider;


    @Autowired
    private UserRepository userRepository;

    // ✅ Find by ID
    @Override
    public User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("❌ User not found with id: " + id));
    }

    // ✅ Find by Email
    @Override
    public User findUserByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("❌ User not found with email: " + email);
        }
        return user;
    }

    // ✅ Save or update user
    @Override
    public User saveUser(User user) {
        if (user.getRole() == null) {
            user.setRole(USER_ROLE.ROLE_CUSTOMER);
        }
        return userRepository.save(user);
    }

    // ✅ Used for Spring Security authentication
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username);

        if (user == null) {
            throw new UsernameNotFoundException("❌ User not found with email: " + username);
        }

        USER_ROLE role = user.getRole() != null ? user.getRole() : USER_ROLE.ROLE_CUSTOMER;

        GrantedAuthority authority = new SimpleGrantedAuthority(role.name());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(authority)
        );
    }

    @Override
    public User findUserByJwt(String jwt) {
        if (jwt == null || jwt.isEmpty()) {
            return null;
        }

        // Remove "Bearer " if present
        String token = jwt.startsWith("Bearer ") ? jwt.substring(7) : jwt;

        try {
            // ✅ Use injected JwtProvider service (non-static)
            String email = jwtProvider.getEmailFromJwtToken("Bearer " + token);
            return userRepository.findByEmail(email);
        } catch (Exception e) {
            System.out.println("❌ Invalid token or user not found: " + e.getMessage());
            return null;
        }
    }


}
