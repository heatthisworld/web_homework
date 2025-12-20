package com.hospital.controller;

import com.hospital.entity.Patient;
import com.hospital.model.PatientDetailsDto;
import com.hospital.model.Result;
import com.hospital.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping
    public Result<List<Patient>> getAllPatients() {
        return Result.success(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    public Result<Patient> getPatientById(@PathVariable Long id) {
        Optional<Patient> patient = patientService.getPatientById(id);
        return patient.map(Result::success)
                .orElseGet(() -> Result.error(404, "患者不存在"));
    }

    @GetMapping("/{id}/details")
    public Result<PatientDetailsDto> getPatientDetails(@PathVariable Long id) {
        Optional<PatientDetailsDto> patient = patientService.getPatientDetails(id);
        return patient.map(Result::success)
                .orElseGet(() -> Result.error(404, "患者不存在"));
    }

    @GetMapping("/user/{userId}")
    public Result<Patient> getPatientByUserId(@PathVariable Long userId) {
        Optional<Patient> patient = patientService.getPatientByUserId(userId);
        return patient.map(Result::success)
                .orElseGet(() -> Result.error(404, "患者不存在"));
    }

    @GetMapping("/search")
    public Result<List<Patient>> searchPatientsByName(@RequestParam String name) {
        return Result.success(patientService.searchPatientsByName(name));
    }

    @GetMapping("/details")
    public Result<List<PatientDetailsDto>> getPatientsWithDetails(@RequestParam(required = false) String name) {
        List<PatientDetailsDto> patients = patientService.getPatientsWithDetails();
        if (name != null && !name.isBlank()) {
            String keyword = name.toLowerCase();
            patients = patients.stream()
                    .filter(p -> p.getName() != null && p.getName().toLowerCase().contains(keyword))
                    .toList();
        }
        return Result.success(patients);
    }

    @PostMapping
    public Result<Patient> createPatient(@RequestBody Patient patient) {
        Patient createdPatient = patientService.createPatient(patient);
        return Result.success(createdPatient);
    }

    @PutMapping("/{id}")
    public Result<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patient) {
        Patient updatedPatient = patientService.updatePatient(id, patient);
        return Result.success(updatedPatient);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return Result.success();
    }
}
