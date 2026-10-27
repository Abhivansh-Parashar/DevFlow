package org.devflow.notification;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dev/email")
public class EmailTestController {

    private final EmailService emailService;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send")
    public Map<String, String> sendEmail(@RequestParam String to) {
        emailService.sendEmail(
                to,
                "DevFlow Email Test",
                "<h2>Hello from DevFlow!</h2><p>Your Resend integration is working.</p>"
        );

        return Map.of("message", "Email request sent successfully");
    }
}