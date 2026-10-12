package org.devflow.analytics;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Component;

@Component
public class AnalyticsCacheInvalidator {

    @CacheEvict(cacheNames = "analytics", key = "#workspaceId")
    public void evictWorkspaceAnalytics(Long workspaceId) {

    }
}