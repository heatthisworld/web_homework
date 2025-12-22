package com.hospital.model;

import lombok.Data;

import java.util.List;

@Data
public class AdminStatsResponse {
    private long totalUsers;
    private long totalDoctors;
    private long totalPatients;
    private long totalDiseases;
    private long departmentCount;
    private long todayRegistrations;
    private long monthRegistrations;
    private List<DepartmentStat> registrationByDepartment;
    private List<RecentRegistrationDto> recentRegistrations;

    @Data
    public static class DepartmentStat {
        private String department;
        private long count;
    }
}
