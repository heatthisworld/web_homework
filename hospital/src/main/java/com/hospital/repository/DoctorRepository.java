package com.hospital.repository;

import com.hospital.entity.Doctor;
import com.hospital.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
    List<Doctor> findByDepartment(String department);
    List<Doctor> findByNameContaining(String name);
}
