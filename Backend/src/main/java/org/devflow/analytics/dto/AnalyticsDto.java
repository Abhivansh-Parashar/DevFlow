package org.devflow.analytics.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AnalyticsDto {

    private Long totalIssues;
    private Long openIssues;
    private Long completedIssues;
    private Long totalCommits;
    private Long totalContributors;
}
