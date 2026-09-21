package org.devflow.issue.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class ReplyDto{
    private Long id;
    private Long commentId;
    private Long authorId;
    private String body;
    private Instant createdAt;
}
