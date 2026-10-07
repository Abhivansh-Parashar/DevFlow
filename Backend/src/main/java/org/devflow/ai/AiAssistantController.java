package org.devflow.ai;

import org.devflow.ai.dto.AiAskRequest;
import org.devflow.ai.dto.AiAskResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/ai")
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    public AiAssistantController(AiAssistantService aiAssistantService) {
        this.aiAssistantService = aiAssistantService;
    }

    @PostMapping("/ask")
    public ResponseEntity<AiAskResponse> ask(
            @PathVariable Long projectId,
            @RequestBody AiAskRequest request
    ) {
        return ResponseEntity.ok(
                aiAssistantService.ask(projectId, request)
        );
    }
}