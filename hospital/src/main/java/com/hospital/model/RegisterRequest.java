package com.hospital.model;

import lombok.Data;

@Data
public class RegisterRequest {
    // 用户基本信息
    private String username;
    private String password;
    
    // 病人信息
    private String name;
    private String gender;
    private Integer age;
    private String idCard;
    private String phone;
    private String address;
}