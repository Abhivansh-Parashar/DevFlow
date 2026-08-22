package org.devflow.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project , Long> {
    List<Project> findByWorkspaceId(Long workspaceId);
    boolean existsByWorkspaceIdAndKeyPrefix(Long workspaceId, String prefix);
}
