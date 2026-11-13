package org.devflow.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop60ByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<Notification> findByRecipientIdAndReadAtIsNullOrderByCreatedAtDesc(Long recipientId);

    List<Notification> findByRecipientId(Long recipientId);

    void deleteByRecipientId(Long recipientId);


}
