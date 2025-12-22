package com.hospital.init;

import com.github.javafaker.Faker;
import com.hospital.entity.Disease;
import com.hospital.entity.Doctor;
import com.hospital.entity.MedicalRecord;
import com.hospital.entity.Patient;
import com.hospital.entity.Registration;
import com.hospital.entity.User;
import com.hospital.repository.DiseaseRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.MedicalRecordRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.RegistrationRepository;
import com.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.stream.Collectors;

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
        List<Disease> diseases = createDiseases();
        List<Doctor> doctors = createDoctors(diseases);
        List<Patient> patients = createPatients();
        List<Registration> registrations = createRegistrations(patients, doctors, diseases);
        createMedicalRecords(registrations);
        createDebugAccounts(diseases);

        System.out.println("Demo data ready.");
    }

    private void clearAllData() {
        System.out.println("Clearing existing data...");
        medicalRecordRepository.deleteAll();
        registrationRepository.deleteAll();
        patientRepository.deleteAll();
        doctorRepository.deleteAll();
        diseaseRepository.deleteAll();
        userRepository.deleteAll();
    }

    private void createAdminUser() {
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(User.Role.ADMIN);
        userRepository.save(admin);
        System.out.println("Created admin user admin/admin123");
    }

    private List<Disease> createDiseases() {
        List<Disease> diseases = new ArrayList<>();
        String[] departments = {"内科", "外科", "儿科", "妇产科", "眼科", "耳鼻喉科", "皮肤科", "口腔科"};

        for (String department : departments) {
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

    private List<Doctor> createDoctors(List<Disease> diseases) {
        List<Doctor> doctors = new ArrayList<>();
        String[] departments = {"内科", "外科", "儿科", "妇产科", "眼科", "耳鼻喉科", "皮肤科", "口腔科"};
        String[] titles = {"主任医师", "副主任医师", "主治医师", "住院医师"};

        for (int i = 0; i < 10; i++) {
            User user = new User();
            user.setUsername("doctor" + (i + 1));
            user.setPassword(passwordEncoder.encode("doctor123"));
            user.setRole(User.Role.DOCTOR);
            userRepository.save(user);

            String department = departments[random.nextInt(departments.length)];

            Doctor doctor = new Doctor();
            doctor.setUser(user);
            doctor.setName(faker.name().fullName());
            doctor.setGender(random.nextBoolean() ? Doctor.Gender.MALE : Doctor.Gender.FEMALE);
            doctor.setTitle(titles[random.nextInt(titles.length)]);
            doctor.setPhone(faker.phoneNumber().cellPhone());
            doctor.setDepartment(department);
            doctor.setDiseases(pickRandomDiseasesForDepartment(diseases, department));
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

    private List<Registration> createRegistrations(List<Patient> patients, List<Doctor> doctors, List<Disease> diseases) {
        List<Registration> registrations = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Patient patient : patients) {
            int registrationCount = random.nextInt(4) + 2; // 2-5 records per patient

            for (int i = 0; i < registrationCount; i++) {
                Doctor doctor = doctors.get(random.nextInt(doctors.size()));
                Disease disease = diseases.get(random.nextInt(diseases.size()));

                LocalDateTime appointmentTime = now
                        .minusDays(random.nextInt(5))
                        .plusDays(random.nextInt(20))
                        .withHour(8 + random.nextInt(9))
                        .withMinute(0);

                Registration registration = new Registration();
                registration.setPatient(patient);
                registration.setDoctor(doctor);
                registration.setDisease(disease);
                registration.setAppointmentTime(appointmentTime);
                registration.setStatus(pickStatus(appointmentTime));

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
            if (registration.getStatus() == Registration.Status.REGISTERED && random.nextDouble() < 0.4) {
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

    private void createDebugAccounts(List<Disease> diseases) {
        System.out.println("Creating debug accounts 1P/2P/3P...");

        // Admin: 1P
        if (!userRepository.findByUsername("1P").isPresent()) {
            User admin = new User();
            admin.setUsername("1P");
            admin.setPassword(passwordEncoder.encode("debug"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
        }

        // Doctor: 3P
        Doctor doctor;
        if (userRepository.findByUsername("3P").isPresent()) {
            doctor = doctorRepository.findAll().stream()
                    .filter(d -> d.getUser() != null && "3P".equals(d.getUser().getUsername()))
                    .findFirst()
                    .orElse(null);
        } else {
            User doctorUser = new User();
            doctorUser.setUsername("3P");
            doctorUser.setPassword(passwordEncoder.encode("debug"));
            doctorUser.setRole(User.Role.DOCTOR);
            userRepository.save(doctorUser);

            doctor = new Doctor();
            doctor.setUser(doctorUser);
            doctor.setName("调试医生");
            doctor.setGender(Doctor.Gender.MALE);
            doctor.setTitle("主治医师");
            doctor.setPhone(faker.phoneNumber().cellPhone());
            doctor.setDepartment("内科");
            doctor.setDiseases(pickRandomDiseasesForDepartment(diseases, "内科"));
            doctor = doctorRepository.save(doctor);
        }

        // Patient: 2P
        Patient patient;
        if (userRepository.findByUsername("2P").isPresent()) {
            patient = patientRepository.findAll().stream()
                    .filter(p -> p.getUser() != null && "2P".equals(p.getUser().getUsername()))
                    .findFirst()
                    .orElse(null);
        } else {
            User patientUser = new User();
            patientUser.setUsername("2P");
            patientUser.setPassword(passwordEncoder.encode("debug"));
            patientUser.setRole(User.Role.PATIENT);
            userRepository.save(patientUser);

            patient = new Patient();
            patient.setUser(patientUser);
            patient.setName("调试病人");
            patient.setGender(Patient.Gender.FEMALE);
            patient.setAge(30);
            patient.setIdCard(faker.idNumber().valid());
            patient.setPhone(faker.phoneNumber().cellPhone());
            patient.setAddress("调试地址");
            patient = patientRepository.save(patient);
        }

        // Disease and registration/medical record for patient 2P
        Disease disease = diseases.isEmpty() ? null : diseases.get(0);
        if (disease == null) {
            disease = new Disease();
            disease.setName("调试通用病症");
            disease.setDepartment("内科");
            disease.setDescription("用于调试的数据");
            disease = diseaseRepository.save(disease);
        }

        Registration registration = new Registration();
        registration.setPatient(patient);
        registration.setDoctor(doctor);
        registration.setDisease(disease);
        registration.setAppointmentTime(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0));
        registration.setStatus(Registration.Status.REGISTERED);
        registration = registrationRepository.save(registration);

        MedicalRecord record = new MedicalRecord();
        record.setPatient(patient);
        record.setDoctor(doctor);
        record.setRegistration(registration);
        record.setVisitDate(LocalDateTime.now().minusDays(1).withHour(9));
        record.setSymptoms("头痛、乏力");
        record.setDiagnosis(disease.getName());
        record.setMedication("调试药物A, 调试药物B");
        record.setTreatment("调试治疗方案");
        record.setExaminations("血常规, 心电图");
        record.setNotes("调试用例记录");
        medicalRecordRepository.save(record);

        System.out.println("Debug accounts created.");
    }

    private Registration.Status pickStatus(LocalDateTime appointmentTime) {
        LocalDateTime now = LocalDateTime.now();
        if (appointmentTime.isBefore(now)) {
            return random.nextDouble() < 0.15 ? Registration.Status.CANCELLED : Registration.Status.CONSULTED;
        }
        return random.nextDouble() < 0.2 ? Registration.Status.CANCELLED : Registration.Status.REGISTERED;
    }

    private List<Disease> pickRandomDiseasesForDepartment(List<Disease> diseases, String department) {
        List<Disease> candidates = diseases.stream()
                .filter(d -> d.getDepartment().equals(department))
                .collect(Collectors.toList());
        if (candidates.isEmpty()) {
            return List.of();
        }
        Collections.shuffle(candidates, random);
        int limit = Math.max(1, Math.min(3, candidates.size()));
        return new ArrayList<>(candidates.subList(0, limit));
    }
}
