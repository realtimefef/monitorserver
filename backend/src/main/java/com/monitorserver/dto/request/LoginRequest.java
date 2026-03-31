package com.monitorserver.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Please provide your email address")
    @Email(message = "Enter a properly formatted email")
    private String email;

    @NotBlank(message = "Password field cannot be empty")
    private String password;
}
