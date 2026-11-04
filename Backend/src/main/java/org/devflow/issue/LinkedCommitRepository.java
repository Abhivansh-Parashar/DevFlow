package org.devflow.issue;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LinkedCommitRepository extends JpaRepository<LinkedCommit, Long> {
    long countByIssueWorkspaceId(Long workspaceId);
    void deleteByIssueId(Long issueId);
    List<LinkedCommit> findByIssueIdOrderByCommittedAtDesc(Long issueId);
}
