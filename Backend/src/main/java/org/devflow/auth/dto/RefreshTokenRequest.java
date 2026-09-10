package org.devflow.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.devflow.auth.RefreshToken;

@Getter
@Setter
public class RefreshTokenRequest {
    @NotBlank
    private String token;
}
