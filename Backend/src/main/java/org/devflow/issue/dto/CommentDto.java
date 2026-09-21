package org.devflow.issue.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class CommentDto {
    private Long id;
    private Long issueId;
    private Long authorId;
    private String body;
    private Instant createdAt;
}
