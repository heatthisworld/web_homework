package com.hospital.service;

import com.hospital.entity.Patient;
import com.hospital.entity.Registration;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RegistrationService {
    List<Registration> getAllRegistrations();
    Optional<Registration> getRegistrationById(Long id);
    List<Registration> getRegistrationsByPatientId(Long patientId);
    List<Registration> getRegistrationsByDoctorId(Long doctorId);
    List<Registration> getRegistrationsByDiseaseId(Long diseaseId);
    List<Registration> getRegistrationsByStatus(Registration.Status status);
    List<Registration> getRegistrationsByPatientAndStatus(Long patientId, Registration.Status status);
    List<Registration> getRegistrationsByAppointmentTimeBetween(LocalDateTime start, LocalDateTime end);
    Registration createRegistration(Registration registration);
    Registration updateRegistration(Long id, Registration registration);
    Registration updateRegistrationStatus(Long id, Registration.Status status);
    void deleteRegistration(Long id);
}
