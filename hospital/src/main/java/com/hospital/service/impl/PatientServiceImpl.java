package com.hospital.service.impl;

import com.hospital.entity.MedicalRecord;
import com.hospital.entity.Patient;
import com.hospital.entity.Registration;
import com.hospital.entity.User;
import com.hospital.model.PatientDetailsDto;
import com.hospital.repository.MedicalRecordRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.RegistrationRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PatientServiceImpl implements PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

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

            // 只更新非空字段
            if (patient.getName() != null && !patient.getName().isEmpty()) {
                updatedPatient.setName(patient.getName());
            }
            // 修复：添加性别字段的更新
            if (patient.getGender() != null) {
                updatedPatient.setGender(patient.getGender());
            }
            if (patient.getAge() != null) {
                updatedPatient.setAge(patient.getAge());
            }
            if (patient.getPhone() != null && !patient.getPhone().isEmpty()) {
                updatedPatient.setPhone(patient.getPhone());
            }
            if (patient.getAddress() != null && !patient.getAddress().isEmpty()) {
                updatedPatient.setAddress(patient.getAddress());
            }
            // idCard、user 等字段不更新，保持原值

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

    @Override
    public List<PatientDetailsDto> getPatientsWithDetails() {
        return patientRepository.findAll()
                .stream()
                .map(this::buildPatientDetails)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<PatientDetailsDto> getPatientDetails(Long id) {
        return patientRepository.findById(id).map(this::buildPatientDetails);
    }

    private PatientDetailsDto buildPatientDetails(Patient patient) {
        List<Registration> registrations = registrationRepository.findByPatient(patient);
        List<MedicalRecord> records = medicalRecordRepository.findByPatient(patient);

        Map<Long, MedicalRecord> recordByRegistration = records.stream()
                .filter(record -> record.getRegistration() != null)
                .sorted(Comparator.comparing(MedicalRecord::getVisitDate).reversed())
                .collect(Collectors.toMap(record -> record.getRegistration().getId(), record -> record, (existing, replacement) -> existing));

        PatientDetailsDto dto = new PatientDetailsDto();
        dto.setId(patient.getId());
        dto.setUsername(patient.getUser() != null ? patient.getUser().getUsername() : null);
        dto.setName(patient.getName());
        dto.setGender(patient.getGender() != null ? patient.getGender().name() : null);
        dto.setAge(patient.getAge());
        dto.setPhone(patient.getPhone());
        dto.setAddress(patient.getAddress());
        dto.setMedicalHistory(buildMedicalHistory(records));
        dto.setVisitHistory(buildVisitHistory(registrations, recordByRegistration));
        return dto;
    }

    private List<PatientDetailsDto.MedicalRecordDto> buildMedicalHistory(List<MedicalRecord> records) {
        return records.stream()
                .sorted(Comparator.comparing(MedicalRecord::getVisitDate).reversed())
                .map(record -> {
                    PatientDetailsDto.MedicalRecordDto dto = new PatientDetailsDto.MedicalRecordDto();
                    dto.setId(record.getId());
                    dto.setVisitDate(record.getVisitDate());
                    dto.setDiagnosis(record.getDiagnosis());
                    dto.setTreatment(record.getTreatment());
                    dto.setMedications(parseMedications(record.getMedication()));
                    dto.setDoctor(record.getDoctor() != null ? record.getDoctor().getName() : null);
                    dto.setSymptoms(record.getSymptoms());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<PatientDetailsDto.VisitRecordDto> buildVisitHistory(List<Registration> registrations, Map<Long, MedicalRecord> recordByRegistration) {
        Comparator<Registration> appointmentComparator = Comparator.comparing(
                Registration::getAppointmentTime,
                Comparator.nullsLast(Comparator.naturalOrder())
        );

        return registrations.stream()
                .sorted(appointmentComparator.reversed())
                .map(registration -> {
                    PatientDetailsDto.VisitRecordDto dto = new PatientDetailsDto.VisitRecordDto();
                    dto.setId(registration.getId());
                    dto.setAppointmentTime(registration.getAppointmentTime());
                    dto.setDepartment(registration.getDoctor() != null && registration.getDoctor().getDepartment() != null
                            ? registration.getDoctor().getDepartment().getName()
                            : null);
                    dto.setDoctor(registration.getDoctor() != null ? registration.getDoctor().getName() : null);
                    dto.setDisease(registration.getDisease() != null ? registration.getDisease().getName() : null);
                    dto.setStatus(mapVisitStatus(registration.getStatus()));
                    String symptoms = recordByRegistration.containsKey(registration.getId())
                            ? recordByRegistration.get(registration.getId()).getSymptoms()
                            : null;
                    if (symptoms == null || symptoms.isBlank()) {
                        symptoms = registration.getDisease() != null ? registration.getDisease().getName() : "";
                    }
                    dto.setSymptoms(symptoms);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<String> parseMedications(String medication) {
        if (medication == null || medication.isBlank()) {
            return List.of();
        }
        return Arrays.stream(medication.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private String mapVisitStatus(Registration.Status status) {
        if (status == null) {
            return "pending";
        }
        return switch (status) {
            case COMPLETED -> "completed";
            case CANCELLED -> "cancelled";
            case CONFIRMED -> "confirmed";
            case WAITING -> "pending";
        };
    }
}