
package org.devflow.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.devflow.auth.AuthService;
import org.devflow.auth.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
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

        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)
                || !(authentication.getPrincipal() instanceof OAuth2User googleUser)) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Unsupported OAuth authentication."
            );
            return;
        }

        String email = googleUser.getAttribute("email");
        Boolean emailVerified = googleUser.getAttribute("email_verified");
        String name = googleUser.getAttribute("name");
        String avatar = googleUser.getAttribute("picture");

        if (email == null || !Boolean.TRUE.equals(emailVerified)) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Google email is missing or not verified."
            );
            return;
        }

        AuthResponse authResponse =
                authService.loginWithGoogle(name, email, avatar);

        String oneTimeCode =
                loginCodeService.createCode(authResponse);

        String redirectUrl = frontendUrl
                + "/oauth/callback?code="
                + UriUtils.encode(oneTimeCode, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}
