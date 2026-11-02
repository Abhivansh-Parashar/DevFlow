package org.devflow.project.member;

import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.project.Project;
import org.devflow.project.ProjectRepository;
import org.devflow.project.ProjectRole;
import org.devflow.security.CurrentUser;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.devflow.workspace.WorkspaceMemberRepository;
import org.devflow.workspace.WorkspaceRole;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.List;

@Service
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public ProjectMemberService(
            ProjectMemberRepository projectMemberRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            CurrentUser currentUser,
            WorkspaceMemberRepository workspaceMemberRepository
    ) {
        this.projectMemberRepository = projectMemberRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.currentUser = currentUser;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    public ProjectMemberDto addMember(Long projectId, ProjectMemberRequest request) {

        User currentUser = this.currentUser.get();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found."));

        ProjectMember currentMembership =
                projectMemberRepository
                        .findByProjectIdAndUserId(projectId, currentUser.getId())
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "You are not a member of this project."
                                ));

        if (currentMembership.getRole() == null
                && workspaceMemberRepository.findByWorkspaceIdAndUserId(
                project.getWorkspace().getId(), currentUser.getId())
                .map(member -> member.getRole() == WorkspaceRole.OWNER)
                .orElse(false)) {
            currentMembership.setRole(ProjectRole.OWNER);
            projectMemberRepository.save(currentMembership);
        }

        if (currentMembership.getRole() != ProjectRole.OWNER) {
            throw new AccessDeniedException(
                    "Only the project owner can add members."
            );
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found."));

        if (projectMemberRepository.existsByProjectIdAndUserId(
                projectId,
                request.getUserId()
        )) {
            throw new IllegalStateException(
                    "User is already a member of this project."
            );
        }

        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(user);
        member.setRole(request.getRole());

        ProjectMember savedMember =
                projectMemberRepository.save(member);

        return new ProjectMemberDto(
                savedMember.getProject().getId(),
                savedMember.getUser().getId(),
                savedMember.getRole()
        );
    }

    public List<ProjectMemberDto> listMembers(Long projectId) {
        User user = currentUser.get();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        ProjectMember currentMembership = projectMemberRepository.findByProjectIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this project."));
        if (currentMembership.getRole() == null
                && workspaceMemberRepository.findByWorkspaceIdAndUserId(
                project.getWorkspace().getId(), user.getId())
                .map(member -> member.getRole() == WorkspaceRole.OWNER)
                .orElse(false)) {
            currentMembership.setRole(ProjectRole.OWNER);
            projectMemberRepository.save(currentMembership);
        }
        return projectMemberRepository.findAllByProjectId(projectId).stream()
                .map(member -> new ProjectMemberDto(
                        member.getProject().getId(),
                        member.getUser().getId(),
                        member.getRole()))
                .toList();
    }

    public void removeMember(Long projectId, Long userId) {
        User currentUser = this.currentUser.get();

        projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No project found for the given id."
                        )
                );

        ProjectMember currentMembership =
                projectMemberRepository
                        .findByProjectIdAndUserId(projectId, currentUser.getId())
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "You are not a member of this project."
                                )
                        );

        if (currentMembership.getRole() != ProjectRole.OWNER) {
            throw new AccessDeniedException(
                    "Only the project owner can remove members."
            );
        }

        ProjectMember member =
                projectMemberRepository
                        .findByProjectIdAndUserId(projectId, userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "The user is not a member of the project."
                                )
        );

        if (Objects.equals(userId, currentUser.getId())) {
            throw new AccessDeniedException(
                    "Cannot remove owner from the project."
            );
        }
        projectMemberRepository.delete(member);
    }

    public ProjectMemberDto changeRole(Long projectId, Long userId, ProjectRole role){

        User currentUser = this.currentUser.get();

        projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No project found for the given id."
                        )
                );

        ProjectMember currentMembership =
                projectMemberRepository
                        .findByProjectIdAndUserId(projectId, currentUser.getId())
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "You are not a member of this project."
                                )
                        );

        if (currentMembership.getRole() != ProjectRole.OWNER) {
            throw new AccessDeniedException(
                    "Only the project owner can change member roles."
            );
        }

        ProjectMember member =
                projectMemberRepository
                        .findByProjectIdAndUserId(projectId, userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "The user is not a member of the project."
                                )
                        );

        if (Objects.equals(userId, currentUser.getId())) {
            throw new AccessDeniedException(
                    "Cannot change your own project role."
            );
        }

        member.setRole(role);
        projectMemberRepository.save(member);

        return ProjectMemberDto.builder()
                .projectId(member.getProject().getId())
                .userId(member.getUser().getId())
                .role(member.getRole())
                .build();
    }
}