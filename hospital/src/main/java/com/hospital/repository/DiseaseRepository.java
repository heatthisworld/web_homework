package com.hospital.repository;

import com.hospital.entity.Disease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiseaseRepository extends JpaRepository<Disease, Long> {
    List<Disease> findByDepartment(String department);
    List<Disease> findByNameContaining(String name);
}
