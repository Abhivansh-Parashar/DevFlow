package org.devflow.workspace.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class WorkspaceDto {

    private UUID id;
    private String name;
    private String slug;
    private UUID ownerId;
    private Instant createdAt;
    private Instant updatedAt;
}
