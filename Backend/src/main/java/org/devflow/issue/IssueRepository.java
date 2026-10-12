package org.devflow.issue;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface IssueRepository extends JpaRepository<Issue, Long> {


    List<Issue> findByProjectId(Long projectId);

    long countByWorkspaceId(Long workspaceId);

    long countByWorkspaceIdAndStatus(Long workspaceId, IssueStatus issueStatus);

    Page<Issue> findByProjectId(Long projectId, Pageable pageable);
}
