package org.devflow.analytics.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
public class CommitDto {
    private Long id;
    private Long projectId;
    private Long authorId;
    private String message;
    private String commitHash;
    private LocalDateTime createdAt;
}
