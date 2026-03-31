package com.monitorserver.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    @NotBlank(message = "Please provide the email linked to your account")
    @Email(message = "Enter a properly formatted email")
    private String email;
}
