package org.devflow.workspace;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.devflow.user.User;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Table(name="invite")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Invite {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="workspace_id",nullable = false)
    private Workspace workspace;

    private String email;

    @ManyToOne(fetch = FetchType.LAZY , optional = false)
    @JoinColumn(name="invited_by",nullable = false)
    private User invitedBy;

    @Column(unique = true)
    private String token;

    private Instant expiresAt;

    @Enumerated(EnumType.STRING)
    private InviteStatus status;
}
