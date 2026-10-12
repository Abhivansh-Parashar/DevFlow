package org.devflow.issue;

import lombok.RequiredArgsConstructor;
import org.devflow.common.exception.AccessDeniedException;
import org.devflow.common.exception.InvalidCredentialsException;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.issue.dto.CreateIssueRequest;
import org.devflow.issue.dto.IssueDto;
import org.devflow.issue.dto.IssuePageResponse;
import org.devflow.issue.dto.UpdateIssueRequest;
import org.devflow.project.Project;
import org.devflow.project.ProjectRepository;
import org.devflow.project.ProjectRole;
import org.devflow.project.member.ProjectMember;
import org.devflow.project.member.ProjectMemberRepository;
import org.devflow.security.CurrentUser;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.devflow.workspace.Workspace;
import org.devflow.workspace.WorkspaceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import java.time.Instant;
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
    private final ProjectMemberRepository projectMemberRepository;
    private final CurrentUser currentUser;
    private final CommentRepository commentRepository;
    private final ReplyRepository replyRepository;
    private final LinkedCommitRepository linkedCommitRepository;

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

    public IssuePageResponse getIssuesByProject(Long projectId, int page , int size){
        User user= currentUser.get();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(()->
                        new ResourceNotFoundException("No project found for the given projectId")
                );
        projectMemberRepository.findByProjectIdAndUserId(projectId, user.getId())
                .orElseThrow(()->
                        new AccessDeniedException("You are not a member of the project")
                );
        Pageable pageable = PageRequest.of(page,size);
        Page<Issue> issuePage = issueRepository.findByProjectId(projectId,pageable);
        List<Issue> issues = issuePage.getContent();
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
        return IssuePageResponse.builder().content(issueDtos).
                page(issuePage.getNumber()).
                size(issuePage.getSize()).
                totalElements(issuePage.getTotalElements()).
                totalPages(issuePage.getTotalPages()).
                build();
    }

    public IssueDto getIssueById(Long issueId){
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(()->
                        new ResourceNotFoundException("No issue found for the given Id")
                );
        User user = currentUser.get();
        projectMemberRepository.findByProjectIdAndUserId(issue.getProject().getId(), user.getId())
                .orElseThrow(()->
                        new AccessDeniedException("You are not a member of the project")
                );
        return IssueDto.builder()
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
                .build();
    }

    @Transactional
    public IssueDto updateIssue(Long issueId , UpdateIssueRequest request){
        User user = currentUser.get();
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(()->
                        new ResourceNotFoundException("No issue found for the given id ")
                );
        projectMemberRepository.findByProjectIdAndUserId(issue.getProject().getId(), user.getId())
                .orElseThrow(()->
                        new AccessDeniedException("You are not a member of the project")
                );
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setType(request.getType());
        issue.setPriority(request.getPriority());
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "No user found for the given assigneeId"
                            )
                    );
            issue.setAssignee(assignee);
        }
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

    @Transactional
    public IssueDto moveIssue(Long issueId , IssueStatus issueStatus){
        User user = currentUser.get();
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(()->
                        new ResourceNotFoundException("No issue exist for the given issue id")
                );
        projectMemberRepository.findByProjectIdAndUserId(issue.getProject().getId(), user.getId())
                .orElseThrow(()->
                        new AccessDeniedException("You are not a member of the project")
                );
        IssueStatus oldStatus = issue.getStatus();
        IssueStatus newStatus = issueStatus;
        if(oldStatus==newStatus){
            return IssueDto.builder()
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
                    .build();
        }else{
            StatusHistory history = new StatusHistory(
                    issue,
                    oldStatus,
                    newStatus,
                    user,
                    Instant.now()
            );
            statusHistoryRepository.save(history);
            issue.setStatus(newStatus);
            Issue savedIssue = issueRepository.save(issue);
            return IssueDto.builder()
                    .id(savedIssue.getId())
                    .issueKey(savedIssue.getIssueKey())
                    .workspaceId(savedIssue.getWorkspace().getId())
                    .projectId(savedIssue.getProject().getId())
                    .reporterId(savedIssue.getReporter().getId())
                    .assigneeId(
                            savedIssue.getAssignee() != null
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

    }

    @Transactional
    public IssueDto duplicateIssue(Long issueId) {
        User user = currentUser.get();

        Issue originalIssue = issueRepository.findById(issueId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No issue exists for the given issue id"
                        )
                );
        projectMemberRepository
                .findByProjectIdAndUserId(
                        originalIssue.getProject().getId(),
                        user.getId()
                )
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of the project"
                        )
                );
        Project project = projectRepository.findByIdWithLock(
                originalIssue.getProject().getId()
        ).orElseThrow(() ->
                new ResourceNotFoundException("Project not found")
        );
        Optional<ProjectIssueCounter> counter =
                projectIssueCounterRepository.findByProjectId(project.getId());

        ProjectIssueCounter issueCounter;

        if (counter.isEmpty()) {
            ProjectIssueCounter newCounter = new ProjectIssueCounter();
            newCounter.setProject(project);
            issueCounter = projectIssueCounterRepository.save(newCounter);
        } else {
            issueCounter = counter.get();
        }
        Long nextNumber = issueCounter.getNextNumber();

        String issueKey = project.getKeyPrefix() + "-" + nextNumber;

        issueCounter.setNextNumber(nextNumber + 1);

        projectIssueCounterRepository.save(issueCounter);
        Issue duplicate = new Issue(
                originalIssue.getTitle(),
                originalIssue.getDescription(),
                originalIssue.getType(),
                originalIssue.getPriority(),
                originalIssue.getWorkspace(),
                project,
                user,
                originalIssue.getAssignee()
        );

        duplicate.setIssueKey(issueKey);
        Issue savedIssue = issueRepository.save(duplicate);
        return IssueDto.builder()
                .id(savedIssue.getId())
                .issueKey(savedIssue.getIssueKey())
                .workspaceId(savedIssue.getWorkspace().getId())
                .projectId(savedIssue.getProject().getId())
                .reporterId(savedIssue.getReporter().getId())
                .assigneeId(
                        savedIssue.getAssignee() != null
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

    @Transactional
    public void deleteIssue(Long issueId){
        User user = CurrentUser.get();

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(()->
                        new ResourceNotFoundException("No issue found for the given id")
                );

        ProjectMember projectMember = projectMemberRepository
                .findByProjectIdAndUserId(
                        issue.getProject().getId(),
                        user.getId()
                )
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of the project"
                        )
                );

        if (projectMember.getRole() != ProjectRole.OWNER) {
            throw new AccessDeniedException(
                    "Only the project owner can delete issues"
            );
        }

        replyRepository.deleteByCommentIssueId(issueId);
        commentRepository.deleteByIssueId(issueId);
        statusHistoryRepository.deleteByIssueId(issueId);
        linkedCommitRepository.deleteByIssueId(issueId);

        issueRepository.delete(issue);
    }
}
    