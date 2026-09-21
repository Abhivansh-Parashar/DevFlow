package org.devflow.workspace.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.devflow.workspace.InviteStatus;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class InviteDto {
    private Long id;
    private Long workspaceId;
    private String email;
    private Long invitedById;
    private InviteStatus status;
    private Instant expiresAt;
}
