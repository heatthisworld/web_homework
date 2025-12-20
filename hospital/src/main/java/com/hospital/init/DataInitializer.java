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
