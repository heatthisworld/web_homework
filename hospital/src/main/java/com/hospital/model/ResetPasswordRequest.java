package com.hospital.model;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String username;
    private String email;
    private String code;
    private String newPassword;
}
