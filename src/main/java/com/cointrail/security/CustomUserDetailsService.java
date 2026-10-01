package com.cointrail.security;

import com.cointrail.model.User;
import com.cointrail.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        String trimmed = identifier.trim();
        String normalizedPhone = trimmed.replaceAll("[\\s-]", "");
        User user = userRepository.findByUsernameOrEmailOrPhoneNumber(trimmed.toLowerCase(), trimmed.toLowerCase(), normalizedPhone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));
        return new UserPrincipal(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        return new UserPrincipal(user);
    }
}
