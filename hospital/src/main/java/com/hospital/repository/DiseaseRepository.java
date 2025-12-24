package com.hospital.repository;

import com.hospital.entity.Department;
import com.hospital.entity.Disease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiseaseRepository extends JpaRepository<Disease, Long> {
    List<Disease> findByDepartment(Department department);
    List<Disease> findByDepartment_Name(String name);
    List<Disease> findByNameContaining(String name);
}
