package org.devflow.issue;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LinkedCommitRepository extends JpaRepository<LinkedCommit, Long> {
    long countByIssueWorkspaceId(Long workspaceId);
}
