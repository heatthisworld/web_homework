package com.hospital.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DoctorRegistrationUpdateRequest {
    private String status;
    private String appointmentTime;
    private Long diseaseId;
    private String notes;
}
