package com.monitorserver.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "A username is needed for your profile")
    @Size(min = 3, max = 20, message = "Username length should be 3–20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_.-]+$", message = "Username may only contain letters, digits, underscores, dots, and hyphens")
    private String username;

    @NotBlank(message = "Please provide your email address")
    @Email(message = "Enter a properly formatted email")
    private String email;

    @NotBlank(message = "Choose a password for your account")
    @Size(min = 8, max = 128, message = "Password must be 8–128 characters long")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).+$",
             message = "Password must include uppercase, lowercase, a digit, and a special character")
    private String password;
}
