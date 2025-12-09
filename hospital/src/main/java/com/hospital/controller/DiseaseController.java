package com.hospital.controller;

import com.hospital.entity.Disease;
import com.hospital.service.DiseaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/diseases")
public class DiseaseController {

    @Autowired
    private DiseaseService diseaseService;

    @GetMapping
    public List<Disease> getAllDiseases() {
        return diseaseService.getAllDiseases();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Disease> getDiseaseById(@PathVariable Long id) {
        Optional<Disease> disease = diseaseService.getDiseaseById(id);
        return disease.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/department/{department}")
    public List<Disease> getDiseasesByDepartment(@PathVariable String department) {
        return diseaseService.getDiseasesByDepartment(department);
    }

    @GetMapping("/search")
    public List<Disease> searchDiseasesByName(@RequestParam String name) {
        return diseaseService.searchDiseasesByName(name);
    }

    @PostMapping
    public ResponseEntity<Disease> createDisease(@RequestBody Disease disease) {
        Disease createdDisease = diseaseService.createDisease(disease);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDisease);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Disease> updateDisease(@PathVariable Long id, @RequestBody Disease disease) {
        try {
            Disease updatedDisease = diseaseService.updateDisease(id, disease);
            return ResponseEntity.ok(updatedDisease);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDisease(@PathVariable Long id) {
        try {
            diseaseService.deleteDisease(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
