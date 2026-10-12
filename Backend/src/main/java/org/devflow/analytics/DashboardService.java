
package org.devflow.analytics;

import org.devflow.analytics.dto.DashboardStatsDto;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.security.CurrentUser;
import org.devflow.user.User;
import org.devflow.workspace.WorkspaceMemberRepository;
import org.devflow.workspace.WorkspaceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final CurrentUser currentUser;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final DashboardStatsCacheService dashboardStatsCacheService;

    public DashboardService(
            CurrentUser currentUser,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            DashboardStatsCacheService dashboardStatsCacheService
    ) {
        this.currentUser = currentUser;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.dashboardStatsCacheService = dashboardStatsCacheService;
    }

    public DashboardStatsDto getDashboardStats(Long workspaceId) {

        User user = currentUser.get();

        workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No workspace found for the given id."
                        )
                );

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                workspaceId,
                user.getId()
        )) {
            throw new AccessDeniedException(
                    "User does not belong to the given workspace."
            );
        }

        return dashboardStatsCacheService.getDashboardStats(workspaceId);
    }
}
