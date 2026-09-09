package org.devflow.ai.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectSnapshotDto {
    private Long projectId;
    private String projectName;
    private Long issueCount;
    private Long openIssueCount;
    private Long completedIssueCount;
    private Long memberCount;
}