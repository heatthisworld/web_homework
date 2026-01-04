package com.hospital.controller;

import com.hospital.entity.Registration;
import com.hospital.model.Result;
import com.hospital.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationRepository registrationRepository;

    @GetMapping
    public Result<List<Registration>> getAllRegistrations() {
        return Result.success(registrationRepository.findAll());
    }

    @GetMapping("/{id}")
    public Result<Registration> getRegistrationById(@PathVariable Long id) {
        Optional<Registration> registration = registrationRepository.findById(id);
        return registration.map(Result::success)
                .orElseGet(() -> Result.error(404, "挂号记录不存在"));
    }

    @PostMapping
    public Result<Registration> createRegistration(@RequestBody Registration registration) {
        // 验证必要字段：patient 和 appointmentTime
        if (registration.getPatient() == null || registration.getPatient().getId() == null) {
            return Result.error(4001, "患者信息不能为空");
        }
        if (registration.getDoctor() == null || registration.getDoctor().getId() == null) {
            return Result.error(4002, "医生信息不能为空");
        }
        if (registration.getAppointmentTime() == null) {
            return Result.error(4003, "预约时间不能为空");
        }

        // disease 字段现在是可选的，不再强制要求

        // 检查时间冲突
        LocalDateTime appointmentTime = registration.getAppointmentTime();
        LocalDateTime startTime = appointmentTime.minusMinutes(30);
        LocalDateTime endTime = appointmentTime.plusMinutes(30);

        List<Registration> conflicts = registrationRepository.findConflictingRegistrations(
                registration.getPatient().getId(),
                startTime,
                endTime
        );

        if (!conflicts.isEmpty()) {
            return Result.error(4004, "该时间段已有挂号记录，请选择其他时间");
        }

        Registration savedRegistration = registrationRepository.save(registration);
        return Result.success(savedRegistration);
    }

    @PutMapping("/{id}")
    public Result<Registration> updateRegistration(@PathVariable Long id, @RequestBody Registration registration) {
        Optional<Registration> existingRegistration = registrationRepository.findById(id);
        if (existingRegistration.isPresent()) {
            Registration updatedRegistration = existingRegistration.get();

            if (registration.getStatus() != null) {
                updatedRegistration.setStatus(registration.getStatus());
            }
            if (registration.getAppointmentTime() != null) {
                LocalDateTime appointmentTime = registration.getAppointmentTime();
                LocalDateTime startTime = appointmentTime.minusMinutes(30);
                LocalDateTime endTime = appointmentTime.plusMinutes(30);

                List<Registration> conflicts = registrationRepository.findConflictingRegistrations(
                        updatedRegistration.getPatient().getId(),
                        startTime,
                        endTime
                );

                conflicts.removeIf(r -> r.getId().equals(id));

                if (!conflicts.isEmpty()) {
                    return Result.error(4004, "该时间段已有挂号记录，请选择其他时间");
                }

                updatedRegistration.setAppointmentTime(registration.getAppointmentTime());
            }
            if (registration.getNotes() != null) {
                updatedRegistration.setNotes(registration.getNotes());
            }
            // disease 字段可选更新
            if (registration.getDisease() != null) {
                updatedRegistration.setDisease(registration.getDisease());
            }

            registrationRepository.save(updatedRegistration);
            return Result.success(updatedRegistration);
        } else {
            return Result.error(404, "挂号记录不存在");
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteRegistration(@PathVariable Long id) {
        Optional<Registration> registration = registrationRepository.findById(id);
        if (registration.isPresent()) {
            Registration reg = registration.get();
            reg.setStatus(Registration.Status.CANCELLED);
            registrationRepository.save(reg);
            return Result.success();
        } else {
            return Result.error(404, "挂号记录不存在");
        }
    }
}