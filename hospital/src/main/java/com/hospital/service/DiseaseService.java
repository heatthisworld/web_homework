package com.hospital.service;

import com.hospital.entity.Disease;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

public interface DiseaseService {
    List<Disease> getAllDiseases();
    Optional<Disease> getDiseaseById(Long id);
    List<Disease> getDiseasesByDepartment(String department);
    List<Disease> searchDiseasesByName(String name);
    Disease createDisease(Disease disease);
    Disease updateDisease(Long id, Disease disease);
    void deleteDisease(Long id);
}
