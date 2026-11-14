
package org.devflow.notification;

import lombok.RequiredArgsConstructor;
import org.devflow.security.CurrentUser;
import org.devflow.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;


    @Transactional(readOnly = true)
    public List<Notification> getNotifications() {
        User user = CurrentUser.get();

        return notificationRepository
                .findTop60ByRecipientIdOrderByCreatedAtDesc(user.getId());
    }


    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications() {
        User user = CurrentUser.get();

        return notificationRepository
                .findByRecipientIdAndReadAtIsNullOrderByCreatedAtDesc(
                        user.getId()
                );
    }


    @Transactional
    public void markAsRead(Long notificationId) {
        User user = CurrentUser.get();

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found")
                );

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You cannot access another user's notification"
            );
        }

        notification.markAsRead();
    }

    @Transactional
    public void markAllAsRead() {
        User user = CurrentUser.get();

        List<Notification> notifications =
                notificationRepository.findByRecipientId(user.getId());

        notifications.forEach(Notification::markAsRead);
    }


    @Transactional
    public void clearNotifications() {
        User user = CurrentUser.get();

        notificationRepository.deleteByRecipientId(user.getId());
    }
}
