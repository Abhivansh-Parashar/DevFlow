package org.devflow.issue.dto;

import lombok.Getter;
import lombok.Setter;
import org.devflow.issue.IssuePriority;
import org.devflow.issue.IssueType;

import java.util.UUID;

@Getter
@Setter
public class UpdateIssueRequest {

    private String title;

    private String description;

    private UUID assigneeId;

    private IssueType type;

    private IssuePriority priority;
}
