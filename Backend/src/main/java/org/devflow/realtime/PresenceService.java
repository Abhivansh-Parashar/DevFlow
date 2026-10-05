package org.devflow.realtime;

import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.security.CurrentUser;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class PresenceService {
    private final CurrentUser currentUser;
    private final UserRepository userRepository;

    public PresenceService(CurrentUser currentUser, UserRepository userRepository) {
        this.currentUser = currentUser;
        this.userRepository = userRepository;
    }

    public void updatePresence(boolean online){
        User authenticatedUser = currentUser.get();

        User user = userRepository.findByEmail(authenticatedUser.getEmail())
                .orElseThrow(() -> {
                    throw new ResourceNotFoundException("No user found for the given id.");
                }
        );

        user.setOnline(online);
        userRepository.save(user);

    }
}
