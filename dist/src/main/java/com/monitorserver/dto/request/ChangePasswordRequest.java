package com.monitorserver.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Enter your existing password to continue")
    private String currentPassword;

    @NotBlank(message = "Please choose a new password")
    @Size(min = 8, max = 128, message = "New password must be 8–128 characters long")
    private String newPassword;
}
