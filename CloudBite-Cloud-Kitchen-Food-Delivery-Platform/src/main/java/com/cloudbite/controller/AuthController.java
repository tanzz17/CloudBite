package com.cloudbite.controller;

import com.cloudbite.config.JwtProvider;
import com.cloudbite.model.*;
import com.cloudbite.repository.*;
import com.cloudbite.request.LoginRequest;
import com.cloudbite.response.AuthResponse;
import com.cloudbite.service.KitchenService;
import com.cloudbite.service.OtpService;
import com.cloudbite.service.impl.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private KitchenRepository kitchenRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtProvider jwtProvider;
    @Autowired private UserServiceImpl userServiceImpl;
    @Autowired private CartRepository cartRepository;
    @Autowired private OtpService otpService;
    @Autowired private KitchenService kitchenService;

    // ✅ Newly added
    @Autowired private CustomerRepository customerRepository;

    // ------------------ 🧍 CUSTOMER SIGNUP ------------------
    @PostMapping("/signup/customer")
    public ResponseEntity<AuthResponse> createCustomer(@RequestBody User user) throws Exception {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new Exception("Email already registered with another account");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(USER_ROLE.ROLE_CUSTOMER);
        User savedUser = userRepository.save(user);

        // ✅ Create linked Customer entry
        Customer customer = new Customer();
        customer.setUser(savedUser);
        customerRepository.save(customer);

        // ✅ Create linked cart for the customer
        Cart cart = new Cart();
        cart.setCustomer(customer); // ✅ Correct link
        cartRepository.save(cart);

        String jwt = generateTokenForUser(savedUser);

        AuthResponse authResponse = new AuthResponse(jwt, "Customer registered successfully", savedUser.getRole(), savedUser);
        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }


    // ------------------ 🧑‍💼 ADMIN CREATES KITCHEN OWNER ------------------
    @PostMapping("/admin/register-kitchen")
    public ResponseEntity<?> createKitchenWithOwner(@RequestBody Map<String, String> request) {

        String fullName = request.get("fullName");
        String email = request.get("email");
        String password = request.get("password");
        String kitchenName = request.get("kitchenName");
        String kitchenAddress = request.get("kitchenAddress");

        if (userRepository.findByEmail(email) != null) {
            return new ResponseEntity<>(Map.of("message", "Email already exists"), HttpStatus.BAD_REQUEST);
        }

        User owner = new User();
        owner.setFullName(fullName);
        owner.setEmail(email);
        owner.setPassword(passwordEncoder.encode(password));
        owner.setRole(USER_ROLE.ROLE_KITCHEN_OWNER);
        userRepository.save(owner);

        Kitchen kitchen = new Kitchen();
        kitchen.setName(kitchenName);
        kitchen.setOwnerName(fullName);
        kitchen.setAddress(kitchenAddress);
        kitchen.setOwner(owner);
        kitchen.setOpen(true);
        kitchenRepository.save(kitchen);

        return new ResponseEntity<>(Map.of(
                "message", "Kitchen & Owner registered successfully!",
                "ownerEmail", email,
                "role", "KITCHEN_OWNER"
        ), HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/delete-kitchen/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> deleteKitchen(@PathVariable Long id) {
        try {
            kitchenService.deleteKitchen(id);
            return ResponseEntity.ok("✅ Kitchen deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("❌ Kitchen not found with ID: " + id);
        }
    }

    // ------------------ 🧑‍💻 ADMIN REGISTRATION (ONE-TIME) ------------------
    @PostMapping("/signup/admin")
    public ResponseEntity<?> createAdmin(@RequestBody User user) throws Exception {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new Exception("Admin already exists with this email");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(USER_ROLE.ROLE_ADMIN);
        userRepository.save(user);

        String jwt = generateTokenForUser(user);
        return new ResponseEntity<>(new AuthResponse(jwt, "Admin registered successfully", user.getRole(), user), HttpStatus.CREATED);
    }

    // ------------------ 🔑 LOGIN ------------------
    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody LoginRequest req) {
        String username = req.getEmail();
        String password = req.getPassword();

        Authentication authentication = authenticate(username, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtProvider.generateJwtToken(authentication);

        // Fetch the full user from DB
        User user = userRepository.findByEmail(username);
        if (user == null) {
            throw new BadCredentialsException("User not found");
        }

        // ✅ Build response properly
        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwtToken(jwt);
        authResponse.setMessage("Login successful");

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String role = authorities.isEmpty() ? null : authorities.iterator().next().getAuthority();
        authResponse.setRole(USER_ROLE.valueOf(role));

        // ✅ Important: Ensure ID, name, and email are included in response
        User cleanUser = new User();
        cleanUser.setId(user.getId());
        cleanUser.setFullName(user.getFullName());
        cleanUser.setEmail(user.getEmail());
        cleanUser.setRole(user.getRole());

        authResponse.setUser(cleanUser);

        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }


    // ------------------ CUSTOMER SIGNUP (ALTERNATE) ------------------
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> createUserHandler(@RequestBody User user) throws Exception {

        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new Exception("Email is already used with another account");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(USER_ROLE.ROLE_CUSTOMER);

        User savedUser = userRepository.save(user);

        // ✅ Create linked Customer entry
        Customer customer = new Customer();
        customer.setUser(savedUser);
        customerRepository.save(customer);

        // ✅ Create cart for each new customer
        Cart cart = new Cart();
        cart.setCustomer(customer); // ✅ link to Customer entity, not User
        cartRepository.save(cart);

        String jwt = generateTokenForUser(savedUser);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwtToken(jwt);
        authResponse.setMessage("Customer registered successfully");
        authResponse.setRole(savedUser.getRole());
        authResponse.setUser(savedUser);

        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }

    // ------------------ 🧾 GET ALL KITCHENS (ADMIN ONLY) ------------------
    @GetMapping("/admin/kitchens")
    public ResponseEntity<List<Map<String, Object>>> getAllKitchens() {
        List<Kitchen> kitchens = kitchenRepository.findAll();

        List<Map<String, Object>> response = new ArrayList<>();

        for (Kitchen kitchen : kitchens) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", kitchen.getId());
            map.put("name", kitchen.getName());
            map.put("address", kitchen.getAddress());
            map.put("ownerName", kitchen.getOwner() != null ? kitchen.getOwner().getFullName() : "No owner");
            map.put("ownerEmail", kitchen.getOwner() != null ? kitchen.getOwner().getEmail() : "No owner");
            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-kitchen")
    @PreAuthorize("hasAuthority('ROLE_KITCHEN_OWNER')")
    public ResponseEntity<?> getMyKitchen(Authentication authentication) {
        try {
            String email = authentication.getName();
            User owner = userRepository.findByEmail(email);

            if (owner == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid owner credentials"));
            }

            List<Kitchen> kitchens = kitchenService.getKitchensByOwner(owner);

            if (kitchens == null || kitchens.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No kitchen found for this owner"));
            }

            Kitchen kitchen = kitchens.get(0);

            String logoUrl = null;
            if (kitchen.getImages() != null && !kitchen.getImages().isEmpty()) {
                logoUrl = kitchen.getImages().get(0);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", kitchen.getId());
            response.put("name", kitchen.getName());
            response.put("description", kitchen.getDescription());
            response.put("address", kitchen.getAddress());
            response.put("ownerId", owner.getId());
            response.put("ownerName", owner.getFullName());
            response.put("ownerEmail", owner.getEmail());
            response.put("logoUrl", logoUrl);
            response.put("openingHours", kitchen.getOpeningHours());
            response.put("closingHours", kitchen.getClosingHours());
            response.put("open", kitchen.isOpen());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching kitchen details", "error", e.getMessage()));
        }
    }

    // ------------------ 🔐 HELPER METHODS ------------------
    private Authentication authenticate(String username, String password) {
        UserDetails userDetails = userServiceImpl.loadUserByUsername(username);
        if (userDetails == null || !passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }
        return new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
    }

    private String generateTokenForUser(User user) {
        UserDetails userDetails = userServiceImpl.loadUserByUsername(user.getEmail());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        return jwtProvider.generateJwtToken(authentication);
    }

    // ------------------ 📧 FORGOT PASSWORD ------------------
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            return new ResponseEntity<>(Map.of("message", "No account found with this email"), HttpStatus.NOT_FOUND);
        }

        otpService.sendOtp(email);
        return new ResponseEntity<>(Map.of("message", "OTP sent to your email"), HttpStatus.OK);
    }

    // ------------------ 🔄 RESET PASSWORD ------------------
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields required"));
        }

        if (!otpService.verifyOtp(email, otp)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP"));
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            return new ResponseEntity<>(Map.of("message", "No account found"), HttpStatus.NOT_FOUND);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return new ResponseEntity<>(Map.of("message", "Password reset successful"), HttpStatus.OK);
    }
}
