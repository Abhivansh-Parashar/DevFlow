package org.devflow.chat.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter @Builder
public class ChatMessageDto {
    private Long id;
    private Long senderId;
    private String content;
    private String clientId;
    private LocalDateTime createdAt;
}
