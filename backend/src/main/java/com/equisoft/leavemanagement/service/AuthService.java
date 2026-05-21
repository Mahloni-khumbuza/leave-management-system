package com.equisoft.leavemanagement.service;

import com.equisoft.leavemanagement.dto.AuthDtos.AuthResponse;
import com.equisoft.leavemanagement.dto.AuthDtos.LoginRequest;
import com.equisoft.leavemanagement.dto.AuthDtos.RegisterRequest;
import com.equisoft.leavemanagement.model.Role;
import com.equisoft.leavemanagement.model.User;
import com.equisoft.leavemanagement.repository.UserRepository;
import com.equisoft.leavemanagement.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.NoSuchElementException;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest req) {
        try {
            if (userRepository.existsByEmail(req.email())) {
                throw new IllegalStateException("Email already registered");
            }
            User user = User.builder()
                    .email(req.email())
                    .password(passwordEncoder.encode(req.password()))
                    .fullName(req.fullName())
                    .role(req.role() == null ? Role.EMPLOYEE : req.role())
                    .build();
            user = userRepository.save(user);
            return new AuthResponse(jwtUtil.generateToken(user), user.getEmail(), user.getFullName(), user.getRole());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error registering {}", req.email(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Registration failed", e);
        }
    }

    public AuthResponse login(LoginRequest req) {
        try {
            User user = userRepository.findByEmail(req.email())
                    .orElseThrow(() -> new NoSuchElementException("Invalid credentials"));
            if (!passwordEncoder.matches(req.password(), user.getPassword())) {
                throw new SecurityException("Invalid credentials");
            }
            return new AuthResponse(jwtUtil.generateToken(user), user.getEmail(), user.getFullName(), user.getRole());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (NoSuchElementException | SecurityException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials", e);
        } catch (Exception e) {
            log.error("Unexpected error during login for {}", req.email(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Login failed", e);
        }
    }
}
