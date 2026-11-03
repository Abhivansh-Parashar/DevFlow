package org.devflow.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

public interface InviteRepository extends JpaRepository<Invite, UUID> {
    List<Invite> findByEmailIgnoreCaseAndStatus(String email, InviteStatus status);
    boolean existsByWorkspaceIdAndEmailIgnoreCaseAndStatus(Long workspaceId, String email, InviteStatus status);
    Optional<Invite> findByWorkspaceIdAndEmailIgnoreCaseAndStatus(Long workspaceId, String email, InviteStatus status);
}
