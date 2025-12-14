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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
    public Result<AuthResponse> createAuthenticationToken(@RequestBody AuthRequest authenticationRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return Result.error(401, "用户名或密码错误");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getUsername());
        final String token = jwtTokenUtil.generateToken(userDetails);

        // 获取用户角色
        String role = userRepository.findByUsername(authenticationRequest.getUsername())
                .map(user -> user.getRole().name())
                .orElse("ROLE_USER");

        return Result.success(new AuthResponse(token, authenticationRequest.getUsername(), role));
    }

    @PostMapping("/register")
    public Result<String> registerPatient(@RequestBody RegisterRequest registerRequest) {
        // 1. 检查用户名是否已存在
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            return Result.error(400, "用户名已存在");
        }

        // 2. 创建用户对象
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        // 使用BCrypt加密密码
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        // 设置角色为病人
        user.setRole(User.Role.PATIENT);
        // 保存用户
        User savedUser = userService.createUser(user);

        // 3. 创建病人对象
        Patient patient = new Patient();
        patient.setUser(savedUser);
        patient.setName(registerRequest.getName());
        // 转换性别枚举
        patient.setGender(Patient.Gender.valueOf(registerRequest.getGender().toUpperCase()));
        patient.setAge(registerRequest.getAge());
        patient.setIdCard(registerRequest.getIdCard());
        patient.setPhone(registerRequest.getPhone());
        patient.setAddress(registerRequest.getAddress());
        // 保存病人
        patientService.createPatient(patient);

        return Result.success("注册成功");
    }
}
