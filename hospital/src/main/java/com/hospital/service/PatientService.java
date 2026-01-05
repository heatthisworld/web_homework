package com.hospital.service;

import com.hospital.entity.Patient;
import com.hospital.model.PatientDetailsDto;

import java.util.List;
import java.util.Optional;

public interface PatientService {
    List<Patient> getAllPatients();
    Optional<Patient> getPatientById(Long id);
    Optional<Patient> getPatientByUserId(Long userId);
    Optional<Patient> getPatientByIdCard(String idCard);
    List<Patient> searchPatientsByName(String name);
    Patient createPatient(Patient patient);
    Patient updatePatient(Long id, Patient patient);
    void deletePatient(Long id);
    List<PatientDetailsDto> getPatientsWithDetails();
    List<PatientDetailsDto> getPatientsWithDetailsByDoctor(Long doctorId);
    Optional<PatientDetailsDto> getPatientDetails(Long id);
}
