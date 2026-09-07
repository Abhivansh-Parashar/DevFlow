package org.devflow.issue;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.devflow.user.User;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Table(name="reply")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reply {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name="comment_id",nullable = false)
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name="author_id",nullable = false)
    private User author;

    private String body;

    private Instant createdAt;
}
