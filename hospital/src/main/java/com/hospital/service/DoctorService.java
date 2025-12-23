package com.hospital.service;

import com.hospital.entity.Doctor;
import com.hospital.entity.Disease;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

public interface DoctorService {
    List<Doctor> getAllDoctors();
    Optional<Doctor> getDoctorById(Long id);
    Optional<Doctor> getDoctorByUserId(Long userId);
    List<Doctor> getDoctorsByDepartment(String departmentName);
    List<Doctor> searchDoctorsByName(String name);
    Doctor createDoctor(Doctor doctor);
    Doctor updateDoctor(Long id, Doctor doctor);
    void deleteDoctor(Long id);
    Doctor addDiseaseToDoctor(Long doctorId, Long diseaseId);
    Doctor removeDiseaseFromDoctor(Long doctorId, Long diseaseId);
    List<Disease> getDoctorDiseases(Long doctorId);
}
