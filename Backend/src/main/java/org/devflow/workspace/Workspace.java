package org.devflow.workspace;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.devflow.common.audit.AuditableEntry;
import org.devflow.user.User;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class Workspace extends AuditableEntry {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false,unique = true)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="Owner-id",nullable=false)
    private User owner;

    public Workspace(String name , String slug,  User owner){
        this.name = name;
        this.slug=slug;
        this.owner=owner;
    }



}
