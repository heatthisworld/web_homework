package com.hospital.repository;

import com.hospital.entity.Doctor;
import com.hospital.entity.Department;
import com.hospital.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
    Optional<Doctor> findByUserId(Long userId);
    List<Doctor> findByDepartment(Department department);
    List<Doctor> findByDepartment_Name(String name);
    List<Doctor> findByNameContaining(String name);
}
