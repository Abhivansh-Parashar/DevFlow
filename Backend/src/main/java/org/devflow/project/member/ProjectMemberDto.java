package org.devflow.project.member;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.devflow.project.ProjectRole;

@Getter
@Setter
@Builder
public class ProjectMemberDto {

    private Long projectId;
    private Long userId;
    private ProjectRole role;
}