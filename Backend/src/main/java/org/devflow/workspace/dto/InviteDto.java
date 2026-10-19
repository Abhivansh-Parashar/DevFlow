package org.devflow.workspace.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.devflow.workspace.InviteStatus;

import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class InviteDto {
    private UUID id;
    private Long workspaceId;
    private String workspaceName;
    private String email;
    private Long invitedById;
    private String status;
    private Instant expiresAt;
}
