package org.devflow.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SendMessageRequest {
    @NotBlank
    private String content;
    @NotNull
    private Long clientId;
}
