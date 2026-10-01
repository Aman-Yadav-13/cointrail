package com.cointrail.security;

import com.cointrail.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUser();
        }
        return null;
    }

    public Long getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }
}
