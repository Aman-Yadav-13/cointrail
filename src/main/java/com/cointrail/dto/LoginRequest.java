package com.cointrail.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    private String email;

    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String email, String password) {
        this.email = email;
        this.usernameOrEmail = email;
        this.password = password;
    }

    public String getEmail() {
        return email != null && !email.trim().isEmpty() ? email : usernameOrEmail;
    }

    public void setEmail(String email) {
        this.email = email;
        if (this.usernameOrEmail == null) {
            this.usernameOrEmail = email;
        }
    }

    public String getUsernameOrEmail() {
        return usernameOrEmail != null && !usernameOrEmail.trim().isEmpty() ? usernameOrEmail : email;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
        if (this.email == null) {
            this.email = usernameOrEmail;
        }
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
