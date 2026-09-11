package org.devflow.auth;

import org.devflow.auth.dto.AuthResponse;
import org.devflow.auth.dto.LoginRequest;
import org.devflow.auth.dto.RefreshTokenRequest;
import org.devflow.auth.dto.RegisterRequest;
import org.devflow.common.exception.InvalidCredentialsException;
import org.devflow.common.exception.UserAlreadyExistsException;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.devflow.workspace.WorkspaceRole;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {
    private UserRepository userRepository;
    private BCryptPasswordEncoder passwordEncoder;
    private RefreshTokenRepository refreshTokenRepository;
    private JwtService jwtService;

    public AuthService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, RefreshTokenRepository refreshTokenRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request){
        String email = request.getEmail();
        if(userRepository.existsByEmail(email)){
            throw new UserAlreadyExistsException("User with the email already exists.");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                        .name(request.getName())
                        .email(email)
                        .passwordHash(hashedPassword)
                        .role(WorkspaceRole.MEMBER)
                        .build();

        userRepository.save(user);

//        JWT LEFT
    }

    public AuthResponse login(LoginRequest request){
        String email = request.getEmail();
        String password = request.getPassword();

        if(!userRepository.existsByEmail(email)){
            throw new InvalidCredentialsException("Credentials are wrong.");
        }
        User user = userRepository.findByEmail(email);

        if(!passwordEncoder.matches(password, user.getPasswordHash())){
            throw new InvalidCredentialsException("Credentials are wrong.");
        }

//        JWT LEFT
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {

        String refreshToken = request.getToken();

        RefreshToken storedToken = refreshTokenRepository
                .findByTokenHash(refreshToken)
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid refresh token."));

        if (storedToken.getRevokedAt() != null) {
            throw new InvalidCredentialsException("Refresh token has been revoked.");
        }

        if (storedToken.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new InvalidCredentialsException("Refresh token has expired.");
        }

        // Revoke old refresh token
        storedToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(storedToken);

        // JWT + new refresh token LEFT
        return null;
    }

    public void revokeRefreshToken(RefreshTokenRequest request) {
        String token = request.getToken();

        RefreshToken storedToken = refreshTokenRepository
                .findByTokenHash(token)
                .orElseThrow(() -> new InvalidCredentialsException("No refresh token found."));

        storedToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(storedToken);
    }

}
