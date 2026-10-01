package org.devflow.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember,WorkspaceMemberId> {
    long countByWorkspaceId(Long workspaceId);
    List<WorkspaceMember> findByWorkspaceId(Long workspaceId);
    List<WorkspaceMember> findByUserId(Long userId);

}
