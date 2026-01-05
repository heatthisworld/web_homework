package com.hospital.controller;

import com.hospital.entity.Doctor;
import com.hospital.entity.Disease;
import com.hospital.model.Result;
import com.hospital.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public Result<List<Doctor>> getAllDoctors() {
        return Result.success(doctorService.getAllDoctors());
    }

    @GetMapping("/deleted")
    public Result<List<Doctor>> getDeletedDoctors() {
        return Result.success(doctorService.getDeletedDoctors());
    }

    @GetMapping("/{id}")
    public Result<Doctor> getDoctorById(@PathVariable Long id) {
        Optional<Doctor> doctor = doctorService.getDoctorById(id);
        return doctor.map(Result::success)
                .orElseGet(() -> Result.error(404, "医生不存在"));
    }

    @GetMapping("/user/{userId}")
    public Result<Doctor> getDoctorByUserId(@PathVariable Long userId) {
        Optional<Doctor> doctor = doctorService.getDoctorByUserId(userId);
        return doctor.map(Result::success)
                .orElseGet(() -> Result.error(404, "医生不存在"));
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
}
