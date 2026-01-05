package com.hospital.model;

import lombok.Data;

@Data
public class DoctorPatientSummary {
    private Long id;
    private String name;
    private String gender;
    private String phone;
    private String address;
}
