package org.devflow.issue;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {
    void deleteByIssueId(Long issueId);
}
