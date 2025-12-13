package com.hospital.controller;

import com.hospital.entity.Disease;
import com.hospital.model.Result;
import com.hospital.service.DiseaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/diseases")
public class DiseaseController {

    @Autowired
    private DiseaseService diseaseService;

    @GetMapping
    public Result<List<Disease>> getAllDiseases() {
        return Result.success(diseaseService.getAllDiseases());
    }

    @GetMapping("/{id}")
    public Result<Disease> getDiseaseById(@PathVariable Long id) {
        Optional<Disease> disease = diseaseService.getDiseaseById(id);
        return disease.map(Result::success)
                .orElseGet(() -> Result.error(404, "疾病不存在"));
    }

    @GetMapping("/department/{department}")
    public Result<List<Disease>> getDiseasesByDepartment(@PathVariable String department) {
        return Result.success(diseaseService.getDiseasesByDepartment(department));
    }

    @GetMapping("/search")
    public Result<List<Disease>> searchDiseasesByName(@RequestParam String name) {
        return Result.success(diseaseService.searchDiseasesByName(name));
    }

    @PostMapping
    public Result<Disease> createDisease(@RequestBody Disease disease) {
        Disease createdDisease = diseaseService.createDisease(disease);
        return Result.success(createdDisease);
    }

    @PutMapping("/{id}")
    public Result<Disease> updateDisease(@PathVariable Long id, @RequestBody Disease disease) {
        Disease updatedDisease = diseaseService.updateDisease(id, disease);
        return Result.success(updatedDisease);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteDisease(@PathVariable Long id) {
        diseaseService.deleteDisease(id);
        return Result.success();
    }
}
