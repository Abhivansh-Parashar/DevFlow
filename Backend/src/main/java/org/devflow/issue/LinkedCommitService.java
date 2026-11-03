package org.devflow.issue;

import lombok.RequiredArgsConstructor;
import org.devflow.common.exception.AccessDeniedException;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.project.member.ProjectMemberRepository;
import org.devflow.security.CurrentUser;
import org.devflow.user.User;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LinkedCommitService {
    private final LinkedCommitRepository linkedCommitRepository;
    private final IssueRepository issueRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public LinkedCommit linkCommit(
            Long issueId,
            String repo,
            String commitHash,
            String commitMessage,
            Instant committedAt
    ){
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(()->
                        new ResourceNotFoundException("No issue found for the given issue id")
                );
        User user  = CurrentUser.get();
        projectMemberRepository.findByProjectIdAndUserId(
                        issue.getProject().getId(), user.getId()
                )
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of the project"
                        )
                );
        LinkedCommit linkedCommit=new LinkedCommit(issue,repo,commitHash,commitMessage,committedAt);
        return linkedCommitRepository.save(linkedCommit);
    }

    public List<LinkedCommit> getCommitByIssueId(Long issueId){
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(()->
                        new ResourceNotFoundException("No issue found for the given issue id")
                );
        User user  = CurrentUser.get();
        projectMemberRepository.findByProjectIdAndUserId(
                        issue.getProject().getId(), user.getId()
                )
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of the project"
                        )
                );
        return linkedCommitRepository
                .findByIssueIdOrderByCommittedAtDesc(issueId);
    }
}
