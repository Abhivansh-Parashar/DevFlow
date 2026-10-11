package org.devflow.analytics.event;

import org.devflow.analytics.DashboardCacheInvalidator;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class WorkspaceDashboardCacheListener {

    private final DashboardCacheInvalidator dashboardCacheInvalidator;

    public WorkspaceDashboardCacheListener(
            DashboardCacheInvalidator dashboardCacheInvalidator
    ) {
        this.dashboardCacheInvalidator = dashboardCacheInvalidator;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onWorkspaceDashboardChanged(
            WorkspaceDashboardChangedEvent event
    ) {
        dashboardCacheInvalidator.evictWorkspaceDashboard(
                event.workspaceId()
        );
    }
}