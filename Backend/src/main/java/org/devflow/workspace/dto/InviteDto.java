package org.devflow.workspace.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;


@Getter
@AllArgsConstructor
public class InviteDto {
    private Long id;
    private Long workspaceId;
    private String workspaceName;
    private String email;
    private Long invitedById;
    private String status;
    private Instant expiresAt;
}
