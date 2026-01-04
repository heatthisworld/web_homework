package com.hospital.controller;

import com.hospital.entity.Patient;
import com.hospital.entity.User;
import com.hospital.model.AuthRequest;
import com.hospital.model.AuthResponse;
import com.hospital.model.RegisterRequest;
import com.hospital.model.Result;
import com.hospital.repository.UserRepository;
import com.hospital.service.PatientService;
import com.hospital.service.UserService;
import com.hospital.util.JwtTokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public Result<AuthResponse> createAuthenticationToken(@RequestBody AuthRequest authenticationRequest,
                                                          HttpServletRequest request,
                                                          HttpServletResponse response) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return Result.error(4001, "用户名或密码错误");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getUsername());
        final String token = jwtTokenUtil.generateToken(userDetails);

        // 获取用户角色
        String role = userRepository.findByUsername(authenticationRequest.getUsername())
                .map(user -> user.getRole().name())
                .orElse("ROLE_USER");

        ResponseCookie cookie = ResponseCookie.from(JwtTokenUtil.AUTH_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .sameSite("Lax")
                .maxAge(Duration.ofDays(7))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return Result.success(new AuthResponse(token, authenticationRequest.getUsername(), role));
    }

    @PostMapping("/register")
    @Transactional
    public Result<String> registerPatient(@RequestBody RegisterRequest registerRequest) {
        // 1. 检查用户名是否已存在
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            return Result.error(4002, "用户名已存在");
        }

        // 1.1 检查身份证是否已存在，避免数据库唯一约束报错
        if (patientService.getPatientByIdCard(registerRequest.getIdCard()).isPresent()) {
            return Result.error(4003, "已存在该身份证号码");
        }

        // 2. 创建用户对象（密码交由 UserService 统一加密，避免重复加密）
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(registerRequest.getPassword());
        // 设置角色为患者
        user.setRole(User.Role.PATIENT);
        // 保存用户（内部会加密）
        User savedUser = userService.createUser(user);
        // 调试打印：明文、密文及 Python 校验命令
        String encodedPassword = savedUser.getPassword();
        String verifyCmd = String.format(
                "python util/verify_password.py --password %s --hash \"%s\"",
                registerRequest.getPassword(),
                encodedPassword
        );
        System.out.println("Password generated -> username=" + user.getUsername()
                + " plain=" + registerRequest.getPassword()
                + " hash=" + encodedPassword
                + " | verify: " + verifyCmd);

        // 3. 创建患者对象
        Patient patient = new Patient();
        patient.setUser(savedUser);
        patient.setName(registerRequest.getName());
        // 转换性别枚举
        patient.setGender(Patient.Gender.valueOf(registerRequest.getGender().toUpperCase()));
        patient.setAge(registerRequest.getAge());
        patient.setIdCard(registerRequest.getIdCard());
        patient.setPhone(registerRequest.getPhone());
        patient.setAddress(registerRequest.getAddress());
        try {
            // 保存患者
            patientService.createPatient(patient);
        } catch (DataIntegrityViolationException e) {
            // 捕获唯一约束异常并返回可读提示，同时触发事务回滚
            String message = e.getMessage() != null && e.getMessage().contains("id_card")
                    ? "已存在该身份证号码"
                    : "患者信息重复，请检查后再试";
            return Result.error(4003, message);
        }

        return Result.success("注册成功");
    }

    @GetMapping("/me")
    public Result<AuthResponse> currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Result.error(401, "未登录或登录已失效");
        }

        String username = authentication.getName();
        Optional<User.Role> roleOptional = userRepository.findByUsername(username).map(User::getRole);
        String role = roleOptional.map(Enum::name).orElse("ROLE_USER");

        return Result.success(new AuthResponse(null, username, role));
    }

    @PostMapping("/logout")
    public Result<String> logout(HttpServletRequest request, HttpServletResponse response) {
        ResponseCookie deleteCookie = ResponseCookie.from(JwtTokenUtil.AUTH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .sameSite("Lax")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        return Result.success("退出成功");
    }
}
