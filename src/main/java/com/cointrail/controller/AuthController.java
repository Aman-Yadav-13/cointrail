package com.cointrail.controller;

import com.cointrail.dto.AuthResponse;
import com.cointrail.dto.LoginRequest;
import com.cointrail.dto.RegisterRequest;
import com.cointrail.dto.UserDto;
import com.cointrail.model.User;
import com.cointrail.security.SecurityUtils;
import com.cointrail.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SecurityUtils securityUtils;

    public AuthController(AuthService authService, SecurityUtils securityUtils) {
        this.authService = authService;
        this.securityUtils = securityUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username/email or password"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        User user = securityUtils.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        return ResponseEntity.ok(UserDto.fromEntity(user));
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(org.springframework.context.support.DefaultMessageSourceResolvable::getDefaultMessage)
                .orElse("Validation failed");
        return ResponseEntity.badRequest().body(Map.of("message", errorMessage));
    }
}
