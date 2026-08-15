package org.devflow.entity;
//project, user, role, joinedAt; composite key.

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.devflow.enums.Role;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@IdClass(ProjectMember.ProjectMemberKey.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMember {

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id")
    private Project project;

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Role role;

    private LocalDateTime joinedAt;

    @PrePersist
    private void setJoinedAt() {
        joinedAt = LocalDateTime.now();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ProjectMemberKey implements Serializable {
        private Long project;
        private Long user;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof ProjectMemberKey that)) return false;
            return Objects.equals(project, that.project) && Objects.equals(user, that.user);
        }

        @Override
        public int hashCode() {
            return Objects.hash(project, user);
        }
    }
}