package org.devflow.issue;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.devflow.user.User;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "status_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StatusHistory {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY , optional = false)
    @JoinColumn(name="issue_id",nullable = false)
    private Issue issue;

    @Enumerated(EnumType.STRING)
    private IssueStatus previousStatus;

    @Enumerated(EnumType.STRING)
    private IssueStatus newStatus;

    @ManyToOne(fetch = FetchType.LAZY , optional = false)
    @JoinColumn(name="changed_by" ,nullable = false)
    private User changedBy;

    private Instant changedAT;
}
