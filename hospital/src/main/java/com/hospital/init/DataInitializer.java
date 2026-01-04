package com.hospital.init;

import com.github.javafaker.Faker;
import com.hospital.entity.Announcement;
import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.entity.Disease;
import com.hospital.entity.MedicalRecord;
import com.hospital.entity.Patient;
import com.hospital.entity.Registration;
import com.hospital.entity.Schedule;
import com.hospital.entity.User;
import com.hospital.repository.AnnouncementRepository;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DiseaseRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.MedicalRecordRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.RegistrationRepository;
import com.hospital.repository.ScheduleRepository;
import com.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
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
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Faker faker = new Faker(new Locale("zh-CN"));
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        boolean forceInit = Arrays.asList(args).contains("--force-init");

        if (userRepository.count() > 0 && !forceInit) {
            System.out.println("Database already contains data, skip seeding (use --force-init to reseed).");
            return;
        }

        if (forceInit) {
            clearAllData();
        }

        System.out.println("Seeding demo data for hospital system...");

        createAdminUser();
        List<Department> departments = createDepartments();
        List<Disease> diseases = createDiseases(departments);
        List<Doctor> doctors = createDoctors(departments, diseases);
        List<Patient> patients = createPatients();
        List<Schedule> schedules = createSchedules(doctors);
        List<Registration> registrations = createRegistrations(patients, doctors, diseases, schedules);
        createMedicalRecords(registrations);
        createAnnouncements();

        System.out.println("Demo data ready.");
    }

    private void clearAllData() {
        System.out.println("Clearing existing data...");
        announcementRepository.deleteAll();
        medicalRecordRepository.deleteAll();
        registrationRepository.deleteAll();
        scheduleRepository.deleteAll();
        patientRepository.deleteAll();
        doctorRepository.deleteAll();
        diseaseRepository.deleteAll();
        departmentRepository.deleteAll();
        userRepository.deleteAll();
    }

    private void createAdminUser() {
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(User.Role.ADMIN);
        admin.setDisplayName("系统管理员");
        admin.setEmail("admin@hospital.local");
        admin.setStatus(User.Status.ACTIVE);
        userRepository.save(admin);
        System.out.println("Created admin user admin/admin123");
    }

    private List<Department> createDepartments() {
        List<Department> list = new ArrayList<>();
        String[] names = {"内科", "外科", "儿科", "妇产科", "眼科", "耳鼻喉科", "皮肤科", "口腔科"};
        for (int i = 0; i < names.length; i++) {
            Department dept = new Department();
            dept.setCode("D" + (100 + i));
            dept.setName(names[i]);
            dept.setLeadName(faker.name().fullName());
            dept.setRooms(6 + random.nextInt(6));
            dept.setStatus(Department.Status.OPEN);
            dept.setFocus(faker.lorem().sentence());
            list.add(departmentRepository.save(dept));
        }
        return list;
    }

    private List<Disease> createDiseases(List<Department> departments) {
        List<Disease> diseases = new ArrayList<>();
        for (Department department : departments) {
            for (int i = 0; i < 2; i++) {
                Disease disease = new Disease();
                disease.setName(faker.medical().diseaseName());
                disease.setDescription(faker.lorem().sentence());
                disease.setDepartment(department);
                diseases.add(diseaseRepository.save(disease));
            }
        }
        System.out.println("Created " + diseases.size() + " diseases.");
        return diseases;
    }

    private List<Doctor> createDoctors(List<Department> departments, List<Disease> diseases) {
        List<Doctor> doctors = new ArrayList<>();
        String[] titles = {"主任医师", "副主任医师", "主治医师", "住院医师"};

        for (int i = 0; i < 10; i++) {
            User user = new User();
            user.setUsername("doctor" + (i + 1));
            user.setPassword(passwordEncoder.encode("doctor123"));
            user.setRole(User.Role.DOCTOR);
            user.setDisplayName("医生" + (i + 1));
            user.setEmail("doctor" + (i + 1) + "@hospital.local");
            user.setStatus(User.Status.ACTIVE);
            userRepository.save(user);

            Department department = departments.get(random.nextInt(departments.size()));

            Doctor doctor = new Doctor();
            doctor.setUser(user);
            doctor.setName(faker.name().fullName());
            doctor.setGender(random.nextBoolean() ? Doctor.Gender.MALE : Doctor.Gender.FEMALE);
            doctor.setTitle(titles[random.nextInt(titles.length)]);
            doctor.setPhone(faker.phoneNumber().cellPhone());
            doctor.setDepartment(department);
            doctor.setDiseases(pickRandomDiseasesForDepartment(diseases, department));
            doctor.setAvatarUrl("/files/Default.gif");
            doctors.add(doctorRepository.save(doctor));
        }

        System.out.println("Created " + doctors.size() + " doctors.");
        return doctors;
    }

    private List<Patient> createPatients() {
        List<Patient> patients = new ArrayList<>();

        for (int i = 0; i < 20; i++) {
            User user = new User();
            user.setUsername("patient" + (i + 1));
            user.setPassword(passwordEncoder.encode("patient123"));
            user.setRole(User.Role.PATIENT);
            user.setDisplayName("患者" + (i + 1));
            user.setEmail("patient" + (i + 1) + "@hospital.local");
            user.setStatus(User.Status.ACTIVE);
            userRepository.save(user);

            Patient patient = new Patient();
            patient.setUser(user);
            patient.setName(faker.name().fullName());
            patient.setGender(random.nextBoolean() ? Patient.Gender.MALE : Patient.Gender.FEMALE);
            patient.setAge(random.nextInt(63) + 18); // 18-80
            patient.setIdCard(faker.idNumber().valid());
            patient.setPhone(faker.phoneNumber().cellPhone());
            patient.setAddress(faker.address().fullAddress());
            patients.add(patientRepository.save(patient));
        }

        System.out.println("Created " + patients.size() + " patients.");
        return patients;
    }

    private List<Schedule> createSchedules(List<Doctor> doctors) {
        List<Schedule> schedules = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (Doctor doctor : doctors) {
            for (int i = 0; i < 2; i++) {
                Schedule schedule = new Schedule();
                schedule.setDoctor(doctor);
                schedule.setDepartment(doctor.getDepartment());
                schedule.setWorkDate(today.plusDays(i));
                schedule.setStartTime(LocalTime.of(9, 0));
                schedule.setEndTime(LocalTime.of(12, 0));
                schedule.setType(Schedule.ScheduleType.REGULAR);
                schedule.setStatus(Schedule.ScheduleStatus.OPEN);
                schedule.setCapacity(12);
                schedule.setBooked(random.nextInt(12));
                schedules.add(scheduleRepository.save(schedule));
            }
        }
        System.out.println("Created " + schedules.size() + " schedules.");
        return schedules;
    }

    private List<Registration> createRegistrations(List<Patient> patients, List<Doctor> doctors, List<Disease> diseases, List<Schedule> schedules) {
        List<Registration> registrations = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Patient patient : patients) {
            int registrationCount = random.nextInt(3) + 2; // 2-4 records per patient

            for (int i = 0; i < registrationCount; i++) {
                Doctor doctor = doctors.get(random.nextInt(doctors.size()));
                Disease disease = diseases.stream()
                        .filter(d -> d.getDepartment().equals(doctor.getDepartment()))
                        .findAny()
                        .orElse(diseases.get(random.nextInt(diseases.size())));
                Schedule schedule = schedules.stream()
                        .filter(s -> s.getDoctor().equals(doctor))
                        .findAny()
                        .orElse(null);

                LocalDateTime appointmentTime = now
                        .minusDays(random.nextInt(5))
                        .plusDays(random.nextInt(10))
                        .withHour(8 + random.nextInt(9))
                        .withMinute(0);

                Registration registration = new Registration();
                registration.setPatient(patient);
                registration.setDoctor(doctor);
                registration.setDisease(disease);
                registration.setSchedule(schedule);
                registration.setAppointmentTime(appointmentTime);
                registration.setRegistrationTime(now.minusHours(random.nextInt(48)));
                registration.setChannel(random.nextBoolean() ? Registration.Channel.ONLINE : Registration.Channel.OFFLINE);
                registration.setType(random.nextBoolean() ? Registration.RegistrationType.REGULAR : Registration.RegistrationType.SPECIALIST);
                registration.setStatus(pickStatus(appointmentTime));
                registration.setFee(new BigDecimal("30.00"));
                registration.setPaymentStatus(Registration.PaymentStatus.PAID);
                registration.setNotes(faker.lorem().sentence());

                registrations.add(registrationRepository.save(registration));
            }
        }

        System.out.println("Created " + registrations.size() + " registrations.");
        return registrations;
    }

    private void createMedicalRecords(List<Registration> registrations) {
        int recordCount = 0;
        LocalDateTime now = LocalDateTime.now();

        for (Registration registration : registrations) {
            if (registration.getStatus() == Registration.Status.CANCELLED) {
                continue;
            }
            if (registration.getStatus() == Registration.Status.WAITING && random.nextDouble() < 0.4) {
                continue;
            }

            MedicalRecord record = new MedicalRecord();
            record.setPatient(registration.getPatient());
            record.setDoctor(registration.getDoctor());
            record.setRegistration(registration);

            LocalDateTime visitDate = registration.getAppointmentTime();
            if (visitDate == null || visitDate.isAfter(now)) {
                visitDate = now.minusDays(random.nextInt(10)).withHour(9 + random.nextInt(8));
            }
            record.setVisitDate(visitDate);
            record.setSymptoms(faker.medical().symptoms());
            record.setDiagnosis(registration.getDisease().getName());
            record.setMedication(String.join(", ",
                    faker.medical().medicineName(),
                    faker.medical().medicineName()));
            record.setTreatment(faker.lorem().sentence());
            record.setExaminations(faker.lorem().sentence());
            record.setNotes(faker.lorem().sentence());

            medicalRecordRepository.save(record);
            recordCount++;
        }

        System.out.println("Created " + recordCount + " medical records.");
    }

    private void createAnnouncements() {
        Announcement announcement = new Announcement();
        announcement.setTitle("冬季流感接诊指引");
        announcement.setContent("请各科室注意防护，保障就诊秩序。");
        announcement.setStatus(Announcement.Status.PUBLISHED);
        announcement.setAudienceScope("全院");
        announcement.setPublishAt(LocalDateTime.now());
        announcementRepository.save(announcement);
    }

    private Registration.Status pickStatus(LocalDateTime appointmentTime) {
        LocalDateTime now = LocalDateTime.now();
        if (appointmentTime.isBefore(now)) {
            return random.nextDouble() < 0.15 ? Registration.Status.CANCELLED : Registration.Status.COMPLETED;
        }
        return random.nextDouble() < 0.2 ? Registration.Status.CANCELLED : Registration.Status.CONFIRMED;
    }

    private List<Disease> pickRandomDiseasesForDepartment(List<Disease> diseases, Department department) {
        List<Disease> candidates = diseases.stream()
                .filter(d -> d.getDepartment().equals(department))
                .toList();
        if (candidates.isEmpty()) {
            return List.of();
        }
        List<Disease> shuffled = new ArrayList<>(candidates);
        Collections.shuffle(shuffled, random);
        int limit = Math.max(1, Math.min(3, shuffled.size()));
        return new ArrayList<>(shuffled.subList(0, limit));
    }
}
