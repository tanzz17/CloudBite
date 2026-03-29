package com.cloudbite.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Collection;
import java.util.Date;

@Service
public class JwtProvider {

    private static final long EXPIRATION_TIME = 86400000; // 24 hours
    private final SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());

    // ✅ Generate JWT with email + single role
    public String generateJwtToken(Authentication auth) {
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();

        String role = authorities.isEmpty() ? "ROLE_CUSTOMER" : authorities.iterator().next().getAuthority();

        return Jwts.builder()
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .claim("email", auth.getName())
                .claim("role", role)
                .signWith(key)
                .compact();
    }

    // ✅ Extract email from token
    public String getEmailFromJwtToken(String jwt) {
        jwt = jwt.substring(7); // Remove "Bearer "

        Claims claims = Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(jwt)
                .getBody();

        return claims.get("email", String.class);
    }

    // ✅ Extract role (optional)
    public String getRoleFromJwtToken(String jwt) {
        jwt = jwt.substring(7);
        Claims claims = Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(jwt)
                .getBody();

        return claims.get("role", String.class);
    }

    // ✅ New method: extract token from HttpServletRequest
    public String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken;
        }
        return null;
    }

    // ✅ New method: alias used in some controllers
    public String getEmailFromToken(String token) {
        return getEmailFromJwtToken(token);
    }
}
