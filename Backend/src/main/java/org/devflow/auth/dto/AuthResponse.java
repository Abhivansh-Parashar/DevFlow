package org.devflow.auth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.devflow.user.dto.UserDto;

@Getter
@Setter
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserDto user;
}