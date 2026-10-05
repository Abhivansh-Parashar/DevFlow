package org.devflow.project;

import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.project.dto.CreateProjectRequest;
import org.devflow.project.dto.ProjectDto;
import org.devflow.project.dto.UpdateProjectRequest;
import org.devflow.project.member.ProjectMember;
import org.devflow.project.member.ProjectMemberRepository;
import org.devflow.security.CurrentUser;
import org.devflow.user.User;
import org.devflow.workspace.Workspace;
import org.devflow.workspace.WorkspaceMemberRepository;
import org.devflow.workspace.WorkspaceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final CurrentUser currentUser;
    private final ProjectMemberRepository projectMemberRepository;

    public ProjectService(
            CurrentUser currentUser,
            ProjectMemberRepository projectMemberRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            ProjectRepository projectRepository
    ) {
        this.currentUser = currentUser;
        this.projectMemberRepository = projectMemberRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.projectRepository = projectRepository;
    }

    public ProjectDto createProject(Long workspaceId, CreateProjectRequest request) {

        User user = currentUser.get();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Workspace not found."));

        workspaceMemberRepository
                .findByWorkspaceIdAndUserId((workspaceId, user.getId())
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of this workspace."
                        ));

        String keyPrefix = generateKeyPrefix(request.getName(), workspaceId);

        Project project = Project.builder()
                .workspace(workspace)
                .name(request.getName())
                .keyPrefix(keyPrefix)
                .repoUrl(request.getRepoUrl())
                .build();

        projectRepository.save(project);

        ProjectMember projectMember = ProjectMember.builder()
                .project(project)
                .user(user)
                .build();

        projectMemberRepository.save(projectMember);

        return toDto(project);
    }

    public ProjectDto getProject(Long projectId) {

        User user = currentUser.get();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No project found for the given id."
                        ));

        projectMemberRepository
                .findByProjectIdAndUserId(projectId, user.getId())
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of this project."
                        ));

        return toDto(project);
    }

    public ProjectDto updateProject(
            Long projectId,
            UpdateProjectRequest request
    ) {

        User user = currentUser.get();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No project found for the given id."
                        ));

        ProjectMember membership = projectMemberRepository
                .findByProjectIdAndUserId(projectId, user.getId())
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of this project."
                        ));

        project.setName(request.getName());

        if (membership.getRole() == ProjectRole.OWNER) {
            project.setRepoUrl(request.getRepoUrl());
        }

        projectRepository.save(project);

        return toDto(project);
    }

    public void deleteProject(Long projectId) {

        User user = currentUser.get();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No project found for the given id."
                        ));

        ProjectMember membership = projectMemberRepository
                .findByProjectIdAndUserId(projectId, user.getId())
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of this project."
                        ));

        if (!(membership.getRole() == ProjectRole.OWNER)) {
            throw new AccessDeniedException(
                    "Only the project owner can delete the project."
            );
        }

        projectRepository.delete(project);
    }

    public List<ProjectDto> getProjectsByWorkspace(Long workspaceId) {

        User user = currentUser.get();

        workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Workspace not found."));

        workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, user.getId())
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of this workspace."
                        ));

        return projectRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private String generateKeyPrefix(String name, Long workspaceId) {

        String prefix = name
                .replaceAll("[^a-zA-Z0-9 ]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .toUpperCase();

        if (prefix.length() > 10) {
            prefix = prefix.substring(0, 10);
        }

        String originalPrefix = prefix;
        int counter = 1;

        while (projectRepository.existsByWorkspaceIdAndKeyPrefix(
                workspaceId,
                prefix
        )) {
            prefix = originalPrefix + counter++;
        }

        return prefix;
    }

    private ProjectDto toDto(Project project) {
        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .keyPrefix(project.getKeyPrefix())
                .workspaceId(project.getWorkspace().getId())
                .repoUrl(project.getRepoUrl())
                .build();
    }
}