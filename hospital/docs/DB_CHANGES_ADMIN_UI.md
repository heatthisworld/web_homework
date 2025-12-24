# 管理端适配的数据库调整说明

## 新增表
- `department`：`id`, `code`(唯一), `name`(唯一), `lead_name`, `rooms`, `status`(OPEN/PAUSED/ADJUSTING), `focus`, `created_at`, `updated_at`
- `schedule`：`id`, `doctor_id`(FK), `department_id`(FK), `work_date`, `start_time`, `end_time`, `type`(REGULAR/SPECIALIST/EXTRA), `status`(OPEN/RUNNING/FULL/PAUSED), `capacity`, `booked`, `created_at`, `updated_at`
- `announcement`：`id`, `title`, `content`, `status`(DRAFT/PUBLISHED/SCHEDULED), `audience_scope`, `publish_at`, `creator_id`(FK user), `created_at`, `updated_at`

## 修改表
- `user`：新增 `display_name`, `email`(唯一), `phone`(唯一), `status`(ACTIVE/INACTIVE/PENDING), `last_login_at`
- `doctor`：`department` 改为 `department_id` 外键
- `disease`：`department` 改为 `department_id` 外键
- `registration`：新增 `schedule_id` 外键，新增 `type`(REGULAR/SPECIALIST/EXTRA), `channel`(ONLINE/OFFLINE), `fee`, `payment_status`(UNPAID/PAID/REFUNDED), `notes`，状态集改为 WAITING/CONFIRMED/COMPLETED/CANCELLED

## 主要关系
- Doctor 1..n → Department
- Disease 1..n → Department
- Schedule n..1 → Doctor, Department
- Registration n..1 → Patient, Doctor, Disease，可选 → Schedule
- Announcement n..1 → User(creator)

## 现有实现位置
- 实体：`src/main/java/com/hospital/entity/{Department,Schedule,Announcement,User,Doctor,Disease,Registration}.java`
- 仓库：`src/main/java/com/hospital/repository/{DepartmentRepository,ScheduleRepository,AnnouncementRepository,...}.java`
- 初始化数据：`src/main/java/com/hospital/init/DataInitializer.java`（支持 `--force-init` 清库重建模拟数据）
