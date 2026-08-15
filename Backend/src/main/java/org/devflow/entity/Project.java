package org.devflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.URL;
import java.time.LocalDateTime;

@Entity
@RequiredArgsConstructor
@Getter
@Setter
public class Project {
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    @PrePersist
    private void setCreatedAt(){
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    private void setUpdatedAt(){
        updatedAt = LocalDateTime.now();
    }
}
