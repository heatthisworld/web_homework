package com.hospital.controller;

import com.hospital.entity.Disease;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.entity.Registration;
import com.hospital.entity.User;
import com.hospital.model.AdminStatsResponse;
import com.hospital.model.RecentRegistrationDto;
import com.hospital.model.Result;
import com.hospital.repository.DiseaseRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.RegistrationRepository;
import com.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DiseaseRepository diseaseRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @GetMapping("/stats")
    public Result<AdminStatsResponse> getStats() {
        AdminStatsResponse stats = new AdminStatsResponse();

        stats.setTotalUsers(userRepository.count());
        stats.setTotalDoctors(doctorRepository.count());
        stats.setTotalPatients(patientRepository.count());
        stats.setTotalDiseases(diseaseRepository.count());

        Set<String> departments = doctorRepository.findAll().stream()
                .map(Doctor::getDepartment)
                .filter(d -> d != null && !d.isBlank())
                .collect(Collectors.toSet());
        departments.addAll(diseaseRepository.findAll().stream()
                .map(Disease::getDepartment)
                .filter(d -> d != null && !d.isBlank())
                .collect(Collectors.toSet()));
        stats.setDepartmentCount(departments.size());

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        stats.setTodayRegistrations(registrationRepository.findAll().stream()
                .filter(r -> r.getAppointmentTime() != null
                        && !r.getAppointmentTime().isBefore(startOfDay)
                        && !r.getAppointmentTime().isAfter(endOfDay))
                .count());

        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        stats.setMonthRegistrations(registrationRepository.findAll().stream()
                .filter(r -> r.getAppointmentTime() != null
                        && !r.getAppointmentTime().isBefore(firstDayOfMonth.atStartOfDay())
                        && r.getAppointmentTime().getMonth() == today.getMonth()
                        && r.getAppointmentTime().getYear() == today.getYear())
                .count());

        Map<String, Long> byDepartment = registrationRepository.findAll().stream()
                .collect(Collectors.groupingBy(r -> {
                    if (r.getDisease() != null && r.getDisease().getDepartment() != null) {
                        return r.getDisease().getDepartment();
                    }
                    if (r.getDoctor() != null) {
                        return r.getDoctor().getDepartment();
                    }
                    return "未分配";
                }, Collectors.counting()));

        List<AdminStatsResponse.DepartmentStat> departmentStats = byDepartment.entrySet().stream()
                .map(entry -> {
                    AdminStatsResponse.DepartmentStat stat = new AdminStatsResponse.DepartmentStat();
                    stat.setDepartment(entry.getKey());
                    stat.setCount(entry.getValue());
                    return stat;
                })
                .sorted(Comparator.comparing(AdminStatsResponse.DepartmentStat::getCount).reversed())
                .toList();
        stats.setRegistrationByDepartment(departmentStats);

        List<RecentRegistrationDto> recentRegistrations = registrationRepository.findAll().stream()
                .sorted(Comparator.comparing(Registration::getRegistrationTime, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(8)
                .map(this::toRecentDto)
                .toList();
        stats.setRecentRegistrations(recentRegistrations);

        return Result.success(stats);
    }

    private RecentRegistrationDto toRecentDto(Registration registration) {
        RecentRegistrationDto dto = new RecentRegistrationDto();
        dto.setId(registration.getId());
        dto.setAppointmentTime(registration.getAppointmentTime());
        dto.setDepartment(registration.getDoctor() != null ? registration.getDoctor().getDepartment() : null);
        dto.setDoctorName(registration.getDoctor() != null ? registration.getDoctor().getName() : null);
        dto.setPatientName(registration.getPatient() != null ? registration.getPatient().getName() : null);
        dto.setDisease(registration.getDisease() != null ? registration.getDisease().getName() : null);
        dto.setStatus(registration.getStatus() != null ? registration.getStatus().name() : "REGISTERED");
        return dto;
    }
}
