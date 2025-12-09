package com.hospital.repository;

import com.hospital.entity.Patient;
import com.hospital.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByPatient(Patient patient);
    List<Registration> findByDoctorId(Long doctorId);
    List<Registration> findByDiseaseId(Long diseaseId);
    List<Registration> findByStatus(Registration.Status status);
    List<Registration> findByPatientAndStatus(Patient patient, Registration.Status status);
    List<Registration> findByAppointmentTimeBetween(LocalDateTime start, LocalDateTime end);
}
