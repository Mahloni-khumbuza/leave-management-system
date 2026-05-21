package com.equisoft.leavemanagement.controller;

import com.equisoft.leavemanagement.dto.AuthDtos.AuthResponse;
import com.equisoft.leavemanagement.dto.AuthDtos.LoginRequest;
import com.equisoft.leavemanagement.dto.AuthDtos.RegisterRequest;
import com.equisoft.leavemanagement.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }
}
