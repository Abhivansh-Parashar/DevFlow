package org.devflow.project.member;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.devflow.project.ProjectRole;

@Getter @Setter
public class UpdateProjectMemberRequest {
    @NotNull
    private ProjectRole role;
}
