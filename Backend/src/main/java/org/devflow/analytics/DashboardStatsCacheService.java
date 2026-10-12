package org.devflow.analytics;

import org.devflow.analytics.dto.DashboardStatsDto;
import org.devflow.issue.IssueRepository;
import org.devflow.issue.IssueStatus;
import org.devflow.project.ProjectRepository;
import org.devflow.workspace.WorkspaceMemberRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class DashboardStatsCacheService {

    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public DashboardStatsCacheService(
            ProjectRepository projectRepository,
            IssueRepository issueRepository,
            WorkspaceMemberRepository workspaceMemberRepository
    ) {
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    @Cacheable(
            cacheNames = "dashboardStats",
            key = "#workspaceId"
    )
    public DashboardStatsDto getDashboardStats(Long workspaceId) {

        long totalProjects =
                projectRepository.countByWorkspaceId(workspaceId);

        long totalIssues =
                issueRepository.countByWorkspaceId(workspaceId);

        long openIssues =
                issueRepository.countByWorkspaceIdAndStatus(
                        workspaceId, IssueStatus.TODO
                )
                        + issueRepository.countByWorkspaceIdAndStatus(
                        workspaceId, IssueStatus.IN_PROGRESS
                );

        long completedIssues =
                issueRepository.countByWorkspaceIdAndStatus(
                        workspaceId, IssueStatus.DONE
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