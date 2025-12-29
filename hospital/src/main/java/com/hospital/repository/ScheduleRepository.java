package com.hospital.repository;

import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDoctor(Doctor doctor);
    List<Schedule> findByDepartment(Department department);
    List<Schedule> findByWorkDate(LocalDate workDate);
    
    // 自定义查询方法，使用JOIN FETCH确保关联数据被加载
    @Query("SELECT s FROM Schedule s JOIN FETCH s.doctor JOIN FETCH s.department")
    List<Schedule> findAllWithDetails();
    
    @Query("SELECT s FROM Schedule s JOIN FETCH s.doctor JOIN FETCH s.department WHERE s.id = :id")
    Optional<Schedule> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT s FROM Schedule s JOIN FETCH s.doctor JOIN FETCH s.department WHERE s.workDate = :workDate")
    List<Schedule> findByWorkDateWithDetails(@Param("workDate") LocalDate workDate);
}
