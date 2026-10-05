package org.devflow.issue;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.devflow.project.Project;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectIssueCounter {
    @Id
    @GeneratedValue
    private Long id;

    @OneToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "project_id",nullable = false , unique = true)
    private Project project;

    private Long nextNumber=1L;


}
