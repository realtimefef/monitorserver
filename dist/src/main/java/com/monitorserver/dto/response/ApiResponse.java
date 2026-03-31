package com.monitorserver.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "OK", data);
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(true, "OK", null);
    }

    public static <T> ApiResponse<T> error(String msg) {
        return new ApiResponse<>(false, msg, null);
    }
}
