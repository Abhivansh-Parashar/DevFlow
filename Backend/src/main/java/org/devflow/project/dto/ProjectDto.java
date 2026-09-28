package org.devflow.project.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProjectDto {
    private Long id;
    private String name;
    private String keyPrefix;
    private Long workspaceId;
    private String repoUrl;
}
