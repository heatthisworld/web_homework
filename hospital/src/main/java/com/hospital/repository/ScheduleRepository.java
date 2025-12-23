package com.hospital.repository;

import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDoctor(Doctor doctor);
    List<Schedule> findByDepartment(Department department);
    List<Schedule> findByWorkDate(LocalDate workDate);
}
