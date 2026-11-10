package com.repairflow.controller;

import com.repairflow.dto.LoginRequest;
import com.repairflow.dto.RegisterRequest;
import com.repairflow.entity.User;
import com.repairflow.repository.UserRepository;
import com.repairflow.service.JwtService;
import com.repairflow.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = userService.register(
                request.name().trim(),
                request.email().trim().toLowerCase(),
                request.password()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", user.id,
                "name", user.name,
                "email", user.email,
                "role", user.role
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(
                request.email().trim().toLowerCase()
        ).orElseThrow(() ->
                new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.password)) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtService.generateToken(
                user.email, user.role.name());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "id", user.id,
                "name", user.name,
                "email", user.email,
                "role", user.role
        ));
    }
}
