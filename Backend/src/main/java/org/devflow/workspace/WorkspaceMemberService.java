package org.devflow.workspace;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceMemberService {
    private final WorkspaceMemberRepository memberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

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

    }

    public void deleteMember(Long workspaceId , Long userId){
        WorkspaceMemberId memberId = new WorkspaceMemberId(workspaceId,userId);
        WorkspaceMember member = memberRepository.findById(memberId)
                .orElseThrow();
        memberRepository.delete(member);
    }

    public void changeRole(Long workspaceId , Long userId, WorkspaceRole newRole){
        WorkspaceMemberId memberId =
                new WorkspaceMemberId(workspaceId, userId);

        WorkspaceMember member =
                memberRepository.findById(memberId)
                        .orElseThrow();

        member.setRole(newRole);
    }

    public List<WorkspaceMember> getMembers(Long workspaceId) {

        return memberRepository.findByWorkspaceId(workspaceId);
    }

    public List<WorkspaceMember> getUserMemberships(Long userId) {

        return memberRepository.findByUserId(userId);
    }
}
