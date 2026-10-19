package org.devflow.workspace;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.devflow.workspace.dto.CreateInviteRequest;
import org.devflow.workspace.dto.CreateWorkspaceRequest;
import org.devflow.workspace.dto.InviteDto;
import org.devflow.workspace.dto.WorkspaceDto;
import org.devflow.workspace.dto.WorkspaceMemberDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    @GetMapping("/workspaces")
    public ResponseEntity<List<WorkspaceDto>> listWorkspaces() {
        return ResponseEntity.ok(workspaceService.listCurrentUserWorkspaces());
    }

    @PostMapping("/workspaces")
    public ResponseEntity<WorkspaceDto> createWorkspace(@Valid @RequestBody CreateWorkspaceRequest request) {
        return ResponseEntity.status(201).body(workspaceService.createWorkspace(request));
    }

    @GetMapping("/workspaces/{workspaceId}/members")
    public ResponseEntity<List<WorkspaceMemberDto>> listMembers(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(workspaceService.listMembers(workspaceId));
    }

    @PostMapping("/workspaces/{workspaceId}/invites")
    public ResponseEntity<InviteDto> invite(
            @PathVariable Long workspaceId,
            @Valid @RequestBody CreateInviteRequest request
    ) {
        return ResponseEntity.status(201).body(workspaceService.createInvite(workspaceId, request.getEmail()));
    }

    @GetMapping("/invites")
    public ResponseEntity<List<InviteDto>> listInvites() {
        return ResponseEntity.ok(workspaceService.listCurrentUserInvites());
    }

    @PostMapping("/invites/{inviteId}/accept")
    public ResponseEntity<WorkspaceDto> acceptInvite(@PathVariable UUID inviteId) {
        return ResponseEntity.ok(workspaceService.acceptInvite(inviteId));
    }

    @PostMapping("/invites/{inviteId}/decline")
    public ResponseEntity<Void> declineInvite(@PathVariable UUID inviteId) {
        workspaceService.declineInvite(inviteId);
        return ResponseEntity.noContent().build();
    }
}
