package org.devflow.issue;

import lombok.RequiredArgsConstructor;
import org.devflow.common.exception.AccessDeniedException;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.project.member.ProjectMemberRepository;
import org.devflow.security.CurrentUser;
import org.devflow.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final IssueRepository issueRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public Comment createComment(Long issueId , String body){
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
        Comment newComment = new Comment(issue,user,body);

        return commentRepository.save(newComment);
    }

    @Transactional(readOnly = true)
    public List<Comment> getCommentsByIssueId(Long issueId){
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(()->
                        new ResourceNotFoundException("Issue not found for the given id")
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
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId);
    }

    public Comment updateComment(Long commentId , String body){
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(()->
                        new ResourceNotFoundException("Comment not found for the given id")
                );
        User user  = CurrentUser.get();
        projectMemberRepository.findByProjectIdAndUserId(
                        comment.getIssue().getProject().getId(), user.getId()
                )
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of the project"
                        )
                );
        if (!comment.getAuthor().getId().equals(user.getId())){
            throw new AccessDeniedException("User is not the author of the comment");
        }
        comment.updateBody(body);
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId){
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(()->
                        new ResourceNotFoundException("Comment not found for the given id")
                );
        User user  = CurrentUser.get();
        projectMemberRepository.findByProjectIdAndUserId(
                        comment.getIssue().getProject().getId(), user.getId()
                )
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of the project"
                        )
                );
        if (!comment.getAuthor().getId().equals(user.getId())){
            throw new AccessDeniedException("User is not the author of the comment");
        }
        commentRepository.delete(comment);
    }
}
