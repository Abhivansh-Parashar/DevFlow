package org.devflow.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
