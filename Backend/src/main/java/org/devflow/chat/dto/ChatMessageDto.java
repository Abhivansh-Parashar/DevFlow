package org.devflow.chat.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
public class ChatMessageDto {
    private Long id;
    private Long senderId;
    private String content;
    private Long clientId;
    private LocalDateTime createdAt;
}
