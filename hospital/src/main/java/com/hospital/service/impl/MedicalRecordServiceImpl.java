package com.hospital.service.impl;

import com.hospital.entity.MedicalRecord;
import com.hospital.entity.Patient;
import com.hospital.entity.Doctor;
import com.hospital.entity.Registration;
import com.hospital.repository.MedicalRecordRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.RegistrationRepository;
import com.hospital.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordServiceImpl implements MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Override
    public List<MedicalRecord> getAllMedicalRecords() {
        return medicalRecordRepository.findAll();
    }

    @Override
    public Optional<MedicalRecord> getMedicalRecordById(Long id) {
        return medicalRecordRepository.findById(id);
    }

    @Override
    public List<MedicalRecord> getMedicalRecordsByPatientId(Long patientId) {
        Optional<Patient> patient = patientRepository.findById(patientId);
        if (patient.isPresent()) {
            return medicalRecordRepository.findByPatient(patient.get());
        }
        return List.of();
    }

    @Override
    public List<MedicalRecord> getMedicalRecordsByDoctorId(Long doctorId) {
        return medicalRecordRepository.findByDoctorId(doctorId);
    }

    @Override
    public List<MedicalRecord> getMedicalRecordsByPatientAndDateRange(Long patientId, LocalDateTime startDate, LocalDateTime endDate) {
        Optional<Patient> patient = patientRepository.findById(patientId);
        if (patient.isPresent()) {
            return medicalRecordRepository.findByPatientAndVisitDateBetween(patient.get(), startDate, endDate);
        }
        return List.of();
    }

    @Override
    public List<MedicalRecord> getMedicalRecordsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return medicalRecordRepository.findByVisitDateBetween(startDate, endDate);
    }

    @Override
    public MedicalRecord createMedicalRecord(MedicalRecord medicalRecord) {
        // 验证患者是否存在
        Optional<Patient> patient = patientRepository.findById(medicalRecord.getPatient().getId());
        if (!patient.isPresent()) {
            throw new RuntimeException("Patient not found with id: " + medicalRecord.getPatient().getId());
        }

        // 验证医生是否存在
        Optional<Doctor> doctor = doctorRepository.findById(medicalRecord.getDoctor().getId());
        if (!doctor.isPresent()) {
            throw new RuntimeException("Doctor not found with id: " + medicalRecord.getDoctor().getId());
        }

        // 验证挂号记录是否存在
        Optional<Registration> registration = registrationRepository.findById(medicalRecord.getRegistration().getId());
        if (!registration.isPresent()) {
            throw new RuntimeException("Registration not found with id: " + medicalRecord.getRegistration().getId());
        }

        return medicalRecordRepository.save(medicalRecord);
    }

    @Override
    public MedicalRecord updateMedicalRecord(Long id, MedicalRecord medicalRecord) {
        Optional<MedicalRecord> existingRecord = medicalRecordRepository.findById(id);
        if (existingRecord.isPresent()) {
            MedicalRecord updatedRecord = existingRecord.get();
            updatedRecord.setSymptoms(medicalRecord.getSymptoms());
            updatedRecord.setDiagnosis(medicalRecord.getDiagnosis());
            updatedRecord.setMedication(medicalRecord.getMedication());
            updatedRecord.setExaminations(medicalRecord.getExaminations());
            updatedRecord.setTreatment(medicalRecord.getTreatment());
            updatedRecord.setNotes(medicalRecord.getNotes());
            return medicalRecordRepository.save(updatedRecord);
        } else {
            throw new RuntimeException("Medical Record not found with id: " + id);
        }
    }

    @Override
    public void deleteMedicalRecord(Long id) {
        Optional<MedicalRecord> existingRecord = medicalRecordRepository.findById(id);
        if (existingRecord.isPresent()) {
            medicalRecordRepository.deleteById(id);
        } else {
            throw new RuntimeException("Medical Record not found with id: " + id);
        }
    }
}