
package org.devflow.auth;

import java.util.Map;

import org.devflow.auth.dto.AuthResponse;
import org.devflow.security.OAuthLoginCodeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/oauth")
public class OAuthLoginController {

    private final OAuthLoginCodeService codeService;

    public OAuthLoginController(OAuthLoginCodeService codeService) {
        this.codeService = codeService;
    }

    @PostMapping("/exchange")
    public ResponseEntity<?> exchangeCode(
            @RequestBody Map<String, String> request
    ) {
        String code = request.get("code");

        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Code is required."));
        }

        try {
            AuthResponse tokens = codeService.consumeCode(code);
            return ResponseEntity.ok(tokens);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Invalid or expired OAuth code."
                    ));
        }
    }
}
