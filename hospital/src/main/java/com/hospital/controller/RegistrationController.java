package com.hospital.controller;

import com.hospital.entity.Registration;
import com.hospital.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @GetMapping
    public List<Registration> getAllRegistrations() {
        return registrationService.getAllRegistrations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Registration> getRegistrationById(@PathVariable Long id) {
        Optional<Registration> registration = registrationService.getRegistrationById(id);
        return registration.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public List<Registration> getRegistrationsByPatientId(@PathVariable Long patientId) {
        return registrationService.getRegistrationsByPatientId(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Registration> getRegistrationsByDoctorId(@PathVariable Long doctorId) {
        return registrationService.getRegistrationsByDoctorId(doctorId);
    }

    @GetMapping("/disease/{diseaseId}")
    public List<Registration> getRegistrationsByDiseaseId(@PathVariable Long diseaseId) {
        return registrationService.getRegistrationsByDiseaseId(diseaseId);
    }

    @GetMapping("/status/{status}")
    public List<Registration> getRegistrationsByStatus(@PathVariable Registration.Status status) {
        return registrationService.getRegistrationsByStatus(status);
    }

    @GetMapping("/patient/{patientId}/status/{status}")
    public List<Registration> getRegistrationsByPatientAndStatus(@PathVariable Long patientId, @PathVariable Registration.Status status) {
        return registrationService.getRegistrationsByPatientAndStatus(patientId, status);
    }

    @GetMapping("/time")
    public List<Registration> getRegistrationsByAppointmentTimeBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return registrationService.getRegistrationsByAppointmentTimeBetween(start, end);
    }

    @PostMapping
    public ResponseEntity<Registration> createRegistration(@RequestBody Registration registration) {
        try {
            Registration createdRegistration = registrationService.createRegistration(registration);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRegistration);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Registration> updateRegistration(@PathVariable Long id, @RequestBody Registration registration) {
        try {
            Registration updatedRegistration = registrationService.updateRegistration(id, registration);
            return ResponseEntity.ok(updatedRegistration);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<Registration> updateRegistrationStatus(@PathVariable Long id, @PathVariable Registration.Status status) {
        try {
            Registration updatedRegistration = registrationService.updateRegistrationStatus(id, status);
            return ResponseEntity.ok(updatedRegistration);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegistration(@PathVariable Long id) {
        try {
            registrationService.deleteRegistration(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
