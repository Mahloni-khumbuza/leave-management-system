package com.equisoft.leavemanagement.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "service", "Masesi Leave Management API",
                "status", "running",
                "health", "/actuator/health",
                "api", "/api/auth, /api/leaves, /api/files"
        );
    }
}
