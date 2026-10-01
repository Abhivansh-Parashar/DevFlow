package org.devflow.workspace;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class WorkspaceMemberId implements Serializable {

    private Long workspaceId;
    private Long userId;
}
