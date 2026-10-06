package org.devflow.issue;


import jakarta.persistence.LockModeType;
import org.devflow.project.ProjectRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface ProjectIssueCounterRepository extends JpaRepository<ProjectIssueCounter,Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ProjectIssueCounter> findByProjectId(Long projectId);
}
