package com.hospital.controller;

import com.hospital.entity.MedicalRecord;
import com.hospital.model.Result;
import com.hospital.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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
    public Result<List<MedicalRecord>> getAllMedicalRecords() {
        return Result.success(medicalRecordService.getAllMedicalRecords());
    }

    @GetMapping("/{id}")
    public Result<MedicalRecord> getMedicalRecordById(@PathVariable Long id) {
        Optional<MedicalRecord> medicalRecord = medicalRecordService.getMedicalRecordById(id);
        return medicalRecord.map(Result::success)
                .orElseGet(() -> Result.error(404, "病历不存在"));
    }

    @GetMapping("/patient/{patientId}")
    public Result<List<MedicalRecord>> getMedicalRecordsByPatientId(@PathVariable Long patientId) {
        return Result.success(medicalRecordService.getMedicalRecordsByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public Result<List<MedicalRecord>> getMedicalRecordsByDoctorId(@PathVariable Long doctorId) {
        return Result.success(medicalRecordService.getMedicalRecordsByDoctorId(doctorId));
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
    public Result<MedicalRecord> createMedicalRecord(@RequestBody MedicalRecord medicalRecord) {
        MedicalRecord createdRecord = medicalRecordService.createMedicalRecord(medicalRecord);
        return Result.success(createdRecord);
    }

    @PutMapping("/{id}")
    public Result<MedicalRecord> updateMedicalRecord(@PathVariable Long id, @RequestBody MedicalRecord medicalRecord) {
        MedicalRecord updatedRecord = medicalRecordService.updateMedicalRecord(id, medicalRecord);
        return Result.success(updatedRecord);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteMedicalRecord(@PathVariable Long id) {
        medicalRecordService.deleteMedicalRecord(id);
        return Result.success();
    }
}