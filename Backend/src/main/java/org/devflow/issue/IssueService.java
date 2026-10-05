package org.devflow.issue;

import lombok.RequiredArgsConstructor;
import org.devflow.common.exception.InvalidCredentialsException;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.issue.dto.CreateIssueRequest;
import org.devflow.issue.dto.IssueDto;
import org.devflow.project.Project;
import org.devflow.project.ProjectRepository;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.devflow.workspace.Workspace;
import org.devflow.workspace.WorkspaceRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IssueService {
    private final IssueRepository issueRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    public IssueDto createIssue(CreateIssueRequest request , Long reporterId){
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(()->
                     new ResourceNotFoundException("No project found for the given Id")
                );
        Workspace workspace = project.getWorkspace();
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(()->
                     new InvalidCredentialsException("No user found for the given Id")
                );
        User assignee = null;
        if(request.getAssigneeId()!=null){
            assignee=userRepository.findById(request.getAssigneeId())
                    .orElseThrow(()->
                            new InvalidCredentialsException("No user found for the given Id")
                    );
        }
        Issue issue = new Issue(
                request.getTitle(),
                request.getDescription(),
                request.getType(),
                request.getPriority(),
                workspace,
                project,
                reporter,
                assignee
        );

    }
}
