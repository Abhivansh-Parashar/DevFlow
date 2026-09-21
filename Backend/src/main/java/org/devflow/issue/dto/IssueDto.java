package org.devflow.issue.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.devflow.issue.IssuePriority;
import org.devflow.issue.IssueStatus;
import org.devflow.issue.IssueType;

@Getter
@AllArgsConstructor
public class IssueDto {
    private Long id;
    private Long workspaceId;
    private Long projectId;
    private Long reporterId;
    private Long assigneeId;

    private String title;
    private String description;

    private IssueType type;
    private IssueStatus status;
    private IssuePriority priority;
}
