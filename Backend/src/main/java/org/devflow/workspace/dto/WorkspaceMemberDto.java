package org.devflow.workspace.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class WorkspaceMemberDto {
    private Long userId;
    private String name;
    private String email;
    private String avatar;
    private boolean online;
    private String role;
    private Instant joinedAt;
}
