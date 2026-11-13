
package org.devflow.invite;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.List;
import java.util.Optional;

public interface InviteRepository extends JpaRepository<Invite, Long> {

    List<Invite> findByEmailIgnoreCaseAndStatus(
            String email, InviteStatus status
    );

    boolean existsByWorkspaceIdAndEmailIgnoreCaseAndStatus(
            Long workspaceId, String email, InviteStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Invite> findByToken(String token);

    List<Invite> findByWorkspaceIdAndStatus(
            Long workspaceId, InviteStatus status
    );
}
