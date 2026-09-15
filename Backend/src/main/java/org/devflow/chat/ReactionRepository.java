package org.devflow.chat;

import lombok.Builder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Reaction.ReactionKey> {

    List<Reaction> findByMessageId(Long messageId);
    boolean existsByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);
    void deleteByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);

    Optional<Reaction> findByMessageIdAndUserIdAndEmoji(Long messageId, Long messageId1, String emoji);
}
