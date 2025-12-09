package com.hospital.controller;

import com.hospital.entity.Doctor;
import com.hospital.entity.Disease;
import com.hospital.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        Optional<Doctor> doctor = doctorService.getDoctorById(id);
        return doctor.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Doctor> getDoctorByUserId(@PathVariable Long userId) {
        Optional<Doctor> doctor = doctorService.getDoctorByUserId(userId);
        return doctor.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/department/{department}")
    public List<Doctor> getDoctorsByDepartment(@PathVariable String department) {
        return doctorService.getDoctorsByDepartment(department);
    }

    @GetMapping("/search")
    public List<Doctor> searchDoctorsByName(@RequestParam String name) {
        return doctorService.searchDoctorsByName(name);
    }

    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        Doctor createdDoctor = doctorService.createDoctor(doctor);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDoctor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctor) {
        try {
            Doctor updatedDoctor = doctorService.updateDoctor(id, doctor);
            return ResponseEntity.ok(updatedDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        try {
            doctorService.deleteDoctor(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/diseases")
    public ResponseEntity<Doctor> addDiseaseToDoctor(@PathVariable Long id, @RequestParam Long diseaseId) {
        try {
            Doctor updatedDoctor = doctorService.addDiseaseToDoctor(id, diseaseId);
            return ResponseEntity.ok(updatedDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{id}/diseases/{diseaseId}")
    public ResponseEntity<Doctor> removeDiseaseFromDoctor(@PathVariable Long id, @PathVariable Long diseaseId) {
        try {
            Doctor updatedDoctor = doctorService.removeDiseaseFromDoctor(id, diseaseId);
            return ResponseEntity.ok(updatedDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/diseases")
    public List<Disease> getDoctorDiseases(@PathVariable Long id) {
        return doctorService.getDoctorDiseases(id);
    }
}
