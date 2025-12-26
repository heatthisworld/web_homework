package com.hospital.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    private String originalName;
    private String storedName;
    private String contentType;
    private long size;
    private String relativePath;
}
