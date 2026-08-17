package org.devflow.project;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.devflow.common.audit.AuditableEntry;
import org.devflow.workspace.Workspace;
import org.hibernate.validator.constraints.URL;
import java.time.LocalDateTime;

@Entity
@RequiredArgsConstructor
@Getter
@Setter
public class Project extends AuditableEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;
    @NotEmpty
    private String name;
    @NotEmpty
    private String keyPrefix;
    @URL
    private String repoUrl;
}
