package com.franchise.backend.notification.controller;

import com.franchise.backend.notification.job.NotificationReminderJob;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/test/notifications")
public class NotificationJobTestController {

    private final NotificationReminderJob job;

    @PostMapping("/run-reminder")
    public ResponseEntity<String> run() {
        job.run();
        return ResponseEntity.ok("OK");
    }
}
