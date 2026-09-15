package org.devflow.chat;

import jakarta.validation.constraints.NotNull;
import org.devflow.chat.dto.ChatMessageDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findByProjectIdOrderByCreatedAtDesc(Pageable pageable, long projectId);
    boolean existsByProjectIdAndClientId(Long projectId, String clientId);

    Optional<ChatMessage> findByProjectIdAndClientId(
            Long projectId,
            String clientId
    );
}
