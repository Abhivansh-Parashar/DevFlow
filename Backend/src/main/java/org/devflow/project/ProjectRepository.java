package org.devflow.project;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project , Long> {
    List<Project> findByWorkspaceId(Long workspaceId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Project p WHERE p.id = :id")
    Optional<Project> findByIdWithLock(@Param("id") Long id);
    boolean existsByWorkspaceIdAndKeyPrefix(Long workspaceId, String prefix);
    Optional<Project> findById(Long id);

    long countByWorkspaceId(Long workspaceId);
}