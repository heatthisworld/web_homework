# 医院管理系统 API 文档

## 1. 认证 API (AuthController)

### 1.1 用户登录
- **端点**: `POST /api/auth/login`
- **方法**: `POST`
- **描述**: 用户登录并获取 JWT 令牌
- **请求体**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **响应**:
  ```json
  {
    "token": "string",
    "username": "string",
    "role": "string"  // DOCTOR, PATIENT, ADMIN
  }
  ```

## 2. 用户 API (UserController)

### 2.1 获取所有用户
- **端点**: `GET /api/users`
- **方法**: `GET`
- **描述**: 获取系统中所有用户
- **响应**:
  ```json
  [
    {
      "id": 1,
      "username": "admin",
      "password": "$2a$10$...",  // 加密后的密码
      "role": "ADMIN",
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    }
  ]
  ```

### 2.2 根据ID获取用户
- **端点**: `GET /api/users/{id}`
- **方法**: `GET`
- **描述**: 根据用户ID获取用户信息
- **参数**: `id` (路径参数，用户ID)
- **响应**:
  ```json
  {
    "id": 1,
    "username": "admin",
    "password": "$2a$10$...",
    "role": "ADMIN",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00"
  }
  ```

### 2.3 根据用户名获取用户
- **端点**: `GET /api/users/username/{username}`
- **方法**: `GET`
- **描述**: 根据用户名获取用户信息
- **参数**: `username` (路径参数，用户名)
- **响应**:
  ```json
  {
    "id": 1,
    "username": "admin",
    "password": "$2a$10$...",
    "role": "ADMIN",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00"
  }
  ```

### 2.4 创建用户
- **端点**: `POST /api/users`
- **方法**: `POST`
- **描述**: 创建新用户
- **请求体**:
  ```json
  {
    "username": "newuser",
    "password": "password123",
    "role": "PATIENT"
  }
  ```
- **响应**:
  ```json
  {
    "id": 2,
    "username": "newuser",
    "password": "$2a$10$...",
    "role": "PATIENT",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00"
  }
  ```

### 2.5 更新用户
- **端点**: `PUT /api/users/{id}`
- **方法**: `PUT`
- **描述**: 更新用户信息
- **参数**: `id` (路径参数，用户ID)
- **请求体**:
  ```json
  {
    "username": "updateduser",
    "password": "newpassword123",
    "role": "DOCTOR"
  }
  ```
- **响应**:
  ```json
  {
    "id": 2,
    "username": "updateduser",
    "password": "$2a$10$...",
    "role": "DOCTOR",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-02T00:00:00"
  }
  ```

### 2.6 删除用户
- **端点**: `DELETE /api/users/{id}`
- **方法**: `DELETE`
- **描述**: 删除用户
- **参数**: `id` (路径参数，用户ID)
- **响应**: `204 No Content`

## 3. 医生 API (DoctorController)

### 3.1 获取所有医生
- **端点**: `GET /api/doctors`
- **方法**: `GET`
- **描述**: 获取所有医生信息
- **响应**:
  ```json
  [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "doctor1",
        "role": "DOCTOR"
      },
      "name": "张医生",
      "gender": "MALE",
      "title": "主任医师",
      "phone": "13800138000",
      "department": "内科",
      "diseases": [],
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    }
  ]
  ```

### 3.2 根据ID获取医生
- **端点**: `GET /api/doctors/{id}`
- **方法**: `GET`
- **描述**: 根据医生ID获取医生信息
- **参数**: `id` (路径参数，医生ID)
- **响应**:
  ```json
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "doctor1",
      "role": "DOCTOR"
    },
    "name": "张医生",
    "gender": "MALE",
    "title": "主任医师",
    "phone": "13800138000",
    "department": "内科",
    "diseases": [],
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00"
  }
  ```

### 3.3 根据用户ID获取医生
- **端点**: `GET /api/doctors/user/{userId}`
- **方法**: `GET`
- **描述**: 根据用户ID获取医生信息
- **参数**: `userId` (路径参数，用户ID)
- **响应**:
  ```json
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "doctor1",
      "role": "DOCTOR"
    },
    "name": "张医生",
    "gender": "MALE",
    "title": "主任医师",
    "phone": "13800138000",
    "department": "内科",
    "diseases": [],
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00"
  }
  ```

### 3.4 根据科室获取医生
- **端点**: `GET /api/doctors/department/{department}`
- **方法**: `GET`
- **描述**: 获取指定科室的所有医生
- **参数**: `department` (路径参数，科室名称)
- **响应**:
  ```json
  [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "doctor1",
        "role": "DOCTOR"
      },
      "name": "张医生",
      "gender": "MALE",
      "title": "主任医师",
      "phone": "13800138000",
      "department": "内科",
      "diseases": [],
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    }
  ]
  ```

### 3.5 搜索医生
- **端点**: `GET /api/doctors/search?name=string`
- **方法**: `GET`
- **描述**: 根据名称搜索医生
- **参数**: `name` (查询参数，医生名称)
- **响应**:
  ```json
  [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "doctor1",
        "role": "DOCTOR"
      },
      "name": "张医生",
      "gender": "MALE",
      "title": "主任医师",
      "phone": "13800138000",
      "department": "内科",
      "diseases": [],
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    }
  ]
  ```

### 3.6 创建医生
- **端点**: `POST /api/doctors`
- **方法**: `POST`
- **描述**: 创建新医生
- **请求体**:
  ```json
  {
    "user": {
      "id": 1
    },
    "name": "李医生",
    "gender": "FEMALE",
    "title": "副主任医师",
    "phone": "13900139000",
    "department": "外科",
    "diseases": []
  }
  ```
- **响应**:
  ```json
  {
    "id": 2,
    "user": {
      "id": 1,
      "username": "doctor2",
      "role": "DOCTOR"
    },
    "name": "李医生",
    "gender": "FEMALE",
    "title": "副主任医师",
    "phone": "13900139000",
    "department": "外科",
    "diseases": [],
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00"
  }
  ```

### 3.7 更新医生
- **端点**: `PUT /api/doctors/{id}`
- **方法**: `PUT`
- **描述**: 更新医生信息
- **参数**: `id` (路径参数，医生ID)
- **请求体**:
  ```json
  {
    "name": "李医生",
    "gender": "FEMALE",
    "title": "主任医师",
    "phone": "13900139000",
    "department": "外科",
    "diseases": []
  }
  ```
- **响应**:
  ```json
  {
    "id": 2,
    "user": {
      "id": 1,
      "username": "doctor2",
      "role": "DOCTOR"
    },
    "name": "李医生",
    "gender": "FEMALE",
    "title": "主任医师",
    "phone": "13900139000",
    "department": "外科",
    "diseases": [],
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-02T00:00:00"
  }
  ```

### 3.8 删除医生
- **端点**: `DELETE /api/doctors/{id}`
- **方法**: `DELETE`
- **描述**: 删除医生
- **参数**: `id` (路径参数，医生ID)
- **响应**: `204 No Content`

### 3.9 为医生添加擅长疾病
- **端点**: `POST /api/doctors/{id}/diseases?diseaseId=long`
- **方法**: `POST`
- **描述**: 为医生添加擅长疾病
- **参数**: `id` (路径参数，医生ID), `diseaseId` (查询参数，疾病ID)
- **响应**:
  ```json
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "doctor1",
      "role": "DOCTOR"
    },
    "name": "张医生",
    "gender": "MALE",
    "title": "主任医师",
    "phone": "13800138000",
    "department": "内科",
    "diseases": [
      {
        "id": 1,
        "name": "高血压",
        "department": "内科"
      }
    ],
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-02T00:00:00"
  }
  ```

### 3.10 从医生移除擅长疾病
- **端点**: `DELETE /api/doctors/{id}/diseases/{diseaseId}`
- **方法**: `DELETE`
- **描述**: 从医生移除擅长疾病
- **参数**: `id` (路径参数，医生ID), `diseaseId` (路径参数，疾病ID)
- **响应**:
  ```json
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "doctor1",
      "role": "DOCTOR"
    },
    "name": "张医生",
    "gender": "MALE",
    "title": "主任医师",
    "phone": "13800138000",
    "department": "内科",
    "diseases": [],
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-02T00:00:00"
  }
  ```

### 3.11 获取医生擅长疾病
- **端点**: `GET /api/doctors/{id}/diseases`
- **方法**: `GET`
- **描述**: 获取医生擅长的所有疾病
- **参数**: `id` (路径参数，医生ID)
- **响应**:
  ```json
  [
    {
      "id": 1,
      "name": "高血压",
      "department": "内科"
    },
    {
      "id": 2,
      "name": "糖尿病",
      "department": "内科"
    }
  ]
  ```

## 4. 患者 API (PatientController)

### 4.1 获取所有患者
- **端点**: `GET /api/patients`
- **方法**: `GET`
- **描述**: 获取所有患者信息
- **响应**:
  ```json
  [
    {
      "id": 1,
      "user": {
        "id": 2,
        "username": "patient1",
        "role": "PATIENT"
      },
      "name": "王患者",
      "gender": "MALE",
      "age": 30,
      "idCard": "110101199001011234",
      "phone": "13800138001",
      "address": "北京市朝阳区",
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    }
  ]
  ```

### 4.2 根据ID获取患者
- **端点**: `GET /api/patients/{id}`
- **方法**: `GET`
- **描述**: 根据患者ID获取患者信息
- **参数**: `id` (路径参数，患者ID)
- **响应**:
  ```json
  {
    "id": 1,
    "user": {
      "id": 2,
      "username": "patient1",
      "role": "PATIENT"
    },
    "name": "王患者",
    "gender": "MALE",
    "age": 30,
    "idCard": "110101199001011234",
    "phone": "13800138001",
    "address": "北京市朝阳区",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00"
  }
  ```

### 4.3 根据用户ID获取患者
- **端点**: `GET /api/patients/user/{userId}`
- **方法**: `GET`
- **描述**: 根据用户ID获取患者信息
- **参数**: `userId` (路径参数，用户ID)
- **响应**:
  ```json
  {
    "id": 1,
    "user": {
      "id": 2,
      "username": "patient1",
      "role": "PATIENT"
    },
    "name": "王患者",
    "gender": "MALE",
    "age": 30,
    "idCard": "110101199001011234",
    "phone": "13800138001",
    "address": "北京市朝阳区",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00"
  }
  ```

### 4.4 搜索患者
- **端点**: `GET /api/patients/search?name=string`
- **方法**: `GET`
- **描述**: 根据名称搜索患者
- **参数**: `name` (查询参数，患者名称)
- **响应**:
  ```json
  [
    {
      "id": 1,
      "user": {
        "id": 2,
        "username": "patient1",
        "role": "PATIENT"
      },
      "name": "王患者",
      "gender": "MALE",
      "age": 30,
      "idCard": "110101199001011234",
      "phone": "13800138001",
      "address": "北京市朝阳区",
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    }
  ]
  ```

### 4.5 创建患者
- **端点**: `POST /api/patients`
- **方法**: `POST`
- **描述**: 创建新患者
- **请求体**:
  ```json
  {
    "user": {
      "id": 2
    },
    "name": "李患者",
    "gender": "FEMALE",
    "age": 25,
    "idCard": "110101199501011234",
    "phone": "13800138002",
    "address": "北京市海淀区"
  }
  ```
- **响应**:
  ```json
  {
    "id": 2,
    "user": {
      "id": 2,
      "username": "patient2",
      "role": "PATIENT"
    },
    "name": "李患者",
    "gender": "FEMALE",
    "age": 25,
    "idCard": "110101199501011234",
    "phone": "13800138002",
    "address": "北京市海淀区",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00"
  }
  ```

### 4.6 更新患者
- **端点**: `PUT /api/patients/{id}`
- **方法**: `PUT`
- **描述**: 更新患者信息
- **参数**: `id` (路径参数，患者ID)
- **请求体**:
  ```json
  {
    "name": "李患者",
    "gender": "FEMALE",
    "age": 26,
    "idCard": "110101199501011234",
    "phone": "13800138002",
    "address": "北京市海淀区中关村"
  }
  ```
- **响应**:
  ```json
  {
    "id": 2,
    "user": {
      "id": 2,
      "username": "patient2",
      "role": "PATIENT"
    },
    "name": "李患者",
    "gender": "FEMALE",
    "age": 26,
    "idCard": "110101199501011234",
    "phone": "13800138002",
    "address": "北京市海淀区中关村",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-02T00:00:00"
  }
  ```

### 4.7 删除患者
- **端点**: `DELETE /api/patients/{id}`
- **方法**: `DELETE`
- **描述**: 删除患者
- **参数**: `id` (路径参数，患者ID)
- **响应**: `204 No Content`

## 5. 疾病 API (DiseaseController)

### 5.1 获取所有疾病
- **端点**: `GET /api/diseases`
- **方法**: `GET`
- **描述**: 获取所有疾病信息
- **响应**:
  ```json
  [
    {
      "id": 1,
      "name": "高血压",
      "description": "血压持续升高的慢性疾病",
      "department": "内科",
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    },
    {
      "id": 2,
      "name": "糖尿病",
      "description": "血糖升高的慢性疾病",
      "department": "内科",
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    }
  ]
  ```

### 5.2 根据ID获取疾病
- **端点**: `GET /api/diseases/{id}`
- **方法**: `GET`
- **描述**: 根据疾病ID获取疾病信息
- **参数**: `id` (路径参数，疾病ID)
- **响应**:
  ```json
  {
    "id": 1,
    "name": "高血压",
    "description": "血压持续升高的慢性疾病",
    "department": "内科",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00"
  }
  ```

### 5.3 根据科室获取疾病
- **端点**: `GET /api/diseases/department/{department}`
- **方法**: `GET`
- **描述**: 获取指定科室的所有疾病
- **参数**: `department` (路径参数，科室名称)
- **响应**:
  ```json
  [
    {
      "id": 1,
      "name": "高血压",
      "description": "血压持续升高的慢性疾病",
      "department": "内科",
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    },
    {
      "id": 2,
      "name": "糖尿病",
      "description": "血糖升高的慢性疾病",
      "department": "内科",
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    }
  ]
  ```

### 5.4 搜索疾病
- **端点**: `GET /api/diseases/search?name=string`
- **方法**: `GET`
- **描述**: 根据名称搜索疾病
- **参数**: `name` (查询参数，疾病名称)
- **响应**:
  ```json
  [
    {
      "id": 1,
      "name": "高血压",
      "description": "血压持续升高的慢性疾病",
      "department": "内科",
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    }
  ]
  ```

### 5.5 创建疾病
- **端点**: `POST /api/diseases`
- **方法**: `POST`
- **描述**: 创建新疾病
- **请求体**:
  ```json
  {
    "name": "冠心病",
    "description": "冠状动脉粥样硬化性心脏病",
    "department": "内科"
  }
  ```
- **响应**:
  ```json
  {
    "id": 3,
    "name": "冠心病",
    "description": "冠状动脉粥样硬化性心脏病",
    "department": "内科",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00"
  }
  ```

### 5.6 更新疾病
- **端点**: `PUT /api/diseases/{id}`
- **方法**: `PUT`
- **描述**: 更新疾病信息
- **参数**: `id` (路径参数，疾病ID)
- **请求体**:
  ```json
  {
    "name": "高血压",
    "description": "以体循环动脉血压增高为主要特征的疾病",
    "department": "内科"
  }
  ```
- **响应**:
  ```json
  {
    "id": 1,
    "name": "高血压",
    "description": "以体循环动脉血压增高为主要特征的疾病",
    "department": "内科",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-02T00:00:00"
  }
  ```

### 5.7 删除疾病
- **端点**: `DELETE /api/diseases/{id}`
- **方法**: `DELETE`
- **描述**: 删除疾病
- **参数**: `id` (路径参数，疾病ID)
- **响应**: `204 No Content`

## 6. 挂号 API (RegistrationController)

### 6.1 获取所有挂号
- **端点**: `GET /api/registrations`
- **方法**: `GET`
- **描述**: 获取所有挂号信息
- **响应**:
  ```json
  [
    {
      "id": 1,
      "patient": {
        "id": 1,
        "name": "王患者"
      },
      "doctor": {
        "id": 1,
        "name": "张医生"
      },
      "disease": {
        "id": 1,
        "name": "高血压"
      },
      "registrationTime": "2023-01-01T08:00:00",
      "appointmentTime": "2023-01-01T09:00:00",
      "status": "REGISTERED",
      "createdAt": "2023-01-01T08:00:00",
      "updatedAt": "2023-01-01T08:00:00"
    }
  ]
  ```

### 6.2 根据ID获取挂号
- **端点**: `GET /api/registrations/{id}`
- **方法**: `GET`
- **描述**: 根据挂号ID获取挂号信息
- **参数**: `id` (路径参数，挂号ID)
- **响应**:
  ```json
  {
    "id": 1,
    "patient": {
      "id": 1,
      "name": "王患者"
    },
    "doctor": {
      "id": 1,
      "name": "张医生"
    },
    "disease": {
      "id": 1,
      "name": "高血压"
    },
    "registrationTime": "2023-01-01T08:00:00",
    "appointmentTime": "2023-01-01T09:00:00",
    "status": "REGISTERED",
    "createdAt": "2023-01-01T08:00:00",
    "updatedAt": "2023-01-01T08:00:00"
  }
  ```

### 6.3 根据患者ID获取挂号
- **端点**: `GET /api/registrations/patient/{patientId}`
- **方法**: `GET`
- **描述**: 获取指定患者的所有挂号
- **参数**: `patientId` (路径参数，患者ID)
- **响应**:
  ```json
  [
    {
      "id": 1,
      "patient": {
        "id": 1,
        "name": "王患者"
      },
      "doctor": {
        "id": 1,
        "name": "张医生"
      },
      "disease": {
        "id": 1,
        "name": "高血压"
      },
      "registrationTime": "2023-01-01T08:00:00",
      "appointmentTime": "2023-01-01T09:00:00",
      "status": "REGISTERED",
      "createdAt": "2023-01-01T08:00:00",
      "updatedAt": "2023-01-01T08:00:00"
    }
  ]
  ```

### 6.4 根据医生ID获取挂号
- **端点**: `GET /api/registrations/doctor/{doctorId}`
- **方法**: `GET`
- **描述**: 获取指定医生的所有挂号
- **参数**: `doctorId` (路径参数，医生ID)
- **响应**:
  ```json
  [
    {
      "id": 1,
      "patient": {
        "id": 1,
        "name": "王患者"
      },
      "doctor": {
        "id": 1,
        "name": "张医生"
      },
      "disease": {
        "id": 1,
        "name": "高血压"
      },
      "registrationTime": "2023-01-01T08:00:00",
      "appointmentTime": "2023-01-01T09:00:00",
      "status": "REGISTERED",
      "createdAt": "2023-01-01T08:00:00",
      "updatedAt": "2023-01-01T08:00:00"
    }
  ]
  ```

### 6.5 根据疾病ID获取挂号
- **端点**: `GET /api/registrations/disease/{diseaseId}`
- **方法**: `GET`
- **描述**: 获取指定疾病的所有挂号
- **参数**: `diseaseId` (路径参数，疾病ID)
- **响应**:
  ```json
  [
    {
      "id": 1,
      "patient": {
        "id": 1,
        "name": "王患者"
      },
      "doctor": {
        "id": 1,
        "name": "张医生"
      },
      "disease": {
        "id": 1,
        "name": "高血压"
      },
      "registrationTime": "2023-01-01T08:00:00",
      "appointmentTime": "2023-01-01T09:00:00",
      "status": "REGISTERED",
      "createdAt": "2023-01-01T08:00:00",
      "updatedAt": "2023-01-01T08:00:00"
    }
  ]
  ```

### 6.6 根据状态获取挂号
- **端点**: `GET /api/registrations/status/{status}`
- **方法**: `GET`
- **描述**: 获取指定状态的所有挂号
- **参数**: `status` (路径参数，挂号状态：REGISTERED, CONSULTED, CANCELLED)
- **响应**:
  ```json
  [
    {
      "id": 1,
      "patient": {
        "id": 1,
        "name": "王患者"
      },
      "doctor": {
        "id": 1,
        "name": "张医生"
      },
      "disease": {
        "id": 1,
        "name": "高血压"
      },
      "registrationTime": "2023-01-01T08:00:00",
      "appointmentTime": "2023-01-01T09:00:00",
      "status": "REGISTERED",
      "createdAt": "2023-01-01T08:00:00",
      "updatedAt": "2023-01-01T08:00:00"
    }
  ]
  ```

### 6.7 根据患者和状态获取挂号
- **端点**: `GET /api/registrations/patient/{patientId}/status/{status}`
- **方法**: `GET`
- **描述**: 获取指定患者指定状态的所有挂号
- **参数**: `patientId` (路径参数，患者ID), `status` (路径参数，挂号状态)
- **响应**:
  ```json
  [
    {
      "id": 1,
      "patient": {
        "id": 1,
        "name": "王患者"
      },
      "doctor": {
        "id": 1,
        "name": "张医生"
      },
      "disease": {
        "id": 1,
        "name": "高血压"
      },
      "registrationTime": "2023-01-01T08:00:00",
      "appointmentTime": "2023-01-01T09:00:00",
      "status": "REGISTERED",
      "createdAt": "2023-01-01T08:00:00",
      "updatedAt": "2023-01-01T08:00:00"
    }
  ]
  ```

### 6.8 根据时间范围获取挂号
- **端点**: `GET /api/registrations/time?start=datetime&end=datetime`
- **方法**: `GET`
- **描述**: 获取指定时间范围内的所有挂号
- **参数**: 
  - `start` (查询参数，开始时间，格式：ISO 8601)
  - `end` (查询参数，结束时间，格式：ISO 8601)
- **请求示例**: `GET /api/registrations/time?start=2023-01-01T08:00:00&end=2023-01-01T10:00:00`
- **响应**:
  ```json
  [
    {
      "id": 1,
      "patient": {
        "id": 1,
        "name": "王患者"
      },
      "doctor": {
        "id": 1,
        "name": "张医生"
      },
      "disease": {
        "id": 1,
        "name": "高血压"
      },
      "registrationTime": "2023-01-01T08:00:00",
      "appointmentTime": "2023-01-01T09:00:00",
      "status": "REGISTERED",
      "createdAt": "2023-01-01T08:00:00",
      "updatedAt": "2023-01-01T08:00:00"
    }
  ]
  ```

### 6.9 创建挂号
- **端点**: `POST /api/registrations`
- **方法**: `POST`
- **描述**: 创建新挂号
- **请求体**:
  ```json
  {
    "patient": {
      "id": 1
    },
    "doctor": {
      "id": 1
    },
    "disease": {
      "id": 1
    },
    "appointmentTime": "2023-01-01T10:00:00"
  }
  ```
- **响应**:
  ```json
  {
    "id": 2,
    "patient": {
      "id": 1,
      "name": "王患者"
    },
    "doctor": {
      "id": 1,
      "name": "张医生"
    },
    "disease": {
      "id": 1,
      "name": "高血压"
    },
    "registrationTime": "2023-01-01T08:30:00",
    "appointmentTime": "2023-01-01T10:00:00",
    "status": "REGISTERED",
    "createdAt": "2023-01-01T08:30:00",
    "updatedAt": "2023-01-01T08:30:00"
  }
  ```

### 6.10 更新挂号
- **端点**: `PUT /api/registrations/{id}`
- **方法**: `PUT`
- **描述**: 更新挂号信息
- **参数**: `id` (路径参数，挂号ID)
- **请求体**:
  ```json
  {
    "patient": {
      "id": 1
    },
    "doctor": {
      "id": 1
    },
    "disease": {
      "id": 1
    },
    "appointmentTime": "2023-01-01T11:00:00",
    "status": "CONSULTED"
  }
  ```
- **响应**:
  ```json
  {
    "id": 2,
    "patient": {
      "id": 1,
      "name": "王患者"
    },
    "doctor": {
      "id": 1,
      "name": "张医生"
    },
    "disease": {
      "id": 1,
      "name": "高血压"
    },
    "registrationTime": "2023-01-01T08:30:00",
    "appointmentTime": "2023-01-01T11:00:00",
    "status": "CONSULTED",
    "createdAt": "2023-01-01T08:30:00",
    "updatedAt": "2023-01-01T09:00:00"
  }
  ```

### 6.11 更新挂号状态
- **端点**: `PUT /api/registrations/{id}/status/{status}`
- **方法**: `PUT`
- **描述**: 更新挂号状态
- **参数**: `id` (路径参数，挂号ID), `status` (路径参数，挂号状态)
- **响应**:
  ```json
  {
    "id": 2,
    "patient": {
      "id": 1,
      "name": "王患者"
    },
    "doctor": {
      "id": 1,
      "name": "张医生"
    },
    "disease": {
      "id": 1,
      "name": "高血压"
    },
    "registrationTime": "2023-01-01T08:30:00",
    "appointmentTime": "2023-01-01T11:00:00",
    "status": "CANCELLED",
    "createdAt": "2023-01-01T08:30:00",
    "updatedAt": "2023-01-01T09:30:00"
  }
  ```

### 6.12 删除挂号
- **端点**: `DELETE /api/registrations/{id}`
- **方法**: `DELETE`
- **描述**: 删除挂号
- **参数**: `id` (路径参数，挂号ID)
- **响应**: `204 No Content`

## 7. 数据类型说明

### 7.1 枚举类型

#### 用户角色 (Role)
- `DOCTOR`: 医生
- `PATIENT`: 患者
- `ADMIN`: 管理员

#### 性别 (Gender)
- `MALE`: 男
- `FEMALE`: 女

#### 挂号状态 (Status)
- `REGISTERED`: 已挂号
- `CONSULTED`: 已就诊
- `CANCELLED`: 已取消

### 7.2 日期时间格式
- 使用 ISO 8601 格式: `YYYY-MM-DDTHH:mm:ss`
- 示例: `2023-01-01T08:00:00`

## 8. 认证与授权

- 所有 API (除了登录) 都需要在请求头中包含 JWT 令牌
- 请求头格式: `Authorization: Bearer <token>`
- 不同角色的用户可能有不同的 API 访问权限

## 9. 错误处理

- 400 Bad Request: 请求参数错误
- 401 Unauthorized: 未认证或认证失败
- 403 Forbidden: 没有权限访问该资源
- 404 Not Found: 请求的资源不存在
- 500 Internal Server Error: 服务器内部错误