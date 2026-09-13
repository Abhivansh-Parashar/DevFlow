package org.devflow.project.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectDto {
    private Long id;
    private String name;
    private String keyPrefix;
    private Long workspaceId;
    private String repoUrl;
}
