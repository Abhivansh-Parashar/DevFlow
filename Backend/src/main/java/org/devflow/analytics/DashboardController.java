package org.devflow.analytics;

import org.devflow.analytics.dto.DashboardStatsDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workspaces")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/{workspaceId}/dashboard")
    public ResponseEntity<DashboardStatsDto> getDashboard(
            @PathVariable Long workspaceId
    ) {
        return ResponseEntity.ok(
                dashboardService.getDashboardStats(workspaceId)
        );
    }
}