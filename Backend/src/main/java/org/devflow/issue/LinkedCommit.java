package org.devflow.issue;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Table(name="linked_commit")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LinkedCommit {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="issue_id",nullable = false)

    private Issue issue;

    private String repo;

    private String commitHash;

    private String commitMessage;

    private Instant committedAt;
}
