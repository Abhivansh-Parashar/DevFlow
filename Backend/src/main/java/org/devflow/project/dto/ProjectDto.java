package org.devflow.project.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
public class ProjectDto {
    private Long id;
    private String name;
    private String keyPrefix;
    private Long workspaceId;
    private String repoUrl;
    private List<Long> memberIds;
    private Map<Long, String> roles;
}
