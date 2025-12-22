package com.hospital.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RecentRegistrationDto {
    private Long id;
    private String patientName;
    private String doctorName;
    private String department;
    private String disease;
    private String status;
    private LocalDateTime appointmentTime;
}
