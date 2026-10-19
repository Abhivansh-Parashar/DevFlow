
package org.devflow.workspace;

import lombok.RequiredArgsConstructor;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.security.CurrentUser;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.devflow.workspace.dto.CreateWorkspaceRequest;
import org.devflow.workspace.dto.InviteDto;
import org.devflow.workspace.dto.WorkspaceDto;
import org.devflow.workspace.dto.WorkspaceMemberDto;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository repo;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final InviteRepository inviteRepository;

    @Transactional
    public WorkspaceDto createWorkspace(CreateWorkspaceRequest request) {
        User user = CurrentUser.get();

        String slug = request.getName().trim().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");

        if (slug.isBlank() || repo.existsBySlug(slug)) {
            throw new IllegalArgumentException("Slug already exists");
        }

        Workspace savedWorkspace = repo.save(
                new Workspace(request.getName().trim(), slug, user)
        );

        memberRepository.save(
                new WorkspaceMember(
                        savedWorkspace,
                        user,
                        WorkspaceRole.OWNER,
                        Instant.now()
                )
        );

        return toDto(savedWorkspace);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDto> listCurrentUserWorkspaces() {
        return memberRepository
                .findByUserId(CurrentUser.get().getId())
                .stream()
                .map(WorkspaceMember::getWorkspace)
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberDto> listMembers(Long workspaceId) {
        requireMember(workspaceId);

        return memberRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(member -> new WorkspaceMemberDto(
                        member.getUser().getId(),
                        member.getUser().getName(),
                        member.getUser().getEmail(),
                        member.getUser().getAvatar(),
                        member.getUser().isOnline(),
                        member.getRole().name(),
                        member.getJoinedAt()
                ))
                .toList();
    }

    @Transactional
    public InviteDto createInvite(Long workspaceId, String email) {
        User inviter = CurrentUser.get();
        Workspace workspace = requireMember(workspaceId);

        WorkspaceMember membership = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, inviter.getId())
                .orElseThrow();

        if (membership.getRole() == WorkspaceRole.MEMBER) {
            throw new AccessDeniedException(
                    "Only workspace owners and admins can invite members."
            );
        }

        String normalizedEmail = email.trim().toLowerCase();

        if (normalizedEmail.equals(inviter.getEmail().toLowerCase())) {
            throw new IllegalArgumentException(
                    "You are already a member of this workspace."
            );
        }

        User target = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (target != null &&
                memberRepository.existsByWorkspaceIdAndUserId(
                        workspaceId, target.getId())) {
            throw new IllegalArgumentException(
                    "That user is already a workspace member."
            );
        }

        if (inviteRepository.existsByWorkspaceIdAndEmailIgnoreCaseAndStatus(
                workspaceId, normalizedEmail, InviteStatus.PENDING)) {
            throw new IllegalArgumentException(
                    "A pending invitation already exists for this email."
            );
        }

        Invite invite = inviteRepository.save(
                new Invite(
                        workspace,
                        normalizedEmail,
                        inviter,
                        UUID.randomUUID().toString(),
                        Instant.now().plusSeconds(7L * 24 * 60 * 60)
                )
        );

        return toInviteDto(invite);
    }

    @Transactional(readOnly = true)
    public List<InviteDto> listCurrentUserInvites() {
        User currentUser = CurrentUser.get();

        return inviteRepository
                .findByEmailIgnoreCaseAndStatus(
                        currentUser.getEmail(),
                        InviteStatus.PENDING
                )
                .stream()
                .filter(invite ->
                        invite.getExpiresAt().isAfter(Instant.now()))
                .map(this::toInviteDto)
                .toList();
    }

    @Transactional
    public WorkspaceDto acceptInvite(UUID inviteId) {
        User currentUser = CurrentUser.get();

        Invite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invitation not found."));

        if (!invite.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new AccessDeniedException(
                    "This invitation belongs to another account."
            );
        }

        if (invite.getStatus() != InviteStatus.PENDING
                || invite.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException(
                    "This invitation is no longer available."
            );
        }

        Workspace workspace = invite.getWorkspace();

        if (!memberRepository.existsByWorkspaceIdAndUserId(
                workspace.getId(), currentUser.getId())) {
            memberRepository.save(
                    new WorkspaceMember(
                            workspace,
                            currentUser,
                            WorkspaceRole.MEMBER,
                            Instant.now()
                    )
            );
        }

        invite.setStatus(InviteStatus.ACCEPTED);
        inviteRepository.save(invite);

        return toDto(workspace);
    }

    @Transactional
    public void declineInvite(UUID inviteId) {
        User currentUser = CurrentUser.get();

        Invite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invitation not found."));

        if (!invite.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new AccessDeniedException(
                    "This invitation belongs to another account."
            );
        }

        invite.setStatus(InviteStatus.DECLINED);
        inviteRepository.save(invite);
    }

    private Workspace requireMember(Long workspaceId) {
        Workspace workspace = repo.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Workspace not found."));

        if (!memberRepository.existsByWorkspaceIdAndUserId(
                workspaceId, CurrentUser.get().getId())) {
            throw new AccessDeniedException(
                    "You are not a member of this workspace."
            );
        }

        return workspace;
    }

    private WorkspaceDto toDto(Workspace workspace) {
        List<WorkspaceMember> members =
                memberRepository.findByWorkspaceId(workspace.getId());

        return new WorkspaceDto(
                workspace.getId(),
                workspace.getName(),
                workspace.getSlug(),
                workspace.getOwner().getId(),
                workspace.getCreatedAt(),
                workspace.getUpdatedAt(),
                members.stream()
                        .map(member -> member.getUser().getId())
                        .toList(),
                members.stream().collect(Collectors.toMap(
                        member -> member.getUser().getId(),
                        member -> member.getRole().name(),
                        (first, ignored) -> first
                ))
        );
    }

    private InviteDto toInviteDto(Invite invite) {
        return new InviteDto(
                invite.getId(),
                invite.getWorkspace().getId(),
                invite.getWorkspace().getName(),
                invite.getEmail(),
                invite.getInvitedBy().getId(),
                invite.getStatus().name(),
                invite.getExpiresAt()
        );
    }
}
