package org.devflow.ai.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProjectSnapshotDto {
    private Long projectId;
    private String projectName;
    private Long issueCount;
    private Long openIssueCount;
    private Long completedIssueCount;
    private Long memberCount;
}