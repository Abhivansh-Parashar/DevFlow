package org.devflow.workspace;

import jakarta.persistence.*;
import org.devflow.common.audit.AuditableEntry;
import org.devflow.user.User;

import java.time.Instant;
import java.util.UUID;

@Entity
public class Workspace extends AuditableEntry {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;

    private String slug;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="Owner-id",nullable=false)
    private User owner;



}
