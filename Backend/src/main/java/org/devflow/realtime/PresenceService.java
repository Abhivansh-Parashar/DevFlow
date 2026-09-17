package org.devflow.realtime;

import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.devflow.user.UserService;
import org.devflow.user.dto.UserDto;
import org.springframework.stereotype.Service;

@Service
public class PresenceService {
    private final UserService userService;
    private final UserRepository userRepository;

    public PresenceService(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    public void updatePresence(boolean online){
        UserDto currentUser = userService.getCurrentUser();

        User user = userRepository.findByEmail(currentUser.getEmail())
                .orElseThrow(() -> {
                    throw new ResourceNotFoundException("No user found for the given id.");
                }
        );

        user.setOnline(online);
        userRepository.save(user);

    }
}
