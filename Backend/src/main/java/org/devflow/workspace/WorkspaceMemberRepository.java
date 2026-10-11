package org.devflow.workspace;

import org.devflow.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember,WorkspaceMemberId> {
    long countByWorkspaceId(Long workspaceId);

    boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long id);

    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(Long workspaceId, Long id);
}
