package org.devflow.issue;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.devflow.common.audit.AuditableEntry;
import org.devflow.project.Project;
import org.devflow.user.User;
import org.devflow.workspace.Workspace;

import java.util.UUID;

@Entity
@Table(name="issue")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Issue extends AuditableEntry {
    @Id
    @GeneratedValue
    private UUID id;
    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private IssueType type;

    @Enumerated(EnumType.STRING)
    private IssueStatus status;

    @Enumerated(EnumType.STRING)
    private IssuePriority priority;

    @ManyToOne(fetch = FetchType.LAZY , optional = false)
    @JoinColumn(name="workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="project_id",nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="assignee_id")
    private User assignee;

}
