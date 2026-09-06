package org.devflow.project;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProjectRequest {
    @NotBlank
    private String name;
    private String repoUrl;
}
