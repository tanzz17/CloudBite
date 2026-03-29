package com.cloudbite.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

public class JwtTokenValidator extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip token validation only for truly public endpoints.
        // Do NOT skip /api/auth/admin/** because admin routes require JWT auth.
        if (path.startsWith("/api/auth/signin") ||
                path.startsWith("/api/auth/signup") ||
                path.startsWith("/api/auth/forgot-password") ||
                path.startsWith("/api/auth/reset-password") ||
                path.startsWith("/api/foods/all") ||
                path.startsWith("/api/public/search/dishes") ||
                path.startsWith("/api/kitchens/all") ||
                path.startsWith("/uploads")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(JwtConstant.HEADER_STRING);

        if (authHeader == null || !authHeader.startsWith(JwtConstant.TOKEN_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(JwtConstant.TOKEN_PREFIX.length()).trim();

        if (jwt.isBlank() || jwt.equalsIgnoreCase("null")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());

            Claims claims = Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();

            String email = claims.get("email", String.class);
            String role = claims.get("role", String.class);

            if (email != null && role != null) {
                String springRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;

                List<GrantedAuthority> authorities =
                        Collections.singletonList(new SimpleGrantedAuthority(springRole));

                Authentication authentication =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

        } catch (Exception e) {
            throw new BadCredentialsException("Invalid or expired JWT token: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
