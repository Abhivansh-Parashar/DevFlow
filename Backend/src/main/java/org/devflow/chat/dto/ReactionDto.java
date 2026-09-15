package org.devflow.chat.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Builder
public class ReactionDto {
    private Long messageId;
    private Long userId;
    private String emoji;
}
