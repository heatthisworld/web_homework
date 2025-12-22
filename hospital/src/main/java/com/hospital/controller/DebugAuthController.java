package com.hospital.controller;

import com.hospital.model.AuthRequest;
import com.hospital.model.AuthResponse;
import com.hospital.model.Result;
import com.hospital.util.JwtTokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/debug")
public class DebugAuthController {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    /**
     * Debug 登录，无需密码/数据库校验，根据用户名映射角色：
     * 1P -> ADMIN, 2P -> PATIENT, 3P -> DOCTOR
     */
    @PostMapping("/login")
    public Result<AuthResponse> debugLogin(@RequestBody AuthRequest authRequest,
                                           HttpServletRequest request,
                                           HttpServletResponse response) {
        String username = authRequest.getUsername();
        String role = switch (username) {
            case "1P" -> "ADMIN";
            case "2P" -> "PATIENT";
            case "3P" -> "DOCTOR";
            default -> null;
        };

        if (role == null) {
            return Result.error(400, "未知的调试账号（请使用 1P/2P/3P）");
        }

        String token = jwtTokenUtil.generateTokenForUsername(username);

        ResponseCookie cookie = ResponseCookie.from(JwtTokenUtil.AUTH_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .sameSite("Lax")
                .maxAge(Duration.ofDays(7))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return Result.success(new AuthResponse(token, username, role));
    }
}
