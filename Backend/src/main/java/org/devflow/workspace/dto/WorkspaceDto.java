package org.devflow.workspace.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;
import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class WorkspaceDto {

    private Long id;
    private String name;
    private String slug;
    private Long ownerId;
    private Instant createdAt;
    private Instant updatedAt;
    private List<Long> memberIds;
    private Map<Long, String> roles;

    public WorkspaceDto(Long id, String name, String slug, Long ownerId, Instant createdAt, Instant updatedAt) {
        this(id, name, slug, ownerId, createdAt, updatedAt, List.of(ownerId), Map.of(ownerId, "OWNER"));
    }
}
