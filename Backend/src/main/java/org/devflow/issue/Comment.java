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
@Table(name = "comment")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Comment {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY , optional = false)
    @JoinColumn(name="issue_id", nullable = false)
    private Issue issue;

    @ManyToOne(fetch = FetchType.LAZY , optional = false)
    @JoinColumn(name="author_id", nullable = false)
    private User author;

    private String body;

    private Instant createdAt;

}
