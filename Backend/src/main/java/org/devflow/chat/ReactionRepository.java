package org.devflow.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Reaction.ReactionKey> {

    List<Reaction> findByMessageId(Long messageId);
    boolean existsByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);
    void deleteByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);
}
