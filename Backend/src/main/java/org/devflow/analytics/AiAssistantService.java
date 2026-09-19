package org.devflow.analytics;

import org.devflow.ai.dto.AiAskRequest;
import org.devflow.ai.dto.AiAskResponse;
import org.devflow.ai.dto.ProjectSnapshotDto;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.issue.Issue;
import org.devflow.issue.IssueRepository;
import org.devflow.issue.IssueStatus;
import org.devflow.project.Project;
import org.devflow.project.ProjectRepository;
import org.devflow.project.member.ProjectMemberRepository;
import org.devflow.user.UserService;
import org.devflow.user.dto.UserDto;
import org.devflow.workspace.WorkspaceMemberRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiAssistantService {
    private final UserService userService;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final IssueRepository issueRepository;


    public AiAssistantService(
            UserService userService,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            IssueRepository issueRepository)
    {
        this.userService = userService;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.issueRepository = issueRepository;
    }

    public AiAskResponse ask(Long projectId, AiAskRequest request) {
        UserDto currentUser = userService.getCurrentUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> {
                            throw new ResourceNotFoundException("No project found for the given id.");
                        }
                );

        if(!projectMemberRepository.existsByProjectIdAndUserId(projectId, currentUser.getId())){
            throw new AccessDeniedException("User does not belong to the given project.");
        }

        List<Issue> issues = issueRepository.findByProjectId(projectId);

        long totalIssues = issues.size();

        long openIssues = issues.stream()
                .filter(x -> x.getStatus().equals(IssueStatus.IN_PROGRESS)
                        || x.getStatus().equals(IssueStatus.TODO))
                .count();

        long completedIssues = issues.stream()
                .filter(x -> x.getStatus().equals(IssueStatus.DONE))
                .count();

        long memberCount = projectMemberRepository.countByProjectId(projectId);

        ProjectSnapshotDto projectSnapshotDto = ProjectSnapshotDto.builder()
                .projectId(projectId)
                .projectName(project.getName())
                .issueCount(totalIssues)
                .openIssueCount(openIssues)
                .completedIssueCount(completedIssues)
                .memberCount(memberCount)
                .build();

        String answer = "Dummy answer";

        return AiAskResponse.builder().answer(answer).build();
    }
}
