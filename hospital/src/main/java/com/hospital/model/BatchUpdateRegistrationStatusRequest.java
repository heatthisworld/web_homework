package com.hospital.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BatchUpdateRegistrationStatusRequest {
    private List<Long> ids;
    private String status;
}
