package com.hospital.controller;

import com.hospital.entity.Registration;
import com.hospital.model.Result;
import com.hospital.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @GetMapping
    public Result<List<Registration>> getAllRegistrations() {
        return Result.success(registrationService.getAllRegistrations());
    }

    @GetMapping("/{id}")
    public Result<Registration> getRegistrationById(@PathVariable Long id) {
        Optional<Registration> registration = registrationService.getRegistrationById(id);
        return registration.map(Result::success)
                .orElseGet(() -> Result.error(404, "挂号记录不存在"));
    }

    @GetMapping("/patient/{patientId}")
    public Result<List<Registration>> getRegistrationsByPatientId(@PathVariable Long patientId) {
        return Result.success(registrationService.getRegistrationsByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public Result<List<Registration>> getRegistrationsByDoctorId(@PathVariable Long doctorId) {
        return Result.success(registrationService.getRegistrationsByDoctorId(doctorId));
    }

    @GetMapping("/disease/{diseaseId}")
    public Result<List<Registration>> getRegistrationsByDiseaseId(@PathVariable Long diseaseId) {
        return Result.success(registrationService.getRegistrationsByDiseaseId(diseaseId));
    }

    @GetMapping("/status/{status}")
    public Result<List<Registration>> getRegistrationsByStatus(@PathVariable Registration.Status status) {
        return Result.success(registrationService.getRegistrationsByStatus(status));
    }

    @GetMapping("/patient/{patientId}/status/{status}")
    public Result<List<Registration>> getRegistrationsByPatientAndStatus(@PathVariable Long patientId, @PathVariable Registration.Status status) {
        return Result.success(registrationService.getRegistrationsByPatientAndStatus(patientId, status));
    }

    @GetMapping("/time")
    public Result<List<Registration>> getRegistrationsByAppointmentTimeBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return Result.success(registrationService.getRegistrationsByAppointmentTimeBetween(start, end));
    }

    @PostMapping
    public Result<Registration> createRegistration(@RequestBody Registration registration) {
        try {
            Registration createdRegistration = registrationService.createRegistration(registration);
            return Result.success(createdRegistration);
        } catch (RuntimeException e) {
            return Result.error(400, "创建挂号失败：" + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result<Registration> updateRegistration(@PathVariable Long id, @RequestBody Registration registration) {
        try {
            Registration updatedRegistration = registrationService.updateRegistration(id, registration);
            return Result.success(updatedRegistration);
        } catch (RuntimeException e) {
            return Result.error(404, "挂号记录不存在");
        }
    }

    @PutMapping("/{id}/status/{status}")
    public Result<Registration> updateRegistrationStatus(@PathVariable Long id, @PathVariable Registration.Status status) {
        try {
            Registration updatedRegistration = registrationService.updateRegistrationStatus(id, status);
            return Result.success(updatedRegistration);
        } catch (RuntimeException e) {
            return Result.error(404, "挂号记录不存在");
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteRegistration(@PathVariable Long id) {
        try {
            registrationService.deleteRegistration(id);
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(404, "挂号记录不存在");
        }
    }
}
