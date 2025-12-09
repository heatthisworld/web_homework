package com.hospital.service.impl;

import com.hospital.entity.Patient;
import com.hospital.entity.User;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientServiceImpl implements PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Override
    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    @Override
    public Optional<Patient> getPatientByUserId(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.flatMap(patientRepository::findByUser);
    }

    @Override
    public Optional<Patient> getPatientByIdCard(String idCard) {
        return patientRepository.findByIdCard(idCard);
    }

    @Override
    public Patient createPatient(Patient patient) {
        // 确保用户存在且角色为PATIENT
        if (patient.getUser() == null || !patient.getUser().getRole().equals(User.Role.PATIENT)) {
            throw new RuntimeException("Invalid user for patient");
        }
        return patientRepository.save(patient);
    }

    @Override
    public Patient updatePatient(Long id, Patient patient) {
        Optional<Patient> existingPatient = patientRepository.findById(id);
        if (existingPatient.isPresent()) {
            Patient updatedPatient = existingPatient.get();
            updatedPatient.setName(patient.getName());
            updatedPatient.setGender(patient.getGender());
            updatedPatient.setAge(patient.getAge());
            updatedPatient.setIdCard(patient.getIdCard());
            updatedPatient.setPhone(patient.getPhone());
            updatedPatient.setAddress(patient.getAddress());
            return patientRepository.save(updatedPatient);
        } else {
            throw new RuntimeException("Patient not found with id: " + id);
        }
    }

    @Override
    public List<Patient> searchPatientsByName(String name) {
        return patientRepository.findByNameContaining(name);
    }

    @Override
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}
