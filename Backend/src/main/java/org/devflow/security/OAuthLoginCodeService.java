

package org.devflow.security;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;

import org.devflow.auth.dto.AuthResponse;
import org.springframework.stereotype.Service;

@Service
public class OAuthLoginCodeService {

    private static final long CODE_TTL_SECONDS = 60;

    private final SecureRandom secureRandom = new SecureRandom();

    private final ConcurrentHashMap<String, StoredCode> codes =
            new ConcurrentHashMap<>();

    public String createCode(AuthResponse authResponse) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);

        String code = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);

        codes.put(
                code,
                new StoredCode(
                        authResponse,
                        Instant.now().plusSeconds(CODE_TTL_SECONDS)
                )
        );

        return code;
    }

    public AuthResponse consumeCode(String code) {
        StoredCode stored = codes.remove(code);

        if (stored == null || Instant.now().isAfter(stored.expiresAt())) {
            throw new IllegalArgumentException(
                    "Invalid or expired OAuth login code."
            );
        }

        return stored.authResponse();
    }

    private record StoredCode(
            AuthResponse authResponse,
            Instant expiresAt
    ) {}
}
