package org.devflow.project.member;

import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMember.ProjectMemberKey> {
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long id);
    boolean existsByProjectIdAndUserId(Long projectId, @NotNull Long userId);
    long countByProjectId(Long projectId);

}
