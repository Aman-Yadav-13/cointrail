package com.cointrail.service;

import com.cointrail.dto.AuthResponse;
import com.cointrail.dto.LoginRequest;
import com.cointrail.dto.RegisterRequest;
import com.cointrail.dto.UserDto;
import com.cointrail.model.User;
import com.cointrail.repository.UserRepository;
import com.cointrail.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String phoneNumber = request.getPhoneNumber() != null
                ? request.getPhoneNumber().trim().replaceAll("[\\s-]", "")
                : null;
        String fullName = request.getFullName().trim();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email '" + email + "' is already registered");
        }

        if (phoneNumber != null && !phoneNumber.isEmpty() && userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("Phone number '" + phoneNumber + "' is already registered");
        }

        String username = (request.getUsername() != null && !request.getUsername().trim().isEmpty())
                ? request.getUsername().trim().toLowerCase()
                : email;

        if (!username.equals(email) && userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username '" + username + "' is already taken");
        }

        User user = new User(
                username,
                email,
                phoneNumber,
                passwordEncoder.encode(request.getPassword()),
                fullName
        );

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getId());

        return new AuthResponse(token, UserDto.fromEntity(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (email.isEmpty() && request.getUsernameOrEmail() != null) {
            email = request.getUsernameOrEmail().trim().toLowerCase();
        }

        if (email.isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        String finalEmail = email;
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.findByUsernameOrEmailOrPhoneNumber(finalEmail, finalEmail, finalEmail)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid email or password")));

        String token = tokenProvider.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(token, UserDto.fromEntity(user));
    }
}
