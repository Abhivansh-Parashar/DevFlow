package org.devflow.analytics;

import org.devflow.analytics.dto.AnalyticsDto;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.issue.IssueRepository;
import org.devflow.issue.IssueStatus;
import org.devflow.issue.LinkedCommitRepository;
import org.devflow.security.CurrentUser;
import org.devflow.workspace.WorkspaceRepository;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final CurrentUser currentUser;
    private final WorkspaceRepository workspaceRepository;
    private final IssueRepository issueRepository;
    private final LinkedCommitRepository linkedCommitRepository;

    public AnalyticsService(
            CurrentUser currentUser,
            WorkspaceRepository workspaceRepository,
            IssueRepository issueRepository,
            LinkedCommitRepository linkedCommitRepository
    ) {
        this.currentUser = currentUser;
        this.workspaceRepository = workspaceRepository;
        this.issueRepository = issueRepository;
        this.linkedCommitRepository = linkedCommitRepository;
    }

    public AnalyticsDto getAnalytics(Long workspaceId) {

        currentUser.get();

        workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No workspace found for the given id."
                        )
                );

        long totalIssues = getTotalIssues(workspaceId);
        long openIssues = getOpenIssues(workspaceId);
        long completedIssues = getCompletedIssues(workspaceId);
        long totalCommits = getTotalCommits(workspaceId);

        return AnalyticsDto.builder()
                .totalIssues(totalIssues)
                .openIssues(openIssues)
                .completedIssues(completedIssues)
                .totalCommits(totalCommits)
                .build();
    }

    public Long getTotalIssues(Long workspaceId) {
        return issueRepository.countByWorkspaceId(workspaceId);
    }

    public Long getOpenIssues(Long workspaceId) {
        return issueRepository.countByWorkspaceIdAndStatus(
                workspaceId,
                IssueStatus.TODO
        ) + issueRepository.countByWorkspaceIdAndStatus(
                workspaceId,
                IssueStatus.IN_PROGRESS
        );
    }

    public Long getCompletedIssues(Long workspaceId) {
        return issueRepository.countByWorkspaceIdAndStatus(
                workspaceId,
                IssueStatus.DONE
        );
    }

    public Long getTotalCommits(Long workspaceId) {
        return linkedCommitRepository.countByIssueWorkspaceId(workspaceId);
    }
}