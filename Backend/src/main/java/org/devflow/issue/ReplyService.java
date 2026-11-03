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
public class ReplyService {
    private final CommentRepository commentRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ReplyRepository replyRepository;

    @Transactional
    public Reply createReply(Long commentId , String body){
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
        Reply reply = new Reply(comment,user,body);
        return replyRepository.save(reply);
    }
    @Transactional(readOnly = true)
    public List<Reply> getRepliesByCommentId(Long commentId){
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
        return replyRepository.findByCommentIdOrderByCreatedAtAsc(commentId);
    }

    @Transactional
    public Reply updateReply(Long replyId , String body){
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(()->
                        new ResourceNotFoundException("Reply not found for the given id")
                );
        User user  = CurrentUser.get();
        projectMemberRepository.findByProjectIdAndUserId(
                        reply.getComment().getIssue().getProject().getId(), user.getId()
                )
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of the project"
                        )
                );
        if (!reply.getAuthor().getId().equals(user.getId())){
            throw new AccessDeniedException("User is not the author of the Reply");
        }
        reply.updateBody(body);
        return replyRepository.save(reply);
    }

    @Transactional
    public void deleteReply(Long replyId) {
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Reply not found for the given id")
                );
        User user = CurrentUser.get();
        projectMemberRepository.findByProjectIdAndUserId(
                        reply.getComment().getIssue().getProject().getId(), user.getId()
                )
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of the project"
                        )
                );
        if (!reply.getAuthor().getId().equals(user.getId())) {
            throw new AccessDeniedException("User is not the author of the Reply");
        }
        replyRepository.delete(reply);
    }
}
