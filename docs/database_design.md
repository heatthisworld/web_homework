# 医院挂号系统数据库设计

## 1. 项目概述
医院挂号系统是一个用于管理医院挂号业务的信息系统，主要包含病人管理、病种管理、医生管理和挂号管理等功能。系统需要支持医生、就诊人和管理员三种角色。

## 2. 数据库表设计

### 2.1 用户表（user）
用于存储系统用户信息，包括医生、就诊人和管理员。

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(100) | NOT NULL | 密码（加密存储） |
| role | ENUM('DOCTOR', 'PATIENT', 'ADMIN') | NOT NULL | 用户角色 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.2 病人表（patient）
用于存储病人的详细信息。

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 病人ID |
| user_id | BIGINT | FOREIGN KEY REFERENCES user(id), UNIQUE | 关联的用户ID |
| name | VARCHAR(50) | NOT NULL | 病人姓名 |
| gender | ENUM('MALE', 'FEMALE') | NOT NULL | 性别 |
| age | INT | NOT NULL | 年龄 |
| id_card | VARCHAR(18) | UNIQUE, NOT NULL | 身份证号 |
| phone | VARCHAR(11) | NOT NULL | 联系电话 |
| address | VARCHAR(200) | | 家庭地址 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.3 病种表（disease）
用于存储疾病科室信息。

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 病种ID |
| name | VARCHAR(100) | NOT NULL | 病种名称 |
| description | TEXT | | 病种描述 |
| department | VARCHAR(50) | NOT NULL | 所属科室 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.4 医生表（doctor）
用于存储医生信息。

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 医生ID |
| user_id | BIGINT | FOREIGN KEY REFERENCES user(id), UNIQUE | 关联的用户ID |
| name | VARCHAR(50) | NOT NULL | 医生姓名 |
| gender | ENUM('MALE', 'FEMALE') | NOT NULL | 性别 |
| title | VARCHAR(50) | NOT NULL | 职称（如主任医师、副主任医师等） |
| phone | VARCHAR(11) | NOT NULL | 联系电话 |
| department | VARCHAR(50) | NOT NULL | 所属科室 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.5 医生病种关联表（doctor_disease）
用于存储医生和病种的多对多关系（一名医生可以管理1~3个病种）。

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 关联ID |
| doctor_id | BIGINT | FOREIGN KEY REFERENCES doctor(id) | 医生ID |
| disease_id | BIGINT | FOREIGN KEY REFERENCES disease(id) | 病种ID |
| UNIQUE KEY | (doctor_id, disease_id) | | 确保医生和病种的组合唯一 |

### 2.6 挂号表（registration）
用于存储挂号信息（每位病人可以选择1~n个科室）。

| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 挂号ID |
| patient_id | BIGINT | FOREIGN KEY REFERENCES patient(id) | 病人ID |
| doctor_id | BIGINT | FOREIGN KEY REFERENCES doctor(id) | 医生ID |
| disease_id | BIGINT | FOREIGN KEY REFERENCES disease(id) | 病种ID |
| registration_time | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 挂号时间 |
| appointment_time | TIMESTAMP | NOT NULL | 预约就诊时间 |
| status | ENUM('REGISTERED', 'CONSULTED', 'CANCELLED') | DEFAULT 'REGISTERED' | 挂号状态 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

## 3. 数据库关系图

```
+--------+     +---------+
|  user  |     | patient |
+--------+     +---------+
| id     |<----| user_id |
| username|    | name    |
| password|    | gender  |
| role   |    | age     |
+--------+    +---------+
     |
     |
+--------+     +-----------+
| doctor |     | disease   |
+--------+     +-----------+
| id     |<----| id        |
| user_id|    | name      |
| name   |    | department|
| title  |    +-----------+
+--------+          ^
     |              |
     |              |
+------------------------+
|    doctor_disease      |
+------------------------+
| doctor_id | disease_id |
+------------------------+
     |              |
     |              |
+------------------------+
|     registration       |
+------------------------+
| patient_id             |
| doctor_id              |
| disease_id             |
| appointment_time       |
| status                 |
+------------------------+
```

## 4. 索引设计

为了提高查询性能，建议在以下字段上创建索引：

1. 用户表：username（唯一索引）
2. 病人表：user_id（唯一索引）、id_card（唯一索引）、phone（普通索引）
3. 病种表：name（普通索引）、department（普通索引）
4. 医生表：user_id（唯一索引）、name（普通索引）、department（普通索引）
5. 医生病种关联表：doctor_id（普通索引）、disease_id（普通索引）
6. 挂号表：patient_id（普通索引）、doctor_id（普通索引）、disease_id（普通索引）、appointment_time（普通索引）、status（普通索引）

## 5. 数据库配置建议

1. 数据库类型：MySQL 8.0+
2. 字符集：utf8mb4（支持全Unicode字符，包括emoji）
3. 排序规则：utf8mb4_unicode_ci（大小写不敏感）
4. 连接池：使用HikariCP（Spring Boot默认）
5. 事务隔离级别：READ COMMITTED（避免脏读，提供较好的并发性能）

## 6. 可能的拓展功能

1. **预约管理**：支持病人在线预约医生，选择就诊时间
2. **排班管理**：管理医生的排班信息，包括出诊时间、挂号限额等
3. **缴费管理**：实现在线缴费功能
4. **病历管理**：存储和管理病人的病历信息
5. **药品管理**：管理药品信息和处方开具
6. **统计报表**：生成挂号量、科室就诊量等统计报表
7. **短信通知**：挂号成功、就诊提醒等短信通知功能
8. **评价系统**：病人对医生的评价功能
9. **多医院支持**：支持多医院管理，每个医院有独立的医生、科室等信息
10. **移动支付集成**：集成微信支付、支付宝等移动支付功能
