package com.hospital.service.impl;

import com.hospital.entity.User;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.MedicalRecordRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.RegistrationRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public User createUser(User user) {
        // 加密密码
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User user) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User updatedUser = existingUser.get();
            updatedUser.setUsername(user.getUsername());
            // 如果密码不为空，则更新密码
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                updatedUser.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            updatedUser.setRole(user.getRole());
            updatedUser.setDisplayName(user.getDisplayName());
            updatedUser.setEmail(user.getEmail());
            updatedUser.setPhone(user.getPhone());
            updatedUser.setStatus(user.getStatus());
            return userRepository.save(updatedUser);
        } else {
            throw new RuntimeException("用户不存在或已被删除，请检查ID为 " + id + " 的用户是否存在");
        }
    }

    @Override
    public void deleteUser(Long id) {
        // 先处理Doctor相关的级联删除
        doctorRepository.findByUserId(id).ifPresent(doctor -> {
            // 删除该医生的所有挂号记录
            registrationRepository.findByDoctorId(doctor.getId()).forEach(registration -> {
                // 先删除该挂号记录的所有病历
                medicalRecordRepository.findByRegistrationId(registration.getId()).forEach(medicalRecord -> {
                    medicalRecordRepository.delete(medicalRecord);
                });
                // 再删除挂号记录
                registrationRepository.delete(registration);
            });
            // 删除医生记录
            doctorRepository.delete(doctor);
        });
        
        // 再处理Patient相关的级联删除
        patientRepository.findByUserId(id).ifPresent(patient -> {
            // 删除该患者的所有挂号记录
            registrationRepository.findByPatientId(patient.getId()).forEach(registration -> {
                // 先删除该挂号记录的所有病历
                medicalRecordRepository.findByRegistrationId(registration.getId()).forEach(medicalRecord -> {
                    medicalRecordRepository.delete(medicalRecord);
                });
                // 再删除挂号记录
                registrationRepository.delete(registration);
            });
            // 删除患者记录
            patientRepository.delete(patient);
        });
        
        // 最后删除User记录
        userRepository.deleteById(id);
    }
}
