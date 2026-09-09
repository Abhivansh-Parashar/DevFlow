package org.devflow.analytics.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class DashboardStatsDto {
    private Long totalProjects;
    private Long totalIssues;
    private Long openIssues;
    private Long completedIssues;
    private Long totalMembers;
}
