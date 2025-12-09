package com.hospital.service.impl;

import com.hospital.entity.Doctor;
import com.hospital.entity.Disease;
import com.hospital.entity.User;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.DiseaseRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Override
    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    @Override
    public Optional<Doctor> getDoctorByUserId(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.flatMap(doctorRepository::findByUser);
    }

    @Override
    public List<Doctor> getDoctorsByDepartment(String department) {
        return doctorRepository.findByDepartment(department);
    }

    @Override
    public List<Doctor> searchDoctorsByName(String name) {
        return doctorRepository.findByNameContaining(name);
    }

    @Override
    public Doctor createDoctor(Doctor doctor) {
        // 确保用户存在且角色为DOCTOR
        if (doctor.getUser() == null || !doctor.getUser().getRole().equals(User.Role.DOCTOR)) {
            throw new RuntimeException("Invalid user for doctor");
        }
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
            return doctorRepository.save(updatedDoctor);
        } else {
            throw new RuntimeException("Doctor not found with id: " + id);
        }
    }

    @Override
    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }

    @Override
    public Doctor addDiseaseToDoctor(Long doctorId, Long diseaseId) {
        Optional<Doctor> optionalDoctor = doctorRepository.findById(doctorId);
        Optional<Disease> optionalDisease = diseaseRepository.findById(diseaseId);

        if (optionalDoctor.isPresent() && optionalDisease.isPresent()) {
            Doctor doctor = optionalDoctor.get();
            Disease disease = optionalDisease.get();

            // 检查医生已管理的病种数量是否超过3个
            if (doctor.getDiseases().size() >= 3) {
                throw new RuntimeException("A doctor can manage at most 3 diseases");
            }

            // 检查病种是否已存在
            if (!doctor.getDiseases().contains(disease)) {
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
            if (doctor.getDiseases().contains(disease)) {
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
}
