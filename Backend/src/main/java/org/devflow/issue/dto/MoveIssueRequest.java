package org.devflow.issue.dto;

import lombok.Getter;
import lombok.Setter;
import org.devflow.issue.IssueStatus;

@Getter
@Setter
public class MoveIssueRequest {
    private IssueStatus status;
}
