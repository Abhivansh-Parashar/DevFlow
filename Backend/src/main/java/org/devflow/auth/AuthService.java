package org.devflow.auth;

import jakarta.transaction.Transactional;
import org.devflow.auth.dto.AuthResponse;
import org.devflow.auth.dto.LoginRequest;
import org.devflow.auth.dto.RefreshTokenRequest;
import org.devflow.auth.dto.RegisterRequest;
import org.devflow.common.exception.InvalidCredentialsException;
import org.devflow.common.exception.UserAlreadyExistsException;
import org.devflow.security.JwtService;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.devflow.workspace.WorkspaceRole;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            RefreshTokenRepository refreshTokenRepository,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(
                    "User with the email already exists."
            );
        }

        String hashedPassword =
                passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .passwordHash(hashedPassword)
                .role(WorkspaceRole.MEMBER)
                .build();

        userRepository.save(user);

        String accessToken =
                jwtService.generateAccessToken(user);

        String refreshToken =
                jwtService.generateRefreshToken();

        String hashedRefreshToken =
                hashRefreshToken(refreshToken);

        RefreshToken refreshTokenEntity =
                RefreshToken.builder()
                        .user(user)
                        .tokenHash(hashedRefreshToken)
                        .expiresAt(LocalDateTime.now().plusDays(7))
                        .build();

        refreshTokenRepository.save(refreshTokenEntity);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String password = request.getPassword();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Credentials are wrong."
                        )
                );

        if (!passwordEncoder.matches(
                password,
                user.getPasswordHash()
        )) {
            throw new InvalidCredentialsException(
                    "Credentials are wrong."
            );
        }

        String accessToken =
                jwtService.generateAccessToken(user);

        String refreshToken =
                jwtService.generateRefreshToken();

        String hashedRefreshToken =
                hashRefreshToken(refreshToken);

        RefreshToken refreshTokenEntity =
                RefreshToken.builder()
                        .user(user)
                        .tokenHash(hashedRefreshToken)
                        .expiresAt(LocalDateTime.now().plusDays(7))
                        .build();

        refreshTokenRepository.save(refreshTokenEntity);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public AuthResponse loginWithGoogle(
            String name,
            String email,
            String avatar
    ) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .name(name)
                            .email(normalizedEmail)
                            .passwordHash(
                                    passwordEncoder.encode(
                                            UUID.randomUUID().toString()
                                    )
                            )
                            .role(WorkspaceRole.MEMBER)
                            .avatar(avatar)
                            .build();

                    return userRepository.save(newUser);
                });

        String accessToken =
                jwtService.generateAccessToken(user);

        String refreshToken =
                jwtService.generateRefreshToken();

        RefreshToken refreshTokenEntity =
                RefreshToken.builder()
                        .user(user)
                        .tokenHash(hashRefreshToken(refreshToken))
                        .expiresAt(LocalDateTime.now().plusDays(7))
                        .build();

        refreshTokenRepository.save(refreshTokenEntity);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {

        String rawRefreshToken = request.getToken();

        String hashedRefreshToken =
                hashRefreshToken(rawRefreshToken);

        RefreshToken storedToken =
                refreshTokenRepository
                        .findByTokenHashForUpdate(hashedRefreshToken)
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Invalid refresh token."
                                )
                        );

        LocalDateTime now = LocalDateTime.now();

        if (storedToken.getRevokedAt() != null) {
            throw new InvalidCredentialsException(
                    "Refresh token has been revoked."
            );
        }

        if (!storedToken.getExpiresAt().isAfter(now)) {
            throw new InvalidCredentialsException(
                    "Refresh token has expired."
            );
        }

        User user = storedToken.getUser();

        storedToken.setRevokedAt(now);
        refreshTokenRepository.save(storedToken);

        String newAccessToken =
                jwtService.generateAccessToken(user);

        String newRefreshToken =
                jwtService.generateRefreshToken();

        String newHashedRefreshToken =
                hashRefreshToken(newRefreshToken);

        RefreshToken newRefreshTokenEntity =
                RefreshToken.builder()
                        .user(user)
                        .tokenHash(newHashedRefreshToken)
                        .expiresAt(now.plusDays(7))
                        .build();

        refreshTokenRepository.save(newRefreshTokenEntity);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Transactional
    public void revokeRefreshToken(RefreshTokenRequest request) {

        String rawRefreshToken = request.getToken();

        String hashedRefreshToken =
                hashRefreshToken(rawRefreshToken);

        RefreshToken storedToken =
                refreshTokenRepository
                        .findByTokenHashForUpdate(hashedRefreshToken)
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "No refresh token found."
                                )
                        );

        if (storedToken.getRevokedAt() != null) {
            return;
        }

        storedToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(storedToken);
    }

    private String hashRefreshToken(String token) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            token.getBytes(StandardCharsets.UTF_8)
                    );

            StringBuilder hex = new StringBuilder();

            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }

            return hex.toString();

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(
                    "SHA-256 algorithm not available.",
                    e
            );
        }
    }
}