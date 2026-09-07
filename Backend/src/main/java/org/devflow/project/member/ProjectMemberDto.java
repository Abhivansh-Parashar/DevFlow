package org.devflow.project.member;

import lombok.Getter;
import lombok.Setter;
import org.devflow.project.ProjectRole;

@Getter @Setter
public class ProjectMemberDto {
    private Long id;
    private Long userId;
    private ProjectRole role;
}
