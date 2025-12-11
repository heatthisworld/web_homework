package com.hospital.service;

import com.hospital.entity.MedicalRecord;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MedicalRecordService {
    List<MedicalRecord> getAllMedicalRecords();
    Optional<MedicalRecord> getMedicalRecordById(Long id);
    List<MedicalRecord> getMedicalRecordsByPatientId(Long patientId);
    List<MedicalRecord> getMedicalRecordsByDoctorId(Long doctorId);
    List<MedicalRecord> getMedicalRecordsByPatientAndDateRange(Long patientId, LocalDateTime startDate, LocalDateTime endDate);
    List<MedicalRecord> getMedicalRecordsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    MedicalRecord createMedicalRecord(MedicalRecord medicalRecord);
    MedicalRecord updateMedicalRecord(Long id, MedicalRecord medicalRecord);
    void deleteMedicalRecord(Long id);
}