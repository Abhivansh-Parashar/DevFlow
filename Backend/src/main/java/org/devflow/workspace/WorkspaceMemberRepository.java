package org.devflow.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember,WorkspaceMemberId> {
    long countByWorkspaceId(Long workspaceId);
}
