package org.devflow.workspace;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.devflow.user.User;

import java.time.Instant;

@Entity
@Table(name = "workspace_member")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Setter
public class WorkspaceMember {
    @EmbeddedId
    private WorkspaceMemberId id;

    @MapsId("workspaceId")
    @ManyToOne(fetch = FetchType.LAZY , optional = false)
    @JoinColumn(name="workspace_id",nullable = false)
    private Workspace workspace;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private WorkspaceRole role;

    private Instant joinedAt;

    public WorkspaceMember(Workspace workspace, User user, WorkspaceRole role, Instant joinedAt) {
        this.workspace = workspace;
        this.user = user;
        this.role = role;
        this.joinedAt = joinedAt;
    }
}
