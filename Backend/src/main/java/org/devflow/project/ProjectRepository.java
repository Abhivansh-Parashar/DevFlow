package org.devflow.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project , Long> {
    List<Project> findByWorkspaceId(Long workspaceId);
    boolean existsByWorkspaceIdAndKeyPrefix(Long workspaceId, String prefix);
    Optional<Project> findById(Long id);
}
