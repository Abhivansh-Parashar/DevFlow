package org.devflow.invite;

import lombok.RequiredArgsConstructor;
import org.devflow.common.exception.AccessDeniedException;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.security.CurrentUser;
import org.devflow.user.User;
import org.devflow.workspace.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InviteService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
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

    }
}
