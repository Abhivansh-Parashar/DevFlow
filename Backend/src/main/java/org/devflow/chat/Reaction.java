package org.devflow.chat;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.devflow.user.User;

import java.io.Serializable;
import java.util.Objects;

@Entity
@IdClass(Reaction.ReactionKey.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reaction {

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id")
    private ChatMessage message;

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Id
    private String emoji;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ReactionKey implements Serializable {
        private Long message;
        private Long user;
        private String emoji;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof ReactionKey that)) return false;
            return Objects.equals(message, that.message) && Objects.equals(user, that.user) && Objects.equals(emoji, that.emoji);
        }

        @Override
        public int hashCode() {
            return Objects.hash(message, user, emoji);
        }
    }
}