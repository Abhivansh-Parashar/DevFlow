package org.devflow.issue;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface IssueRepository extends JpaRepository<Issue, Long> {


    List<Issue> findByProjectId(Long projectId);

    long countByWorkspaceId(Long workspaceId);

    long countByWorkspaceIdAndStatus(Long workspaceId, IssueStatus issueStatus);

    Page<Issue> findByProjectId(Long projectId, Pageable pageable);

    @Query(value = """
    SELECT COUNT(DISTINCT contributor_id)
    FROM (
        SELECT reporter_id AS contributor_id
        FROM issue
        WHERE workspace_id = :workspaceId

        UNION

        SELECT assignee_id AS contributor_id
        FROM issue
        WHERE workspace_id = :workspaceId
          AND assignee_id IS NOT NULL
    ) contributors
    """, nativeQuery = true)
    long countDistinctContributorsByWorkspaceId(
            @Param("workspaceId") Long workspaceId
    );
}
