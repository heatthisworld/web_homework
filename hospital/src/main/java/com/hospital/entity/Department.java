package com.hospital.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "department", indexes = {
        @Index(name = "idx_department_code", columnList = "code", unique = true),
        @Index(name = "idx_department_name", columnList = "name", unique = true)
})
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, length = 30)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "lead_name", length = 50)
    private String leadName;

    @Column(name = "rooms")
    private Integer rooms;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status = Status.OPEN;

    @Column(name = "focus", length = 200)
    private String focus;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    @JsonIgnore // 避免序列化时的循环引用
    private List<Doctor> doctors;

    public enum Status {
        OPEN, PAUSED, ADJUSTING
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = Status.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
