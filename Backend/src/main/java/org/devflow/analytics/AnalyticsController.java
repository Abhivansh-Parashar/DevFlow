package org.devflow.analytics;

import org.devflow.analytics.dto.AnalyticsDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workspaces")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/{workspaceId}/analytics")
    public ResponseEntity<AnalyticsDto> getAnalytics(
            @PathVariable Long workspaceId
    ) {
        return ResponseEntity.ok(
                analyticsService.getAnalytics(workspaceId)
        );
    }
}