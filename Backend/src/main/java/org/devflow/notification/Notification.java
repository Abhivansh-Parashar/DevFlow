package org.devflow.notification;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.devflow.user.User;

import java.time.Instant;


@Entity
@Table(name = "notification")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String payload;

    private Instant readAt;

    private Instant createdAt;

    public void markAsRead(){
        if(this.readAt == null){
            this.readAt = Instant.now();
        }
    }
}