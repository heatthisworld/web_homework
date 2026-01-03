package com.hospital.repository;

import com.hospital.entity.MedicalRecord;
import com.hospital.entity.Patient;
import com.hospital.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatient(Patient patient);
    List<MedicalRecord> findByDoctorId(Long doctorId);
    List<MedicalRecord> findByPatientAndVisitDateBetween(Patient patient, LocalDateTime startDate, LocalDateTime endDate);
    List<MedicalRecord> findByVisitDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<MedicalRecord> findByRegistrationId(Long registrationId);
}