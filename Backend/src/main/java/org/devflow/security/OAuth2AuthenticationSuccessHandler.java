package org.devflow.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.devflow.auth.AuthService;
import org.devflow.auth.dto.AuthResponse;
import org.devflow.security.OAuthLoginCodeService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriUtils;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2AuthenticationSuccessHandler
        implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final OAuthLoginCodeService loginCodeService;
    private final String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(
            AuthService authService,
            OAuthLoginCodeService loginCodeService,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.authService = authService;
        this.loginCodeService = loginCodeService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Unsupported OAuth authentication."
            );
            return;
        }

        String registrationId = oauthToken.getAuthorizedClientRegistrationId();
        OAuth2User oauthUser = oauthToken.getPrincipal();

        String name;
        String email;
        String avatar;

        switch (registrationId) {
            case "google" -> {
                name = oauthUser.getAttribute("name");
                email = oauthUser.getAttribute("email");
                avatar = oauthUser.getAttribute("picture");

                Boolean emailVerified = oauthUser.getAttribute("email_verified");

                if (email == null || !Boolean.TRUE.equals(emailVerified)) {
                    response.sendError(
                            HttpServletResponse.SC_UNAUTHORIZED,
                            "Google email is missing or not verified."
                    );
                    return;
                }

                AuthResponse authResponse =
                        authService.loginWithGoogle(name, email, avatar);

                redirectWithCode(response, authResponse);
            }

            case "github" -> {
                response.sendError(
                        HttpServletResponse.SC_NOT_IMPLEMENTED,
                        "GitHub profile handling is not implemented yet."
                );
            }

            default -> response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Unsupported OAuth provider."
            );
        }
    }

    private void redirectWithCode(
            HttpServletResponse response,
            AuthResponse authResponse
    ) throws IOException {

        String oneTimeCode = loginCodeService.createCode(authResponse);

        String redirectUrl = frontendUrl
                + "/oauth/callback?code="
                + UriUtils.encode(oneTimeCode, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}
