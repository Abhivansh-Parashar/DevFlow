package org.devflow.project;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.URL;

@Getter
@Setter
public class CreateProjectRequest {
    @NotBlank
    private String name;
    @URL
    private String repoUrl;
}
