package org.devflow.workspace.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateInviteRequest {
    private Long workspaceId;
    @NotBlank
    @Email
    private String email;
}
