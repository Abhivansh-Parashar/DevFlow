package org.devflow.analytics;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Component;

@Component
public class DashboardCacheInvalidator {

    @CacheEvict(
            cacheNames = "dashboardStats",
            key = "#workspaceId"
    )
    public void evictWorkspaceDashboard(Long workspaceId) {
    }
}