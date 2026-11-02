package org.devflow.project;

import jakarta.transaction.Transactional;
import org.devflow.analytics.event.WorkspaceDashboardChangedEvent;
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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final CurrentUser currentUser;
    private final ProjectMemberRepository projectMemberRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final JdbcTemplate jdbcTemplate;

    public ProjectService(
            CurrentUser currentUser,
            ProjectMemberRepository projectMemberRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            ProjectRepository projectRepository,
            ApplicationEventPublisher eventPublisher,
            JdbcTemplate jdbcTemplate
    ) {
        this.currentUser = currentUser;
        this.projectMemberRepository = projectMemberRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.projectRepository = projectRepository;
        this.eventPublisher = eventPublisher;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public ProjectDto createProject(Long workspaceId, CreateProjectRequest request) {

        User user = currentUser.get();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Workspace not found."));

        workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, user.getId())
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of this workspace."
                        ));

        String keyPrefix = generateKeyPrefix(request.getName(), workspaceId);

        Project project = Project.builder()
                .id(nextAvailableProjectId())
                .workspace(workspace)
                .name(request.getName())
                .keyPrefix(keyPrefix)
                .repoUrl(request.getRepoUrl())
                .build();

        projectRepository.save(project);
        eventPublisher.publishEvent(
                new WorkspaceDashboardChangedEvent(workspaceId)
        );

        ProjectMember projectMember = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(ProjectRole.OWNER)
                .build();
        eventPublisher.publishEvent(
                new WorkspaceDashboardChangedEvent(workspaceId)
        );

        projectMemberRepository.save(projectMember);

        return toDto(project);
    }

    private Long nextAvailableProjectId() {
        jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS project_id_seq START WITH 1 INCREMENT BY 1");
        for (int attempt = 0; attempt < 100; attempt++) {
            Long candidate = jdbcTemplate.queryForObject(
                    "SELECT nextval('project_id_seq')",
                    Long.class
            );
            if (candidate != null && !projectRepository.existsById(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Unable to allocate a unique project identifier.");
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

    @Transactional
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
        eventPublisher.publishEvent(
                new WorkspaceDashboardChangedEvent(
                        project.getWorkspace().getId()
                )
        );
    }

    @Transactional
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
                .filter(project -> projectMemberRepository.existsByProjectIdAndUserId(
                        project.getId(), user.getId()))
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
        List<ProjectMember> members = projectMemberRepository.findAllByProjectId(project.getId());
        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .keyPrefix(project.getKeyPrefix())
                .workspaceId(project.getWorkspace().getId())
                .repoUrl(project.getRepoUrl())
                .memberIds(members.stream()
                        .map(member -> member.getUser().getId())
                        .toList())
                .roles(members.stream().collect(Collectors.toMap(
                        member -> member.getUser().getId(),
                        member -> member.getRole() == null ? ProjectRole.MEMBER.name() : member.getRole().name(),
                        (first, ignored) -> first
                )))
                .build();
    }
}