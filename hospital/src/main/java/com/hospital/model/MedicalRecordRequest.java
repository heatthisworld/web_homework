package com.hospital.model;

import lombok.Data;

@Data
public class MedicalRecordRequest {
    private String symptoms;
    private String diagnosis;
    private String medication;
    private String examinations;
    private String treatment;
    private String notes;
}
