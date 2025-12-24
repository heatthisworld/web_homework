package com.hospital.service.impl;

import com.hospital.entity.Disease;
import com.hospital.repository.DiseaseRepository;
import com.hospital.service.DiseaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DiseaseServiceImpl implements DiseaseService {

    @Autowired
    private DiseaseRepository diseaseRepository;

    @Override
    public List<Disease> getAllDiseases() {
        return diseaseRepository.findAll();
    }

    @Override
    public Optional<Disease> getDiseaseById(Long id) {
        return diseaseRepository.findById(id);
    }

    @Override
    public List<Disease> getDiseasesByDepartment(String department) {
        return diseaseRepository.findByDepartment_Name(department);
    }

    @Override
    public List<Disease> searchDiseasesByName(String name) {
        return diseaseRepository.findByNameContaining(name);
    }

    @Override
    public Disease createDisease(Disease disease) {
        return diseaseRepository.save(disease);
    }

    @Override
    public Disease updateDisease(Long id, Disease disease) {
        Optional<Disease> existingDisease = diseaseRepository.findById(id);
        if (existingDisease.isPresent()) {
            Disease updatedDisease = existingDisease.get();
            updatedDisease.setName(disease.getName());
            updatedDisease.setDescription(disease.getDescription());
            updatedDisease.setDepartment(disease.getDepartment());
            return diseaseRepository.save(updatedDisease);
        } else {
            throw new RuntimeException("Disease not found with id: " + id);
        }
    }

    @Override
    public void deleteDisease(Long id) {
        diseaseRepository.deleteById(id);
    }
}
