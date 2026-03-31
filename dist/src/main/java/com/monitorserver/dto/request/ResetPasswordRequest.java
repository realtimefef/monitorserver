package com.monitorserver.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank(message = "Please choose a new password")
    @Size(min = 8, max = 128, message = "Password must be 8–128 characters long")
    private String password;
}
