package com.hospital.init;

import com.github.javafaker.Faker;
import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.entity.MedicalRecord;
import com.hospital.entity.Patient;
import com.hospital.entity.Registration;
import com.hospital.entity.Schedule;
import com.hospital.entity.User;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.MedicalRecordRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.RegistrationRepository;
import com.hospital.repository.ScheduleRepository;
import com.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
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

/**
 * Additional data seeder to generate a large volume of demo data.
 * Does NOT use the disease table (deprecated).
 */
@Component
@Order(2)
public class BulkDataInitializer implements org.springframework.boot.CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Faker faker = new Faker(new Locale("zh-CN"));
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        boolean forceBulk = Arrays.asList(args).contains("--force-bulk");
        long userCount = userRepository.count();
        boolean dbEmpty = userCount == 0;
        boolean alreadySeeded = userRepository.findByUsername("bulk_doctor_1").isPresent();

        if (!dbEmpty && alreadySeeded && !forceBulk) {
            System.out.println("Bulk data already seeded (bulk_doctor_1 exists). Skip bulk seeding.");
            return;
        }

        System.out.println("Seeding bulk demo data...");
        List<Department> departments = ensureDepartments();
        List<Doctor> doctors = createBulkDoctors(departments);
        List<Patient> patients = createBulkPatients();
        List<Schedule> schedules = createBulkSchedules(doctors);
        List<Registration> registrations = createBulkRegistrations(patients, doctors, schedules);
        createBulkMedicalRecords(registrations);
        System.out.printf("Bulk data ready. doctors=%d, patients=%d, schedules=%d, registrations=%d%n",
                doctors.size(), patients.size(), schedules.size(), registrations.size());
    }

    private List<Department> ensureDepartments() {
        List<Department> existing = departmentRepository.findAll();
        if (!existing.isEmpty()) {
            return existing;
        }
        String[] names = {"General Medicine", "Surgery", "Pediatrics", "OBGYN", "Dermatology", "ENT"};
        List<Department> list = new ArrayList<>();
        for (int i = 0; i < names.length; i++) {
            Department dept = new Department();
            dept.setCode("BD" + (200 + i));
            dept.setName(names[i]);
            dept.setLeadName(faker.name().fullName());
            dept.setRooms(8 + random.nextInt(8));
            dept.setStatus(Department.Status.OPEN);
            dept.setFocus(faker.lorem().sentence());
            list.add(departmentRepository.save(dept));
        }
        return list;
    }

    private List<Doctor> createBulkDoctors(List<Department> departments) {
        List<Doctor> doctors = new ArrayList<>();
        String[] titles = {"Chief Physician", "Deputy Chief Physician", "Attending Physician", "Resident Physician"};

        for (int i = 1; i <= 40; i++) {
            String username = "bulk_doctor_" + i;
            if (userRepository.findByUsername(username).isPresent()) {
                continue;
            }
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode("doctor123"));
            user.setRole(User.Role.DOCTOR);
            user.setDisplayName("Bulk Doctor " + i);
            user.setEmail("bulk_doctor_" + i + "@hospital.local");
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
            doctor.setAvatarUrl("/files/Default.gif");
            doctors.add(doctorRepository.save(doctor));
        }
        return doctors;
    }

    private List<Patient> createBulkPatients() {
        List<Patient> patients = new ArrayList<>();
        int target = 200;

        for (int i = 1; i <= target; i++) {
            String username = "bulk_patient_" + i;
            if (userRepository.findByUsername(username).isPresent()) {
                continue;
            }
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode("patient123"));
            user.setRole(User.Role.PATIENT);
            user.setDisplayName("Bulk Patient " + i);
            user.setEmail("bulk_patient_" + i + "@hospital.local");
            user.setStatus(User.Status.ACTIVE);
            userRepository.save(user);

            Patient patient = new Patient();
            patient.setUser(user);
            patient.setName(faker.name().fullName());
            patient.setGender(random.nextBoolean() ? Patient.Gender.MALE : Patient.Gender.FEMALE);
            patient.setAge(random.nextInt(63) + 18);
            patient.setIdCard(faker.idNumber().valid());
            patient.setPhone(faker.phoneNumber().cellPhone());
            patient.setAddress(faker.address().fullAddress());
            patients.add(patientRepository.save(patient));
        }
        return patients;
    }

    private List<Schedule> createBulkSchedules(List<Doctor> doctors) {
        List<Schedule> schedules = new ArrayList<>();
        LocalDate start = LocalDate.now();

        for (Doctor doctor : doctors) {
            int perDoctor = 5 + random.nextInt(4); // 5-8 schedules each
            for (int i = 0; i < perDoctor; i++) {
                Schedule schedule = new Schedule();
                schedule.setDoctor(doctor);
                schedule.setDepartment(doctor.getDepartment());
                schedule.setWorkDate(start.plusDays(random.nextInt(14)));
                schedule.setStartTime(LocalTime.of(8 + random.nextInt(6), 0));
                schedule.setEndTime(schedule.getStartTime().plusHours(4));
                schedule.setType(random.nextBoolean() ? Schedule.ScheduleType.REGULAR : Schedule.ScheduleType.SPECIALIST);
                schedule.setStatus(Schedule.ScheduleStatus.OPEN);
                schedule.setCapacity(15 + random.nextInt(10));
                schedule.setBooked(random.nextInt(schedule.getCapacity() + 1));
                schedules.add(scheduleRepository.save(schedule));
            }
        }
        return schedules;
    }

    private List<Registration> createBulkRegistrations(List<Patient> patients, List<Doctor> doctors, List<Schedule> schedules) {
        List<Registration> registrations = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Patient patient : patients) {
            int registrationCount = 3 + random.nextInt(4); // 3-6 per patient
            for (int i = 0; i < registrationCount; i++) {
                Doctor doctor = doctors.get(random.nextInt(doctors.size()));
                Schedule schedule = pickScheduleForDoctor(schedules, doctor);
                LocalDateTime appointmentTime = schedule != null
                        ? LocalDateTime.of(schedule.getWorkDate(), schedule.getStartTime())
                        : now.plusDays(random.nextInt(10)).withHour(8 + random.nextInt(9)).withMinute(0);

                Registration registration = new Registration();
                registration.setPatient(patient);
                registration.setDoctor(doctor);
                registration.setDisease(null); // disease table deprecated
                registration.setSchedule(schedule);
                registration.setAppointmentTime(appointmentTime);
                registration.setRegistrationTime(now.minusHours(random.nextInt(72)));
                registration.setChannel(random.nextBoolean() ? Registration.Channel.ONLINE : Registration.Channel.OFFLINE);
                registration.setType(random.nextBoolean() ? Registration.RegistrationType.REGULAR : Registration.RegistrationType.SPECIALIST);
                registration.setStatus(pickStatus(appointmentTime));
                registration.setFee(new BigDecimal("30.00"));
                registration.setPaymentStatus(random.nextBoolean() ? Registration.PaymentStatus.PAID : Registration.PaymentStatus.UNPAID);
                registration.setNotes(faker.lorem().sentence());
                registrations.add(registrationRepository.save(registration));
            }
        }
        return registrations;
    }

    private void createBulkMedicalRecords(List<Registration> registrations) {
        int created = 0;
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
            record.setDiagnosis(faker.lorem().sentence()); // no disease table usage
            record.setMedication(String.join(", ",
                    faker.medical().medicineName(),
                    faker.medical().medicineName()));
            record.setTreatment(faker.lorem().sentence());
            record.setExaminations(faker.lorem().sentence());
            record.setNotes(faker.lorem().sentence());
            medicalRecordRepository.save(record);
            created++;
        }
        System.out.println("Created bulk medical records: " + created);
    }

    private Schedule pickScheduleForDoctor(List<Schedule> schedules, Doctor doctor) {
        List<Schedule> matches = schedules.stream()
                .filter(s -> s.getDoctor().getId().equals(doctor.getId()))
                .toList();
        if (matches.isEmpty()) {
            return null;
        }
        List<Schedule> shuffled = new ArrayList<>(matches);
        Collections.shuffle(shuffled, random);
        return shuffled.get(0);
    }

    private Registration.Status pickStatus(LocalDateTime appointmentTime) {
        LocalDateTime now = LocalDateTime.now();
        if (appointmentTime.isBefore(now)) {
            return random.nextDouble() < 0.2 ? Registration.Status.CANCELLED : Registration.Status.COMPLETED;
        }
        return random.nextDouble() < 0.25 ? Registration.Status.CANCELLED : Registration.Status.CONFIRMED;
    }
}
