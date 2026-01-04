package com.hospital.model;

import lombok.Data;

@Data
public class SendResetCodeRequest {
    private String username;
    private String email;
}
