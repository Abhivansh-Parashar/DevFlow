package org.devflow.issue;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.devflow.user.User;

import java.time.Instant;

@Entity
@Getter
@Table(name="reply")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reply {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name="comment_id",nullable = false)
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name="author_id",nullable = false)
    private User author;

    private String body;

    private Instant createdAt;

    public Reply(Comment comment, User author, String body) {
        this.comment = comment;
        this.author = author;
        this.body = body;
        this.createdAt = Instant.now();
    }

    public void updateBody(String body) {
        this.body = body;
    }
}
