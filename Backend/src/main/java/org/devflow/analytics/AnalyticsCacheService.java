package org.devflow.analytics;

import org.devflow.analytics.dto.AnalyticsDto;
import org.devflow.issue.IssueRepository;
import org.devflow.issue.IssueStatus;
import org.devflow.issue.LinkedCommitRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsCacheService {

    private final IssueRepository issueRepository;
    private final LinkedCommitRepository linkedCommitRepository;

    public AnalyticsCacheService(
            IssueRepository issueRepository,
            LinkedCommitRepository linkedCommitRepository
    ) {
        this.issueRepository = issueRepository;
        this.linkedCommitRepository = linkedCommitRepository;
    }

    @Cacheable(
            cacheNames = "analytics",
            key = "#workspaceId"
    )
    public AnalyticsDto getAnalytics(Long workspaceId) {

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

        long totalCommits =
                linkedCommitRepository.countByIssueWorkspaceId(workspaceId);

        long totalContributors =
                issueRepository.countDistinctContributorsByWorkspaceId(workspaceId);

        return AnalyticsDto.builder()
                .totalIssues(totalIssues)
                .openIssues(openIssues)
                .completedIssues(completedIssues)
                .totalCommits(totalCommits)
                .totalContributors(totalContributors)
                .build();
    }
}