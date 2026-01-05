package com.hospital.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DoctorRegistrationDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private String department;
    private String disease;
    private LocalDateTime appointmentTime;
    private String status;
}
