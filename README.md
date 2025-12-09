# 医院管理系统后端

## 1. 项目简介

医院管理系统后端是一个基于Spring Boot的Web应用，提供了医院管理所需的核心功能，包括用户认证、医生管理、患者管理、疾病管理和挂号管理等。

## 2. 技术栈

- **框架**: Spring Boot 3.2.x
- **ORM**: Spring Data JPA
- **数据库**: MySQL 8.0
- **认证**: Spring Security + JWT
- **构建工具**: Maven
- **开发语言**: Java 17+
- **容器化**: Docker

## 3. 环境要求

- Java 17 或更高版本
- Maven 3.6 或更高版本
- Docker 20.10 或更高版本（用于运行MySQL容器）

## 4. 项目结构

```
hospital/
├── docs/                # 文档目录
│   ├── API_DOCUMENTATION.md    # API文档
│   └── database_design.md      # 数据库设计文档
├── src/
│   ├── main/
│   │   ├── java/com/hospital/  # 源代码
│   │   │   ├── controller/     # 控制器层
│   │   │   ├── entity/         # 实体类
│   │   │   ├── model/          # 数据模型
│   │   │   ├── repository/     # 数据访问层
│   │   │   ├── service/        # 业务逻辑层
│   │   │   ├── util/           # 工具类
│   │   │   └── HospitalApplication.java  # 应用入口
│   │   └── resources/          # 资源文件
│   │       ├── application.properties  # 配置文件
│   │       └── static/         # 静态资源
│   └── test/                   # 测试代码
├── .gitignore
├── mvnw
├── mvnw.cmd
├── pom.xml
└── README.md
```

## 5. 配置步骤

### 5.1 克隆项目

```bash
git clone <repository-url>
cd hospital
```

### 5.2 配置数据库

使用Docker创建MySQL容器：

```bash
docker run -d --name hospital-mysql -p 3307:3306 -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=hospital mysql:8.0
```

**参数说明**：
- `--name hospital-mysql`: 容器名称
- `-p 3307:3306`: 将容器的3306端口映射到主机的3307端口
- `-e MYSQL_ROOT_PASSWORD=123456`: 设置MySQL root用户密码
- `-e MYSQL_DATABASE=hospital`: 创建名为hospital的数据库
- `mysql:8.0`: 使用MySQL 8.0镜像

### 5.3 修改数据库连接配置

编辑`src/main/resources/application.properties`文件：

```properties
# 数据库连接配置
spring.datasource.url=jdbc:mysql://localhost:3307/hospital?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=123456
```

### 5.4 初始化数据库表

项目使用Spring Data JPA的自动建表功能，启动时会自动创建所需的数据库表。

## 6. 运行项目

### 6.1 编译项目

```bash
mvn clean compile
```

### 6.2 运行项目

```bash
mvn spring-boot:run
```

或者使用Java命令运行编译后的jar包：

```bash
mvn clean package
java -jar target/hospital-0.0.1-SNAPSHOT.jar
```

### 6.3 验证项目是否启动成功

项目启动后，可以通过以下URL访问：

```
http://localhost:8080
```

如果看到Spring Boot的默认页面或API响应，则说明项目启动成功。

## 7. API文档

项目提供了详细的API文档，位于`docs/API_DOCUMENTATION.md`文件中，包含了所有API的端点、方法、参数和响应格式。

## 8. 数据库设计

数据库设计文档位于`docs/database_design.md`文件中，包含了数据库表结构和关系的详细说明。

## 9. 认证与授权

项目使用JWT进行认证，登录后会获取到JWT令牌，需要在请求头中携带该令牌才能访问受保护的API：

```
Authorization: Bearer <token>
```

## 10. 注意事项

1. **MySQL版本兼容性**：
   - MySQL 8.0默认使用`caching_sha2_password`认证插件，可能与某些客户端不兼容
   - 如果遇到连接问题，可以将root用户的认证插件改为`mysql_native_password`：
     ```sql
     ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
     ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';
     FLUSH PRIVILEGES;
     ```

2. **端口占用**：
   - 如果8080端口被占用，可以在`application.properties`中修改服务器端口：
     ```properties
     server.port=8081
     ```

3. **数据库连接问题**：
   - 确保Docker容器正在运行：`docker ps`
   - 确保数据库连接URL中的端口与Docker映射的端口一致

4. **Maven依赖问题**：
   - 如果遇到依赖下载问题，可以尝试强制更新依赖：
     ```bash
     mvn -U clean compile
     ```

5. **首次运行**：
   - 首次运行时，系统会自动创建数据库表
   - 可以通过API创建初始用户

## 11. 开发说明

- 代码风格：遵循Spring Boot的编码规范
- 日志：使用SLF4J + Logback
- 异常处理：全局异常处理
- 事务管理：使用Spring的声明式事务管理

## 12. 联系方式

如有问题或建议，请通过以下方式联系：
- 项目维护者：[雷**]
- 邮箱：[3255560986.com]
