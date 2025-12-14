package com.hospital.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    @Value("${jwt.expiration}")
    private long expiration;

    // 使用Keys类生成符合HS512算法要求的安全密钥
    private final SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);

    // ================== Token 中获取 Claims ==================

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> resolver) {
        Claims claims = getAllClaimsFromToken(token);
        return resolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()                   // ✔ 新 API
                .verifyWith(secretKey)         // ✔ 替代 setSigningKey()
                .build()
                .parseSignedClaims(token)      // ✔ 替代 parseClaimsJws()
                .getPayload();                 // ✔ 替代 getBody()
    }

    // ================== Token 生成 ==================

    public String generateToken(UserDetails userDetails) {
        return doGenerateToken(new HashMap<>(), userDetails.getUsername());
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration * 1000))
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    // ================== 校验 ==================

    private boolean isTokenExpired(String token) {
        return getExpirationDateFromToken(token).before(new Date());
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        return userDetails.getUsername().equals(getUsernameFromToken(token))
                && !isTokenExpired(token);
    }
}
