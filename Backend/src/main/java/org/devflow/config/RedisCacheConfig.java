
package org.devflow.config;

import java.time.Duration;
import java.util.Map;

import org.devflow.analytics.dto.AnalyticsDto;
import org.devflow.analytics.dto.DashboardStatsDto;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    public RedisCacheManager cacheManager(
            RedisConnectionFactory connectionFactory
    ) {
        RedisCacheConfiguration defaultConfig =
                RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofMinutes(5))
                        .disableCachingNullValues()
                        .prefixCacheNameWith("devflow:");

        RedisCacheConfiguration dashboardConfig =
                defaultConfig
                        .entryTtl(Duration.ofSeconds(60))
                        .serializeValuesWith(
                                RedisSerializationContext.SerializationPair
                                        .fromSerializer(
                                                new JacksonJsonRedisSerializer<>(
                                                        DashboardStatsDto.class
                                                )
                                        )
                        );

        RedisCacheConfiguration analyticsConfig =
                defaultConfig
                        .entryTtl(Duration.ofMinutes(5))
                        .serializeValuesWith(
                                RedisSerializationContext.SerializationPair
                                        .fromSerializer(
                                                new JacksonJsonRedisSerializer<>(
                                                        AnalyticsDto.class
                                                )
                                        )
                        );

        Map<String, RedisCacheConfiguration> cacheConfigs = Map.of(
                "dashboardStats", dashboardConfig,
                "analytics", analyticsConfig
        );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .disableCreateOnMissingCache()
                .build();
    }
}
