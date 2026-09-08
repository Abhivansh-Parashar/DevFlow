package org.devflow.chat.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ReactionDto {
    private Long messageId;
    private Long userId;
    private String emoji;
}
