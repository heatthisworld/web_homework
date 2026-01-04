package com.hospital.service.impl;

import com.hospital.entity.User;
import com.hospital.repository.UserRepository;
import com.hospital.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${spring.mail.username}")
    private String mailFrom;

    private static final Duration CODE_TTL = Duration.ofMinutes(10);
    private static final Duration RESEND_INTERVAL = Duration.ofSeconds(60);
    private final Map<String, VerificationCode> codeCache = new ConcurrentHashMap<>();
    private final Random random = new Random();

    @Autowired
    public PasswordResetServiceImpl(JavaMailSender mailSender,
                                    UserRepository userRepository,
                                    PasswordEncoder passwordEncoder) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void sendResetCode(String username, String email) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(email)) {
            throw new IllegalArgumentException("用户名和邮箱不能为空");
        }

        User user = userRepository.findByUsername(username.trim())
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        if (!StringUtils.hasText(user.getEmail())) {
            throw new IllegalArgumentException("该账号未绑定邮箱，无法找回密码");
        }

        if (!user.getEmail().equalsIgnoreCase(email.trim())) {
            throw new IllegalArgumentException("邮箱与账号不匹配");
        }

        String key = email.trim().toLowerCase();
        LocalDateTime now = LocalDateTime.now();
        VerificationCode existing = codeCache.get(key);
        if (existing != null && existing.sentAt().isAfter(now.minus(RESEND_INTERVAL))) {
            long waitSeconds = RESEND_INTERVAL.minus(Duration.between(existing.sentAt(), now)).toSeconds();
            throw new IllegalArgumentException("验证码发送过于频繁，请稍后再试（" + waitSeconds + "秒）");
        }

        String code = String.format("%06d", random.nextInt(1_000_000));
        codeCache.put(key, new VerificationCode(code, now.plus(CODE_TTL), now));
        sendEmail(email.trim(), code);
    }

    @Override
    public void resetPassword(String username, String email, String code, String newPassword) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(email) || !StringUtils.hasText(code)) {
            throw new IllegalArgumentException("用户名、邮箱和验证码不能为空");
        }

        User user = userRepository.findByUsername(username.trim())
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        if (!StringUtils.hasText(user.getEmail())) {
            throw new IllegalArgumentException("该账号未绑定邮箱，无法找回密码");
        }

        if (!user.getEmail().equalsIgnoreCase(email.trim())) {
            throw new IllegalArgumentException("邮箱与账号不匹配");
        }

        String key = email.trim().toLowerCase();
        VerificationCode verificationCode = codeCache.get(key);
        if (verificationCode == null) {
            throw new IllegalArgumentException("请先获取验证码");
        }

        LocalDateTime now = LocalDateTime.now();
        if (verificationCode.expireAt().isBefore(now)) {
            codeCache.remove(key);
            throw new IllegalArgumentException("验证码已失效，请重新获取");
        }

        if (!verificationCode.code().equals(code.trim())) {
            throw new IllegalArgumentException("验证码不正确");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        codeCache.remove(key);
    }

    private void sendEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (StringUtils.hasText(mailFrom)) {
            message.setFrom(mailFrom);
        }
        message.setTo(to);
        message.setSubject("医院挂号系统密码重置验证码");
        message.setText("您好，您的验证码为：" + code + "，有效期为" + CODE_TTL.toMinutes() + "分钟。若非本人操作，请忽略该邮件。");

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            logError("发送邮箱验证码失败", ex);
            throw new IllegalArgumentException("验证码发送失败，请检查邮箱配置后重试");
        }
    }

    private void logError(String context, Exception ex) {
        try {
            Path logPath = Path.of("ERROR.txt");
            StringWriter sw = new StringWriter();
            ex.printStackTrace(new PrintWriter(sw));
            String content = String.format(
                    "[%s] %s%nMessage: %s%n%s%n",
                    LocalDateTime.now(),
                    context,
                    ex.getMessage(),
                    sw.toString()
            );
            Files.writeString(
                    logPath,
                    content,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND
            );
        } catch (Exception ignore) {
            // ignore logging failures
        }
    }

    private record VerificationCode(String code, LocalDateTime expireAt, LocalDateTime sentAt) {
    }
}
