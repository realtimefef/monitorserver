package com.monitorserver.service;

import com.monitorserver.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration:86400000}")
    private long expiration;

    /**
     * Generate a JWT token for a UserDetails principal.
     * If the principal is a {@link User} entity, the userId claim is also embedded.
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        if (userDetails instanceof User user) {
            extraClaims.put("userId", user.getId());
            extraClaims.put("email", user.getEmail());
            extraClaims.put("role", user.getRole().name());
        }
        return buildToken(extraClaims, userDetails.getUsername());
    }

    /**
     * Convenience overload that accepts a {@link User} entity directly.
     */
    public String generateToken(User user) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("email", user.getEmail());
        extraClaims.put("role", user.getRole().name());
        return buildToken(extraClaims, user.getUsername());
    }

    private String buildToken(Map<String, Object> extraClaims, String subject) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
            .claims(extraClaims)
            .subject(subject)
            .issuedAt(new Date(now))
            .expiration(new Date(now + expiration))
            .signWith(getSignKey())
            .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        Object userIdClaim = extractAllClaims(token).get("userId");
        if (userIdClaim instanceof Integer) {
            return ((Integer) userIdClaim).longValue();
        }
        if (userIdClaim instanceof Long) {
            return (Long) userIdClaim;
        }
        return null;
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSignKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey getSignKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
