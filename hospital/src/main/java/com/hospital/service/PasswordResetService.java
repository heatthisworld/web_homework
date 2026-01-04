package com.hospital.service;

public interface PasswordResetService {
    void sendResetCode(String username, String email);

    void resetPassword(String username, String email, String code, String newPassword);
}
