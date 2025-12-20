package com.hospital.model;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PatientDetailsDto {
    private Long id;
    private String username;
    private String name;
    private String gender;
    private Integer age;
    private String phone;
    private String address;
    private List<MedicalRecordDto> medicalHistory;
    private List<VisitRecordDto> visitHistory;

    @Data
    public static class MedicalRecordDto {
        private Long id;
        private LocalDateTime visitDate;
        private String diagnosis;
        private String treatment;
        private List<String> medications;
        private String doctor;
        private String symptoms;
    }

    @Data
    public static class VisitRecordDto {
        private Long id;
        private LocalDateTime appointmentTime;
        private String department;
        private String doctor;
        private String disease;
        private String status;
        private String symptoms;
    }
}
