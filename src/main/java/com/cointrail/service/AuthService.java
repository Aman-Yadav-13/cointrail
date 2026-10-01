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
        String username = request.getUsername().trim().toLowerCase();
        String email = request.getEmail().trim().toLowerCase();
        String phoneNumber = request.getPhoneNumber() != null
                ? request.getPhoneNumber().trim().replaceAll("[\\s-]", "")
                : null;

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username '" + username + "' is already taken");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email '" + email + "' is already registered");
        }

        if (phoneNumber != null && !phoneNumber.isEmpty() && userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("Phone number '" + phoneNumber + "' is already registered");
        }

        User user = new User(
                username,
                email,
                phoneNumber,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim()
        );

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser.getUsername(), savedUser.getId());

        return new AuthResponse(token, UserDto.fromEntity(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail().trim();
        String normalizedPhone = identifier.replaceAll("[\\s-]", "");

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
        );

        User user = userRepository.findByUsernameOrEmailOrPhoneNumber(identifier.toLowerCase(), identifier.toLowerCase(), normalizedPhone)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username, email, phone or password"));

        String token = tokenProvider.generateToken(user.getUsername(), user.getId());

        return new AuthResponse(token, UserDto.fromEntity(user));
    }
}
