package org.devflow.analytics;

import org.devflow.analytics.dto.DashboardStatsDto;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.issue.IssueRepository;
import org.devflow.issue.IssueStatus;
import org.devflow.project.ProjectRepository;
import org.devflow.user.UserService;
import org.devflow.workspace.WorkspaceMemberRepository;
import org.devflow.workspace.WorkspaceRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final UserService userService;
    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public DashboardService(
            UserService userService,
            WorkspaceRepository workspaceRepository,
            ProjectRepository projectRepository,
            IssueRepository issueRepository,
            WorkspaceMemberRepository workspaceMemberRepository
    ) {
        this.userService = userService;
        this.workspaceRepository = workspaceRepository;
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    public DashboardStatsDto getDashboardStats(Long workspaceId) {

        userService.getCurrentUser();

        workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No workspace found for the given id."
                        )
                );

        long totalProjects =
                projectRepository.findByWorkspaceId(workspaceId).size();

        long totalIssues =
                issueRepository.countByWorkspaceId(workspaceId);

        long openIssues =
                issueRepository.countByWorkspaceIdAndStatus(
                        workspaceId,
                        IssueStatus.TODO
                )
                        +
                        issueRepository.countByWorkspaceIdAndStatus(
                                workspaceId,
                                IssueStatus.IN_PROGRESS
                        );

        long completedIssues =
                issueRepository.countByWorkspaceIdAndStatus(
                        workspaceId,
                        IssueStatus.DONE
                );

        long totalMembers =
                workspaceMemberRepository.countByWorkspaceId(workspaceId);

        DashboardStatsDto dto = new DashboardStatsDto();

        dto.setTotalProjects(totalProjects);
        dto.setTotalIssues(totalIssues);
        dto.setOpenIssues(openIssues);
        dto.setCompletedIssues(completedIssues);
        dto.setTotalMembers(totalMembers);

        return dto;
    }
}