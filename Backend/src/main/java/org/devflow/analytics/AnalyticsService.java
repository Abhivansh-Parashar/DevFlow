package org.devflow.analytics;

import org.devflow.analytics.dto.AnalyticsDto;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.security.CurrentUser;
import org.devflow.user.User;
import org.devflow.workspace.WorkspaceMemberRepository;
import org.devflow.workspace.WorkspaceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final CurrentUser currentUser;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final AnalyticsCacheService analyticsCacheService;

    public AnalyticsService(
            CurrentUser currentUser,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            AnalyticsCacheService analyticsCacheService
    ) {
        this.currentUser = currentUser;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.analyticsCacheService = analyticsCacheService;
    }

    public AnalyticsDto getAnalytics(Long workspaceId) {

        User user = currentUser.get();

        workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No workspace found for the given id."
                        )
                );

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                workspaceId, user.getId())) {
            throw new AccessDeniedException(
                    "User does not belong to the given workspace."
            );
        }

        return analyticsCacheService.getAnalytics(workspaceId);
    }
}