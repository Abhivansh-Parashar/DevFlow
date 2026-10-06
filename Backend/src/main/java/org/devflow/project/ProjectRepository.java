package org.devflow.project;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project , Long> {
    List<Project> findByWorkspaceId(Long workspaceId);
    boolean existsByWorkspaceIdAndKeyPrefix(Long workspaceId, String prefix);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Project> findByIdWithLock(Long id);
}
