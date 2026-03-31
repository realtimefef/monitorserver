package com.monitorserver.controller;

import com.monitorserver.dto.request.ChangePasswordRequest;
import com.monitorserver.dto.request.ForgotPasswordRequest;
import com.monitorserver.dto.request.LoginRequest;
import com.monitorserver.dto.request.RegisterRequest;
import com.monitorserver.dto.request.ResetPasswordRequest;
import com.monitorserver.dto.response.ApiResponse;
import com.monitorserver.dto.response.AuthResponse;
import com.monitorserver.dto.response.UserResponse;
import com.monitorserver.entity.User;
import com.monitorserver.service.AuthService;
import com.monitorserver.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    // ─── Auth Endpoints ─────────────────────────────────────────────────

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request.getUsername(), request.getEmail(), request.getPassword());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Account created — please check your inbox to confirm your email.", null));
    }

    @GetMapping("/auth/verify")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(new ApiResponse<>(true, "Email confirmed successfully.", null));
    }

    @PostMapping("/auth/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@RequestBody Map<String, String> body) {
        authService.resendVerification(body.get("email"));
        return ResponseEntity.ok(new ApiResponse<>(true, "Verification email dispatched.", null));
    }

    @PostMapping("/auth/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(new ApiResponse<>(true,
                "If a matching account exists, a password recovery link has been sent.", null));
    }

    @PostMapping("/auth/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestParam String token,
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(token, request.getPassword());
        return ResponseEntity.ok(new ApiResponse<>(true, "Your password has been updated.", null));
    }

    @PostMapping("/auth/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User user) {
        authService.changePassword(user.getId(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(new ApiResponse<>(true, "Password updated successfully.", null));
    }

    @DeleteMapping("/auth/account")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal User user) {
        authService.deleteAccount(user.getId());
        return ResponseEntity.noContent().build();
    }

    // ─── User Endpoints ─────────────────────────────────────────────────

    @GetMapping("/users/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getProfile(user.getId()));
    }

    @PutMapping("/users/me")
    public ResponseEntity<UserResponse> updateMe(
            @RequestBody Map<String, String> updates,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.updateProfile(user.getId(), updates.get("username")));
    }

    // ─── Token Validation & Lookup ───────────────────────────────────────

    @GetMapping("/auth/validate")
    public ResponseEntity<ApiResponse<UserResponse>> validateToken(
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Invalid token", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Token valid",
                authService.getProfile(user.getId())));
    }

    @GetMapping("/auth/get-email")
    public ResponseEntity<Map<String, String>> getEmailByUsername(
            @RequestParam String username,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return userRepository.findByUsername(username)
                .map(u -> ResponseEntity.ok(Map.of("email", u.getEmail())))
                .orElse(ResponseEntity.notFound().build());
    }
}
