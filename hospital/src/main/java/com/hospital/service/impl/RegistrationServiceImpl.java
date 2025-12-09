package com.hospital.service.impl;

import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.entity.Registration;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.RegistrationRepository;
import com.hospital.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RegistrationServiceImpl implements RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    @Override
    public Optional<Registration> getRegistrationById(Long id) {
        return registrationRepository.findById(id);
    }

    @Override
    public List<Registration> getRegistrationsByPatientId(Long patientId) {
        Optional<Patient> patient = patientRepository.findById(patientId);
        if (patient.isPresent()) {
            return registrationRepository.findByPatient(patient.get());
        }
        return List.of();
    }

    @Override
    public List<Registration> getRegistrationsByDoctorId(Long doctorId) {
        return registrationRepository.findByDoctorId(doctorId);
    }

    @Override
    public List<Registration> getRegistrationsByDiseaseId(Long diseaseId) {
        return registrationRepository.findByDiseaseId(diseaseId);
    }

    @Override
    public List<Registration> getRegistrationsByStatus(Registration.Status status) {
        return registrationRepository.findByStatus(status);
    }

    @Override
    public List<Registration> getRegistrationsByPatientAndStatus(Long patientId, Registration.Status status) {
        Optional<Patient> patient = patientRepository.findById(patientId);
        if (patient.isPresent()) {
            return registrationRepository.findByPatientAndStatus(patient.get(), status);
        }
        return List.of();
    }

    @Override
    public List<Registration> getRegistrationsByAppointmentTimeBetween(LocalDateTime start, LocalDateTime end) {
        return registrationRepository.findByAppointmentTimeBetween(start, end);
    }

    @Override
    public Registration createRegistration(Registration registration) {
        // 验证病人和医生是否存在
        if (!patientRepository.existsById(registration.getPatient().getId())) {
            throw new RuntimeException("Patient not found");
        }
        if (!doctorRepository.existsById(registration.getDoctor().getId())) {
            throw new RuntimeException("Doctor not found");
        }
        // 验证预约时间是否在未来
        if (registration.getAppointmentTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Appointment time must be in the future");
        }
        return registrationRepository.save(registration);
    }

    @Override
    public Registration updateRegistration(Long id, Registration registration) {
        Optional<Registration> existingRegistration = registrationRepository.findById(id);
        if (existingRegistration.isPresent()) {
            Registration updatedRegistration = existingRegistration.get();
            updatedRegistration.setDoctor(registration.getDoctor());
            updatedRegistration.setDisease(registration.getDisease());
            updatedRegistration.setAppointmentTime(registration.getAppointmentTime());
            updatedRegistration.setStatus(registration.getStatus());
            return registrationRepository.save(updatedRegistration);
        } else {
            throw new RuntimeException("Registration not found with id: " + id);
        }
    }

    @Override
    public Registration updateRegistrationStatus(Long id, Registration.Status status) {
        Optional<Registration> existingRegistration = registrationRepository.findById(id);
        if (existingRegistration.isPresent()) {
            Registration registration = existingRegistration.get();
            registration.setStatus(status);
            return registrationRepository.save(registration);
        } else {
            throw new RuntimeException("Registration not found with id: " + id);
        }
    }

    @Override
    public void deleteRegistration(Long id) {
        registrationRepository.deleteById(id);
    }
}
