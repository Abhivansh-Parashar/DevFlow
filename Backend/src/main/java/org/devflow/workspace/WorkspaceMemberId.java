package org.devflow.workspace;

import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@EqualsAndHashCode
@Embeddable
public class WorkspaceMemberId implements Serializable {

    private UUID workspaceId;
    private UUID userId;
}
