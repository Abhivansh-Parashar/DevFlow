package org.devflow.invite;

import lombok.RequiredArgsConstructor;
import org.devflow.common.exception.AccessDeniedException;
import org.devflow.common.exception.InviteExpiredException;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.security.CurrentUser;
import org.devflow.user.User;
import org.devflow.workspace.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InviteService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final InviteRepository inviteRepository;
    private final WorkspaceMemberService workspaceMemberService;

    @Transactional
    public Invite createInvite(Long workspaceId , String email){
        User user = CurrentUser.get();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(()->
                        new ResourceNotFoundException("Workspace not found for the given id")
                );
        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, user.getId())
                .orElseThrow(() ->
                        new AccessDeniedException("You are not a member of this workspace")
                );

        if (member.getRole() != WorkspaceRole.ADMIN) {
            throw new AccessDeniedException("Only admins can invite members");
        }
        if (inviteRepository.existsByWorkspaceIdAndEmailIgnoreCaseAndStatus(
                workspaceId, email, InviteStatus.PENDING)) {
            throw new IllegalStateException(
                    "A pending invite already exists for this email"
            );
        }
        SecureRandom secureRandom = new SecureRandom();

        byte[] tokenBytes = new byte[32];

        secureRandom.nextBytes(tokenBytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(tokenBytes);
        Instant expiresAt = Instant.now().plus(7, ChronoUnit.DAYS);
        Invite invite = new Invite(workspace,email,user,token,expiresAt);
        return inviteRepository.save(invite);
    }

    @Transactional(readOnly = true)
    public List<Invite> getPendingInvites(Long workspaceId){
        User user = CurrentUser.get();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(()->
                        new ResourceNotFoundException("Workspace not found for the given id")
                );
        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, user.getId())
                .orElseThrow(() ->
                        new AccessDeniedException("You are not a member of this workspace")
                );

        if (member.getRole() != WorkspaceRole.ADMIN) {
            throw new AccessDeniedException("Only admins can view pending invites");
        }
        return inviteRepository.findByWorkspaceIdAndStatus(
                workspaceId, InviteStatus.PENDING
        );
    }

    @Transactional(noRollbackFor = InviteExpiredException.class)
    public void acceptInvite(String token){
        User user = CurrentUser.get();

        Invite invite = inviteRepository.findByToken(token)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invite not found")
                );
        if(invite.getStatus()!=InviteStatus.PENDING){
            throw new IllegalStateException("This invitation has already been used");
        }
        if(invite.getExpiresAt().isBefore(Instant.now())){
            invite.setStatus(InviteStatus.EXPIRED);
            inviteRepository.save(invite);
            throw new InviteExpiredException("This invitaton has expired ");
        }
        if (!user.getEmail().equalsIgnoreCase(invite.getEmail())) {
            throw new AccessDeniedException("This invitation belongs to a different email address");
        }
        workspaceMemberService.addMember(invite.getWorkspace().getId(), user.getId());
        invite.setStatus(InviteStatus.ACCEPTED);
        inviteRepository.save(invite);

    }

    @Transactional
    public void declineInvite(String token) {

        User user = CurrentUser.get();

        Invite invite = inviteRepository.findByToken(token)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invite not found")
                );

        if (invite.getStatus() != InviteStatus.PENDING) {
            throw new IllegalStateException(
                    "This invitation has already been used"
            );
        }

        if (!user.getEmail().equalsIgnoreCase(invite.getEmail())) {
            throw new AccessDeniedException(
                    "This invitation belongs to a different email address"
            );
        }

        if (invite.getExpiresAt().isBefore(Instant.now())) {
            invite.setStatus(InviteStatus.EXPIRED);
            inviteRepository.save(invite);

            throw new InviteExpiredException(
                    "This invitation has expired"
            );
        }

        invite.setStatus(InviteStatus.DECLINED);

        inviteRepository.save(invite);
    }

}
