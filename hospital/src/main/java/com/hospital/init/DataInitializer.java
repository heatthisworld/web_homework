package com.hospital.init;

import com.github.javafaker.Faker;
import com.hospital.entity.*;
import com.hospital.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DiseaseRepository diseaseRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Faker faker = new Faker(new Locale("zh-CN"));
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        // 检查是否已有数据，如果有则跳过初始化
        if (userRepository.count() > 0) {
            System.out.println("数据库中已有数据，跳过数据初始化");
            return;
        }

        System.out.println("开始初始化测试数据...");

        // 1. 创建管理员用户
        createAdminUser();

        // 2. 创建疾病数据
        List<Disease> diseases = createDiseases();

        // 3. 创建医生数据
        List<Doctor> doctors = createDoctors();

        // 4. 创建患者数据
        List<Patient> patients = createPatients();

        // 5. 创建挂号数据
        createRegistrations(patients, doctors, diseases);

        System.out.println("测试数据初始化完成！");
    }

    private void createAdminUser() {
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(User.Role.ADMIN);
        userRepository.save(admin);
        System.out.println("创建管理员用户: admin/admin123");
    }

    private List<Disease> createDiseases() {
        List<Disease> diseases = new ArrayList<>();
        String[] departments = {"内科", "外科", "儿科", "妇产科", "眼科", "耳鼻喉科", "皮肤科", "口腔科"};

        // 为每个科室创建2种疾病
        for (String department : departments) {
            for (int i = 0; i < 2; i++) {
                Disease disease = new Disease();
                disease.setName(faker.medical().diseaseName());
                disease.setDescription(faker.lorem().paragraph());
                disease.setDepartment(department);
                diseases.add(diseaseRepository.save(disease));
            }
        }

        System.out.println("创建了 " + diseases.size() + " 种疾病数据");
        return diseases;
    }

    private List<Doctor> createDoctors() {
        List<Doctor> doctors = new ArrayList<>();
        String[] departments = {"内科", "外科", "儿科", "妇产科", "眼科", "耳鼻喉科", "皮肤科", "口腔科"};
        String[] titles = {"主任医师", "副主任医师", "主治医师", "住院医师"};

        // 创建10个医生
        for (int i = 0; i < 10; i++) {
            // 创建医生用户
            User user = new User();
            user.setUsername("doctor" + (i + 1));
            user.setPassword(passwordEncoder.encode("doctor123"));
            user.setRole(User.Role.DOCTOR);
            userRepository.save(user);

            // 创建医生信息
            Doctor doctor = new Doctor();
            doctor.setUser(user);
            doctor.setName(faker.name().fullName());
            doctor.setGender(random.nextBoolean() ? Doctor.Gender.MALE : Doctor.Gender.FEMALE);
            doctor.setTitle(titles[random.nextInt(titles.length)]);
            doctor.setPhone(faker.phoneNumber().cellPhone());
            doctor.setDepartment(departments[random.nextInt(departments.length)]);
            doctors.add(doctorRepository.save(doctor));
        }

        System.out.println("创建了 " + doctors.size() + " 个医生数据");
        return doctors;
    }

    private List<Patient> createPatients() {
        List<Patient> patients = new ArrayList<>();

        // 创建20个患者
        for (int i = 0; i < 20; i++) {
            // 创建患者用户
            User user = new User();
            user.setUsername("patient" + (i + 1));
            user.setPassword(passwordEncoder.encode("patient123"));
            user.setRole(User.Role.PATIENT);
            userRepository.save(user);

            // 创建患者信息
            Patient patient = new Patient();
            patient.setUser(user);
            patient.setName(faker.name().fullName());
            patient.setGender(random.nextBoolean() ? Patient.Gender.MALE : Patient.Gender.FEMALE);
            patient.setAge(random.nextInt(80) + 18); // 18-98岁
            patient.setIdCard(faker.idNumber().valid());
            patient.setPhone(faker.phoneNumber().cellPhone());
            patient.setAddress(faker.address().fullAddress());
            patients.add(patientRepository.save(patient));
        }

        System.out.println("创建了 " + patients.size() + " 个患者数据");
        return patients;
    }

    private void createRegistrations(List<Patient> patients, List<Doctor> doctors, List<Disease> diseases) {
        List<Registration> registrations = new ArrayList<>();

        // 为每个患者创建2-5个挂号记录
        for (Patient patient : patients) {
            int registrationCount = random.nextInt(4) + 2; // 2-5个挂号记录
            
            for (int i = 0; i < registrationCount; i++) {
                // 随机选择医生和疾病
                Doctor doctor = doctors.get(random.nextInt(doctors.size()));
                Disease disease = diseases.get(random.nextInt(diseases.size()));

                // 创建挂号记录
                Registration registration = new Registration();
                registration.setPatient(patient);
                registration.setDoctor(doctor);
                registration.setDisease(disease);
                // 随机生成未来1个月内的预约时间
                registration.setAppointmentTime(LocalDateTime.now().plusDays(random.nextInt(30)).plusHours(random.nextInt(8) + 8));
                
                // 随机设置状态
                int statusIndex = random.nextInt(3);
                registration.setStatus(Registration.Status.values()[statusIndex]);
                
                registrations.add(registrationRepository.save(registration));
            }
        }

        System.out.println("创建了 " + registrations.size() + " 个挂号记录");
    }
}
