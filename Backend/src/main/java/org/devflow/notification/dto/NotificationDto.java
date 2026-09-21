package org.devflow.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.devflow.notification.NotificationType;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private Long recipientId;
    private NotificationType type;
    private String payload;
    private Instant readAt;
    private Instant createdAt;
}
