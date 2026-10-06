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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IssueService {
    private final IssueRepository issueRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final ProjectIssueCounterRepository projectIssueCounterRepository;

    @Transactional
    public IssueDto createIssue(CreateIssueRequest request , Long reporterId){
        Project project = projectRepository.findByIdWithLock(request.getProjectId())
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

        Optional<ProjectIssueCounter> counter = projectIssueCounterRepository.findByProjectId(project.getId());

        ProjectIssueCounter issueCounter;

        if(counter.isEmpty()){
            ProjectIssueCounter newCounter = new ProjectIssueCounter();
            newCounter.setProject(project);
            issueCounter = projectIssueCounterRepository.save(newCounter);
        }else{
            issueCounter = counter.get();
        }
        Long nextNumber = issueCounter.getNextNumber();

        String keyPrefix = project.getKeyPrefix();

        String issueKey = keyPrefix + "-" + nextNumber;

        issue.setIssueKey(issueKey);

        issueCounter.setNextNumber(nextNumber + 1);
        projectIssueCounterRepository.save(issueCounter);
        Issue savedIssue = issueRepository.save(issue);

        return IssueDto.builder()
                .id(savedIssue.getId())
                .issueKey(savedIssue.getIssueKey())
                .workspaceId(savedIssue.getWorkspace().getId())
                .projectId(savedIssue.getProject().getId())
                .reporterId(savedIssue.getReporter().getId())
                .assigneeId(
                        savedIssue.getAssignee() !=null
                        ? savedIssue.getAssignee().getId()
                        : null
                )
                .title(savedIssue.getTitle())
                .description(savedIssue.getDescription())
                .type(savedIssue.getType())
                .status(savedIssue.getStatus())
                .priority(savedIssue.getPriority())
                .build();
    }

    public List<IssueDto> getIssuesByProject(Long projectId){
        Project project = projectRepository.findById(projectId)
                .orElseThrow(()->
                        new ResourceNotFoundException("No project found for the given projectId")
                );
        List<Issue> issues = issueRepository.findByProjectId(projectId);
        List<IssueDto> issueDtos = issues.stream()
                .map(issue ->IssueDto.builder()
                                .id(issue.getId())
                                .issueKey(issue.getIssueKey())
                                .workspaceId(issue.getWorkspace().getId())
                                .projectId(issue.getProject().getId())
                                .reporterId(issue.getReporter().getId())
                                .assigneeId(
                                        issue.getAssignee() != null
                                                ? issue.getAssignee().getId()
                                                : null
                                )
                                .title(issue.getTitle())
                                .description(issue.getDescription())
                                .type(issue.getType())
                                .status(issue.getStatus())
                                .priority(issue.getPriority())
                                .build()
                     )
                .toList();
        return issueDtos;
    }

    public IssueDto getIssuebyId(Long issueId){

    }
}
