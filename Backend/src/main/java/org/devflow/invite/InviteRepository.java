package org.devflow.invite;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface InviteRepository extends JpaRepository<Invite, Long> {
    List<Invite> findByEmailIgnoreCaseAndStatus(String email, InviteStatus status);
    boolean existsByWorkspaceIdAndEmailIgnoreCaseAndStatus(Long workspaceId, String email, InviteStatus status);
    Optional<Invite> findByToken(String token);

    List<Invite> findByWorkspaceIdAndStatus(Long workspaceId, InviteStatus status);
}
