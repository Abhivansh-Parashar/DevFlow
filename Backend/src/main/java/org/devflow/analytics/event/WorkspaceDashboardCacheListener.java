package org.devflow.analytics.event;

import org.devflow.analytics.AnalyticsCacheInvalidator;
import org.devflow.analytics.DashboardCacheInvalidator;
import org.devflow.analytics.event.WorkspaceDashboardChangedEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class WorkspaceDashboardCacheListener {

    private final DashboardCacheInvalidator dashboardCacheInvalidator;
    private final AnalyticsCacheInvalidator analyticsCacheInvalidator;

    public WorkspaceDashboardCacheListener(
            DashboardCacheInvalidator dashboardCacheInvalidator,
            AnalyticsCacheInvalidator analyticsCacheInvalidator
    ) {
        this.dashboardCacheInvalidator = dashboardCacheInvalidator;
        this.analyticsCacheInvalidator = analyticsCacheInvalidator;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onWorkspaceDashboardChanged(
            WorkspaceDashboardChangedEvent event
    ) {
        Long workspaceId = event.workspaceId();

        dashboardCacheInvalidator.evictWorkspaceDashboard(workspaceId);
        analyticsCacheInvalidator.evictWorkspaceAnalytics(workspaceId);
    }
}