package org.devflow.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiAskRequest {
    @NotBlank
    private String question;
}