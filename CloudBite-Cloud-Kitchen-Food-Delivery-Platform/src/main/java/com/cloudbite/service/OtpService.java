package com.cloudbite.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final long OTP_TTL_SECONDS = 5 * 60; // 5 minutes

    @Autowired
    private JavaMailSender mailSender;

    // thread-safe storage: email -> (code, expiresAt)
    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    private static class OtpEntry {
        final String code;
        final Instant expiresAt;
        OtpEntry(String code, Instant expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }

    // generate, store and send OTP
    public void sendOtp(String email) {
        String otp = generateOtp();
        Instant expiresAt = Instant.now().plusSeconds(OTP_TTL_SECONDS);
        store.put(email, new OtpEntry(otp, expiresAt));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("CloudBite - Password Reset OTP");
        message.setText("Your OTP for password reset is: " + otp + "\n\nIt will expire in 5 minutes.");
        mailSender.send(message);
    }

    // verify OTP (returns true only if code matches and not expired). Consumes OTP on success.
    public boolean verifyOtp(String email, String code) {
        OtpEntry entry = store.get(email);
        if (entry == null) return false;
        if (Instant.now().isAfter(entry.expiresAt)) {
            store.remove(email);
            return false;
        }
        boolean ok = entry.code.equals(code);
        if (ok) store.remove(email); // consume
        return ok;
    }

    // optional: helper to invalidate OTP for an email
    public void invalidateOtp(String email) {
        store.remove(email);
    }

    private String generateOtp() {
        int n = new Random().nextInt(900_000) + 100_000; // 6-digit
        return String.valueOf(n);
    }
}
