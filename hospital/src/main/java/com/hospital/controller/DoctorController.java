package com.hospital.controller;

import com.hospital.entity.Doctor;
import com.hospital.entity.Disease;
import com.hospital.entity.MedicalRecord;
import com.hospital.entity.Patient;
import com.hospital.entity.Registration;
import com.hospital.entity.User;
import com.hospital.model.BatchUpdateRegistrationStatusRequest;
import com.hospital.model.DoctorPatientSummary;
import com.hospital.model.DoctorRegistrationDto;
import com.hospital.model.DoctorRegistrationUpdateRequest;
import com.hospital.model.MedicalRecordRequest;
import com.hospital.model.PatientDetailsDto;
import com.hospital.model.Result;
import com.hospital.model.UpdateRegistrationStatusRequest;
import com.hospital.repository.DiseaseRepository;
import com.hospital.repository.MedicalRecordRepository;
import com.hospital.repository.RegistrationRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.DoctorService;
import com.hospital.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private DiseaseRepository diseaseRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PatientService patientService;

    @GetMapping
    public Result<List<Doctor>> getAllDoctors() {
        return Result.success(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    public Result<Doctor> getDoctorById(@PathVariable Long id) {
        Optional<Doctor> doctor = doctorService.getDoctorById(id);
        return doctor.map(Result::success)
                .orElseGet(() -> Result.error(404, "Doctor not found"));
    }

    @GetMapping("/user/{userId}")
    public Result<Doctor> getDoctorByUserId(@PathVariable Long userId) {
        Optional<Doctor> doctor = doctorService.getDoctorByUserId(userId);
        return doctor.map(Result::success)
                .orElseGet(() -> Result.error(404, "Doctor not found"));
    }

    @GetMapping("/current")
    public Result<Doctor> getCurrentDoctor(Authentication authentication) {
        Optional<Doctor> doctor = resolveCurrentDoctor(authentication);
        return doctor.map(Result::success)
                .orElseGet(() -> Result.error(404, "Doctor not found for current user"));
    }

    @GetMapping("/patients")
    public Result<List<DoctorPatientSummary>> getPatientsForDoctor(Authentication authentication) {
        Optional<Doctor> doctor = resolveCurrentDoctor(authentication);
        if (doctor.isEmpty()) {
            return Result.error(403, "Current user is not a doctor or not authenticated");
        }

        List<DoctorPatientSummary> patients = getPatientsForDoctor(doctor.get()).stream()
                .map(this::toPatientSummary)
                .collect(Collectors.toList());
        return Result.success(patients);
    }

    @GetMapping("/patients/details")
    public Result<List<PatientDetailsDto>> getPatientsWithDetails(Authentication authentication) {
        Optional<Doctor> doctor = resolveCurrentDoctor(authentication);
        if (doctor.isEmpty()) {
            return Result.error(403, "Current user is not a doctor or not authenticated");
        }
        List<PatientDetailsDto> patients = patientService.getPatientsWithDetailsByDoctor(doctor.get().getId());
        return Result.success(patients);
    }

    @GetMapping("/registrations")
    public Result<List<DoctorRegistrationDto>> getDoctorRegistrations(Authentication authentication) {
        Optional<Doctor> doctor = resolveCurrentDoctor(authentication);
        if (doctor.isEmpty()) {
            return Result.error(403, "Current user is not a doctor or not authenticated");
        }
        List<DoctorRegistrationDto> registrations = registrationRepository.findByDoctorId(doctor.get().getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return Result.success(registrations);
    }

    @PostMapping("/registrations/{id}/medical-record")
    public Result<MedicalRecord> createOrUpdateMedicalRecord(@PathVariable Long id,
                                                             @RequestBody MedicalRecordRequest request,
                                                             Authentication authentication) {
        Optional<Doctor> doctor = resolveCurrentDoctor(authentication);
        if (doctor.isEmpty()) {
            return Result.error(403, "Current user is not a doctor or not authenticated");
        }

        Optional<Registration> optionalRegistration = registrationRepository.findById(id);
        if (optionalRegistration.isEmpty() || optionalRegistration.get().getDoctor() == null
                || !doctor.get().getId().equals(optionalRegistration.get().getDoctor().getId())) {
            return Result.error(404, "Registration not found for this doctor");
        }
        Registration registration = optionalRegistration.get();

        MedicalRecord record = medicalRecordRepository.findByRegistrationId(id)
                .stream()
                .findFirst()
                .orElseGet(MedicalRecord::new);

        record.setPatient(registration.getPatient());
        record.setDoctor(registration.getDoctor());
        record.setRegistration(registration);
        record.setVisitDate(registration.getAppointmentTime() != null
                ? registration.getAppointmentTime()
                : LocalDateTime.now());
        record.setSymptoms(request.getSymptoms());
        record.setDiagnosis(request.getDiagnosis());
        record.setMedication(request.getMedication());
        record.setExaminations(request.getExaminations());
        record.setTreatment(request.getTreatment());
        record.setNotes(request.getNotes());

        MedicalRecord saved = medicalRecordRepository.save(record);
        return Result.success(saved);
    }

    @GetMapping("/registrations/{id}/medical-record")
    public Result<MedicalRecord> getMedicalRecord(@PathVariable Long id, Authentication authentication) {
        Optional<Doctor> doctor = resolveCurrentDoctor(authentication);
        if (doctor.isEmpty()) {
            return Result.error(403, "Current user is not a doctor or not authenticated");
        }

        Optional<Registration> optionalRegistration = registrationRepository.findById(id);
        if (optionalRegistration.isEmpty() || optionalRegistration.get().getDoctor() == null
                || !doctor.get().getId().equals(optionalRegistration.get().getDoctor().getId())) {
            return Result.error(404, "Registration not found for this doctor");
        }

        Optional<MedicalRecord> record = medicalRecordRepository.findByRegistrationId(id).stream().findFirst();
        return record.map(Result::success).orElseGet(() -> Result.error(404, "Medical record not found"));
    }

    @PutMapping("/registrations/{id}/status")
    public Result<DoctorRegistrationDto> updateRegistrationStatus(@PathVariable Long id,
                                                                  @RequestBody UpdateRegistrationStatusRequest request,
                                                                  Authentication authentication) {
        Optional<Doctor> doctor = resolveCurrentDoctor(authentication);
        if (doctor.isEmpty()) {
            return Result.error(403, "Current user is not a doctor or not authenticated");
        }

        Optional<Registration> optionalRegistration = registrationRepository.findById(id);
        if (optionalRegistration.isEmpty() || optionalRegistration.get().getDoctor() == null
                || !doctor.get().getId().equals(optionalRegistration.get().getDoctor().getId())) {
            return Result.error(404, "Registration not found for this doctor");
        }

        if ("completed".equalsIgnoreCase(request.getStatus())
                && medicalRecordRepository.findByRegistrationId(id).isEmpty()) {
            return Result.error(400, "Medical record is required before completing the registration");
        }

        Registration.Status newStatus = mapStatusFromFrontend(request.getStatus());
        if (newStatus == null) {
            return Result.error(400, "Invalid status value");
        }

        Registration registration = optionalRegistration.get();
        registration.setStatus(newStatus);
        registrationRepository.save(registration);
        return Result.success(toDto(registration));
    }

    @PutMapping("/registrations/{id}")
    public Result<DoctorRegistrationDto> updateRegistration(@PathVariable Long id,
                                                            @RequestBody DoctorRegistrationUpdateRequest request,
                                                            Authentication authentication) {
        Optional<Doctor> doctor = resolveCurrentDoctor(authentication);
        if (doctor.isEmpty()) {
            return Result.error(403, "Current user is not a doctor or not authenticated");
        }

        Optional<Registration> optionalRegistration = registrationRepository.findById(id);
        if (optionalRegistration.isEmpty() || optionalRegistration.get().getDoctor() == null
                || !doctor.get().getId().equals(optionalRegistration.get().getDoctor().getId())) {
            return Result.error(404, "Registration not found for this doctor");
        }

        Registration registration = optionalRegistration.get();

        if (request.getStatus() != null) {
            Registration.Status status = mapStatusFromFrontend(request.getStatus());
            if (status == null) {
                return Result.error(400, "Invalid status value");
            }
            if (status == Registration.Status.COMPLETED
                    && medicalRecordRepository.findByRegistrationId(id).isEmpty()) {
                return Result.error(400, "Medical record is required before completing the registration");
            }
            registration.setStatus(status);
        }

        if (request.getAppointmentTime() != null) {
            try {
                registration.setAppointmentTime(parseAppointmentTime(request.getAppointmentTime()));
            } catch (DateTimeParseException e) {
                return Result.error(400, "Invalid appointmentTime format, expected ISO date time");
            }
        }

        if (request.getNotes() != null) {
            registration.setNotes(request.getNotes());
        }

        if (request.getDiseaseId() != null) {
            diseaseRepository.findById(request.getDiseaseId()).ifPresent(registration::setDisease);
        }

        registrationRepository.save(registration);
        return Result.success(toDto(registration));
    }

    @PutMapping("/registrations/batch/status")
    public Result<Void> batchUpdateRegistrationStatus(@RequestBody BatchUpdateRegistrationStatusRequest request,
                                                      Authentication authentication) {
        Optional<Doctor> doctor = resolveCurrentDoctor(authentication);
        if (doctor.isEmpty()) {
            return Result.error(403, "Current user is not a doctor or not authenticated");
        }

        if (request.getIds() == null || request.getIds().isEmpty()) {
            return Result.error(400, "No registration ids provided");
        }

        Registration.Status status = mapStatusFromFrontend(request.getStatus());
        if (status == null) {
            return Result.error(400, "Invalid status value");
        }

        List<Registration> registrations = registrationRepository.findAllById(request.getIds());
        if (registrations.size() != request.getIds().size()) {
            return Result.error(404, "Some registrations not found");
        }

        Long doctorId = doctor.get().getId();
        boolean hasOtherDoctorRegistration = registrations.stream()
                .anyMatch(reg -> reg.getDoctor() == null || !doctorId.equals(reg.getDoctor().getId()));
        if (hasOtherDoctorRegistration) {
            return Result.error(403, "Contains registration that does not belong to current doctor");
        }

        registrations.forEach(reg -> reg.setStatus(status));
        registrationRepository.saveAll(registrations);
        return Result.success();
    }

    @GetMapping("/department/{department}")
    public Result<List<Doctor>> getDoctorsByDepartment(@PathVariable String department) {
        return Result.success(doctorService.getDoctorsByDepartment(department));
    }

    @GetMapping("/search")
    public Result<List<Doctor>> searchDoctorsByName(@RequestParam String name) {
        return Result.success(doctorService.searchDoctorsByName(name));
    }

    @PostMapping
    public Result<Doctor> createDoctor(@RequestBody Doctor doctor) {
        Doctor createdDoctor = doctorService.createDoctor(doctor);
        return Result.success(createdDoctor);
    }

    @PutMapping("/{id}")
    public Result<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctor) {
        Doctor updatedDoctor = doctorService.updateDoctor(id, doctor);
        return Result.success(updatedDoctor);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return Result.success();
    }

    @PostMapping("/{id}/diseases")
    public Result<Doctor> addDiseaseToDoctor(@PathVariable Long id, @RequestParam Long diseaseId) {
        Doctor updatedDoctor = doctorService.addDiseaseToDoctor(id, diseaseId);
        return Result.success(updatedDoctor);
    }

    @DeleteMapping("/{id}/diseases/{diseaseId}")
    public Result<Doctor> removeDiseaseFromDoctor(@PathVariable Long id, @PathVariable Long diseaseId) {
        Doctor updatedDoctor = doctorService.removeDiseaseFromDoctor(id, diseaseId);
        return Result.success(updatedDoctor);
    }

    @GetMapping("/{id}/diseases")
    public Result<List<Disease>> getDoctorDiseases(@PathVariable Long id) {
        return Result.success(doctorService.getDoctorDiseases(id));
    }

    private Optional<Doctor> resolveCurrentDoctor(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        return userRepository.findByUsername(authentication.getName())
                .filter(user -> User.Role.DOCTOR.equals(user.getRole()))
                .flatMap(user -> doctorService.getDoctorByUserId(user.getId()));
    }

    private Registration.Status mapStatusFromFrontend(String status) {
        if (status == null) {
            return null;
        }
        return switch (status.toLowerCase()) {
            case "pending" -> Registration.Status.WAITING;
            case "processing", "confirmed" -> Registration.Status.CONFIRMED;
            case "completed" -> Registration.Status.COMPLETED;
            case "cancelled" -> Registration.Status.CANCELLED;
            default -> null;
        };
    }

    private String mapStatusToFrontend(Registration.Status status) {
        if (status == null) {
            return "pending";
        }
        return switch (status) {
            case WAITING -> "pending";
            case CONFIRMED -> "processing";
            case COMPLETED -> "completed";
            case CANCELLED -> "cancelled";
        };
    }

    private DoctorRegistrationDto toDto(Registration registration) {
        DoctorRegistrationDto dto = new DoctorRegistrationDto();
        dto.setId(registration.getId());
        if (registration.getPatient() != null) {
            dto.setPatientId(registration.getPatient().getId());
            dto.setPatientName(registration.getPatient().getName());
        }
        if (registration.getDoctor() != null && registration.getDoctor().getDepartment() != null) {
            dto.setDepartment(registration.getDoctor().getDepartment().getName());
        }
        if (registration.getDisease() != null) {
            dto.setDisease(registration.getDisease().getName());
        }
        dto.setAppointmentTime(registration.getAppointmentTime());
        dto.setStatus(mapStatusToFrontend(registration.getStatus()));
        dto.setHasMedicalRecord(!medicalRecordRepository.findByRegistrationId(registration.getId()).isEmpty());
        return dto;
    }

    private LocalDateTime parseAppointmentTime(String raw) {
        try {
            return LocalDateTime.parse(raw);
        } catch (DateTimeParseException ex) {
            // Fallback for values without seconds from datetime-local input
            DateTimeFormatter minuteFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
            return LocalDateTime.parse(raw, minuteFormatter);
        }
    }

    private List<Patient> getPatientsForDoctor(Doctor doctor) {
        return registrationRepository.findByDoctorId(doctor.getId()).stream()
                .map(Registration::getPatient)
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(Patient::getId, patient -> patient, (existing, replacement) -> existing))
                .values()
                .stream()
                .collect(Collectors.toList());
    }

    private DoctorPatientSummary toPatientSummary(Patient patient) {
        DoctorPatientSummary dto = new DoctorPatientSummary();
        dto.setId(patient.getId());
        dto.setName(patient.getName());
        dto.setGender(patient.getGender() != null ? patient.getGender().name() : null);
        dto.setPhone(patient.getPhone());
        dto.setAddress(patient.getAddress());
        return dto;
    }
}
