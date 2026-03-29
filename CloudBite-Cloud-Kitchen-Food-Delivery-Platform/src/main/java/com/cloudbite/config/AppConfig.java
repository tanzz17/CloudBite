package com.cloudbite.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@EnableWebSecurity
@Configuration
public class AppConfig {

    @Value("${app.cors.allowed-origins:https://cloudbite-frontend.vercel.app,https://*.vercel.app}")
    private String allowedOrigins;

    private static final List<String> DEFAULT_ALLOWED_ORIGINS = List.of(
            "https://cloudbite-frontend.vercel.app",
            "https://*.vercel.app"
    );

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .sessionManagement(management ->
                        management.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(authorize -> authorize
                        // Always allow CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public auth routes only
                        .requestMatchers(
                                "/api/auth/signin",
                                "/api/auth/signup",
                                "/api/auth/signup/customer",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password"
                        ).permitAll()

                        // Public catalog routes
                        .requestMatchers(
                                "/api/public/**",
                                "/api/foods/all",
                                "/api/kitchens/all",
                                "/api/kitchens/*",
                                "/api/kitchen/*",
                                "/uploads/**",
                                "/api/location/**"
                        ).permitAll()

                        // Role-based protected routes
                        .requestMatchers("/api/admin/**", "/api/auth/admin/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/kitchen-owner/**").hasAuthority("ROLE_KITCHEN_OWNER")
                        .requestMatchers("/api/delivery/**").hasAuthority("ROLE_DELIVERY_PARTNER")
                        .requestMatchers("/api/customer/**").hasAuthority("ROLE_CUSTOMER")

                        // Everything else under /api requires login
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(new JwtTokenValidator(), BasicAuthenticationFilter.class)
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", buildCorsConfiguration());
        return source;
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", buildCorsConfiguration());
        return new CorsFilter(source);
    }

    private CorsConfiguration buildCorsConfiguration() {
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toCollection(ArrayList::new));

        if (origins.isEmpty()) {
            origins.addAll(DEFAULT_ALLOWED_ORIGINS);
        }

        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(origins);
        cfg.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cfg.setAllowedHeaders(Collections.singletonList("*"));
        cfg.setAllowCredentials(true);
        cfg.setExposedHeaders(Arrays.asList("Authorization", "Cache-Control"));
        cfg.setMaxAge(3600L);
        return cfg;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

