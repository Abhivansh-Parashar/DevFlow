package org.devflow.project;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ProjectSequenceInitializer {

    private final JdbcTemplate jdbcTemplate;

    public ProjectSequenceInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void synchronizeProjectSequence() {
        jdbcTemplate.execute(
                "SELECT setval('project_id_seq', " +
                        "GREATEST(COALESCE((SELECT MAX(id) FROM project), 0) + 1, 1), false)"
        );
    }
}
