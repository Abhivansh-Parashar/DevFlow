package org.devflow.workspace;

import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.devflow.analytics.event.WorkspaceDashboardChangedEvent;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.devflow.security.CurrentUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceMemberService {
    private final WorkspaceMemberRepository memberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    private WorkspaceMember requireManager(Long workspaceId) {
        WorkspaceMember membership = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, CurrentUser.get().getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this workspace."));
        if (membership.getRole() != WorkspaceRole.OWNER && membership.getRole() != WorkspaceRole.ADMIN) {
            throw new AccessDeniedException("Only workspace owners and admins can manage members.");
        }
        return membership;
    }

    @Transactional
    public void addMember(Long workspaceId , Long userId){
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow();
        User user = userRepository.findById(userId)
                .orElseThrow();
        WorkspaceMemberId memberId = new WorkspaceMemberId(workspaceId,userId);
        if (memberRepository.existsById(memberId)) {
            throw new RuntimeException("User is already a member");
        }
        WorkspaceMember member =
                new WorkspaceMember(
                        workspace,
                        user,
                        WorkspaceRole.MEMBER,
                        Instant.now()
                );
        memberRepository.save(member);
        eventPublisher.publishEvent(
                new WorkspaceDashboardChangedEvent(workspaceId)
        );

    }

    @Transactional
    public void deleteMember(Long workspaceId , Long userId){
        WorkspaceMember manager = requireManager(workspaceId);
        if (userId.equals(CurrentUser.get().getId())) {
            throw new AccessDeniedException("You cannot remove yourself from this workspace.");
        }
        WorkspaceMemberId memberId = new WorkspaceMemberId(workspaceId,userId);
        WorkspaceMember member = memberRepository.findById(memberId)
                .orElseThrow();
        if (member.getRole() == WorkspaceRole.OWNER) {
            throw new AccessDeniedException("The workspace owner cannot be removed.");
        }
        if (manager.getRole() != WorkspaceRole.OWNER && member.getRole() == WorkspaceRole.ADMIN) {
            throw new AccessDeniedException("Only the workspace owner can remove an admin.");
        }
        memberRepository.delete(member);
        eventPublisher.publishEvent(
                new WorkspaceDashboardChangedEvent(workspaceId)
        );
    }

    @Transactional
    public void changeRole(Long workspaceId , Long userId, WorkspaceRole newRole){
        WorkspaceMember manager = requireManager(workspaceId);
        if (manager.getRole() != WorkspaceRole.OWNER) {
            throw new AccessDeniedException("Only workspace owners can change member roles.");
        }
        if (userId.equals(CurrentUser.get().getId())) {
            throw new AccessDeniedException("You cannot change your own workspace role.");
        }
        WorkspaceMemberId memberId =
                new WorkspaceMemberId(workspaceId, userId);

        WorkspaceMember member =
                memberRepository.findById(memberId)
                        .orElseThrow();

        if (newRole == WorkspaceRole.OWNER) {
            throw new IllegalArgumentException("A workspace can have only one owner.");
        }
        member.setRole(newRole);
    }

    public List<WorkspaceMember> getMembers(Long workspaceId) {

        return memberRepository.findByWorkspaceId(workspaceId);
    }

    public List<WorkspaceMember> getUserMemberships(Long userId) {

        return memberRepository.findByUserId(userId);
    }
}
