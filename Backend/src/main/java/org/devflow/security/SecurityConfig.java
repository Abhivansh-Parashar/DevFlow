
package org.devflow.security;

import org.devflow.user.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final OAuth2AuthenticationSuccessHandler oauthSuccessHandler;

    public SecurityConfig(
            JwtService jwtService,
            UserRepository userRepository,
            OAuth2AuthenticationSuccessHandler oauthSuccessHandler
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.oauthSuccessHandler = oauthSuccessHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.IF_REQUIRED
                        )
                )
                .authorizeHttpRequests(request -> request
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/refresh",
                                "/api/auth/oauth/exchange",
                                "/oauth2/**",
                                "/login/oauth2/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth ->
                        oauth.successHandler(oauthSuccessHandler)
                )
                .addFilterBefore(
                        new JwtAuthFilter(jwtService, userRepository),
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }
}
