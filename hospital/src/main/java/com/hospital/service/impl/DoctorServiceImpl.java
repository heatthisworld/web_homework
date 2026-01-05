package com.hospital.service.impl;

import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.entity.Disease;
import com.hospital.entity.User;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.DiseaseRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DiseaseRepository diseaseRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findByDeletedAtIsNull();
    }

    @Override
    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findByIdAndDeletedAtIsNull(id);
    }

    @Override
    public Optional<Doctor> getDoctorByUserId(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.flatMap(u -> doctorRepository.findByUserAndDeletedAtIsNull(u));
    }

    @Override
    public List<Doctor> getDoctorsByDepartment(String departmentName) {
        if (departmentName == null || departmentName.isBlank()) {
            return doctorRepository.findByDeletedAtIsNull();
        }
        return doctorRepository.findByDepartment_NameAndDeletedAtIsNull(departmentName);
    }

    @Override
    public List<Doctor> searchDoctorsByName(String name) {
        return doctorRepository.findByNameContainingAndDeletedAtIsNull(name);
    }

    @Override
    public List<Doctor> getDeletedDoctors() {
        return doctorRepository.findByDeletedAtIsNotNull();
    }

    @Override
    public Doctor createDoctor(Doctor doctor) {
        // 确保用户存在且角色为 DOCTOR
        if (doctor.getUser() == null || !doctor.getUser().getRole().equals(User.Role.DOCTOR)) {
            throw new RuntimeException("Invalid user for doctor");
        }
        ensureDepartmentExists(doctor.getDepartment());
        return doctorRepository.save(doctor);
    }

    @Override
    public Doctor updateDoctor(Long id, Doctor doctor) {
        Optional<Doctor> existingDoctor = doctorRepository.findById(id);
        if (existingDoctor.isPresent()) {
            Doctor updatedDoctor = existingDoctor.get();
            updatedDoctor.setName(doctor.getName());
            updatedDoctor.setGender(doctor.getGender());
            updatedDoctor.setTitle(doctor.getTitle());
            updatedDoctor.setPhone(doctor.getPhone());
            updatedDoctor.setDepartment(doctor.getDepartment());
            updatedDoctor.setDiseases(doctor.getDiseases());
            ensureDepartmentExists(updatedDoctor.getDepartment());
            return doctorRepository.save(updatedDoctor);
        } else {
            throw new RuntimeException("Doctor not found with id: " + id);
        }
    }

    @Override
    public void deleteDoctor(Long id) {
        Optional<Doctor> optionalDoctor = doctorRepository.findById(id);
        if (optionalDoctor.isPresent()) {
            Doctor doctor = optionalDoctor.get();
            // 执行软删除
            doctor.setDeletedAt(LocalDateTime.now());
            doctorRepository.save(doctor);
            
            // 将关联的用户设置为无效状态
            if (doctor.getUser() != null) {
                User user = doctor.getUser();
                user.setStatus(User.Status.INACTIVE);
                userRepository.save(user);
            }
        } else {
            throw new RuntimeException("医生不存在或已被删除，请检查ID为 " + id + " 的医生是否存在");
        }
    }

    @Override
    public Doctor addDiseaseToDoctor(Long doctorId, Long diseaseId) {
        Optional<Doctor> optionalDoctor = doctorRepository.findById(doctorId);
        Optional<Disease> optionalDisease = diseaseRepository.findById(diseaseId);

        if (optionalDoctor.isPresent() && optionalDisease.isPresent()) {
            Doctor doctor = optionalDoctor.get();
            Disease disease = optionalDisease.get();

            // 检查医生已管理的病种数量
            if (doctor.getDiseases() != null && doctor.getDiseases().size() >= 3) {
                throw new RuntimeException("A doctor can manage at most 3 diseases");
            }

            // 检查病种是否已存在
            if (doctor.getDiseases() == null || !doctor.getDiseases().contains(disease)) {
                if (doctor.getDiseases() == null) {
                    doctor.setDiseases(new java.util.ArrayList<>());
                }
                doctor.getDiseases().add(disease);
                return doctorRepository.save(doctor);
            }
            return doctor;
        } else {
            throw new RuntimeException("Doctor or Disease not found");
        }
    }

    @Override
    public Doctor removeDiseaseFromDoctor(Long doctorId, Long diseaseId) {
        Optional<Doctor> optionalDoctor = doctorRepository.findById(doctorId);
        Optional<Disease> optionalDisease = diseaseRepository.findById(diseaseId);

        if (optionalDoctor.isPresent() && optionalDisease.isPresent()) {
            Doctor doctor = optionalDoctor.get();
            Disease disease = optionalDisease.get();

            // 检查病种是否存在
            if (doctor.getDiseases() != null && doctor.getDiseases().contains(disease)) {
                doctor.getDiseases().remove(disease);
                return doctorRepository.save(doctor);
            }
            return doctor;
        } else {
            throw new RuntimeException("Doctor or Disease not found");
        }
    }

    @Override
    public List<Disease> getDoctorDiseases(Long doctorId) {
        Optional<Doctor> optionalDoctor = doctorRepository.findById(doctorId);
        if (optionalDoctor.isPresent()) {
            return optionalDoctor.get().getDiseases();
        } else {
            throw new RuntimeException("Doctor not found with id: " + doctorId);
        }
    }

    private void ensureDepartmentExists(Department department) {
        if (department == null) {
            throw new RuntimeException("Department is required");
        }
        if (department.getId() != null) {
            return;
        }
        // try to reuse by name
        departmentRepository.findByName(department.getName()).ifPresentOrElse(found -> {
            department.setId(found.getId());
        }, () -> departmentRepository.save(department));
    }
}
