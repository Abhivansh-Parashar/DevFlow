package org.devflow.issue;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Getter
@Table(name="linked_commit")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LinkedCommit {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="issue_id",nullable = false)

    private Issue issue;

    private String repo;

    private String commitHash;

    private String commitMessage;

    private Instant committedAt;

    public LinkedCommit(Issue issue, String repo, String commitHash, String commitMessage, Instant committedAt) {
        this.issue = issue;
        this.repo = repo;
        this.commitHash = commitHash;
        this.commitMessage = commitMessage;
        this.committedAt = committedAt;
    }
}
