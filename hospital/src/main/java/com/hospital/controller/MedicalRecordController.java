package com.hospital.controller;

import com.hospital.entity.MedicalRecord;
import com.hospital.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @GetMapping
    public List<MedicalRecord> getAllMedicalRecords() {
        return medicalRecordService.getAllMedicalRecords();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecord> getMedicalRecordById(@PathVariable Long id) {
        Optional<MedicalRecord> medicalRecord = medicalRecordService.getMedicalRecordById(id);
        return medicalRecord.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public List<MedicalRecord> getMedicalRecordsByPatientId(@PathVariable Long patientId) {
        return medicalRecordService.getMedicalRecordsByPatientId(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<MedicalRecord> getMedicalRecordsByDoctorId(@PathVariable Long doctorId) {
        return medicalRecordService.getMedicalRecordsByDoctorId(doctorId);
    }

    @GetMapping("/patient/{patientId}/date-range")
    public List<MedicalRecord> getMedicalRecordsByPatientAndDateRange(
            @PathVariable Long patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return medicalRecordService.getMedicalRecordsByPatientAndDateRange(patientId, startDate, endDate);
    }

    @GetMapping("/date-range")
    public List<MedicalRecord> getMedicalRecordsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return medicalRecordService.getMedicalRecordsByDateRange(startDate, endDate);
    }

    @PostMapping
    public ResponseEntity<MedicalRecord> createMedicalRecord(@RequestBody MedicalRecord medicalRecord) {
        try {
            MedicalRecord createdRecord = medicalRecordService.createMedicalRecord(medicalRecord);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRecord);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecord> updateMedicalRecord(@PathVariable Long id, @RequestBody MedicalRecord medicalRecord) {
        try {
            MedicalRecord updatedRecord = medicalRecordService.updateMedicalRecord(id, medicalRecord);
            return ResponseEntity.ok(updatedRecord);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicalRecord(@PathVariable Long id) {
        try {
            medicalRecordService.deleteMedicalRecord(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}