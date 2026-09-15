package org.devflow.project.member;

import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.project.Project;
import org.devflow.project.ProjectRepository;
import org.devflow.project.ProjectRole;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.devflow.user.UserService;
import org.devflow.user.dto.UserDto;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public ProjectMemberService(
            ProjectMemberRepository projectMemberRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            UserService userService
    ) {
        this.projectMemberRepository = projectMemberRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public ProjectMemberDto addMember(Long projectId, ProjectMemberRequest request) {

        UserDto currentUser = userService.getCurrentUser();

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

    public void removeMember(Long projectId, Long userId) {
        UserDto currentUser = userService.getCurrentUser();

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

        if (!currentMembership.getRole().equals(ProjectRole.OWNER)) {
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

        UserDto currentUser = userService.getCurrentUser();

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

        if (!currentMembership.getRole().equals(ProjectRole.OWNER)) {
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