package org.devflow.issue;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    void deleteByIssueId(Long issueId);
    List<Comment> findByIssueIdOrderByCreatedAtAsc(Long issueId);
}
