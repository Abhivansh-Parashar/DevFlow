package org.devflow.user;

import org.devflow.user.dto.AvatarUploadResponse;
import org.devflow.user.dto.UpdateUserRequest;
import org.devflow.user.dto.UserDto;
import org.devflow.security.CurrentUser;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public UserService(UserRepository userRepository, CurrentUser currentUser) {
        this.userRepository = userRepository;
        this.currentUser = currentUser;
    }

    public UserDto updateUser(UpdateUserRequest request) {
        User authenticatedUser = currentUser.get();

        User user = userRepository.findById(authenticatedUser.getId())
                .orElseThrow(() -> new UsernameNotFoundException("No current user exists."));

        user.setName(request.getName());
        user.setAvatar(request.getAvatar());

        userRepository.save(user);

        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setAvatar(user.getAvatar());

        return userDto;
    }

    public AvatarUploadResponse updateAvatar(MultipartFile file) {
        User authenticatedUser = currentUser.get();

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file cannot be empty.");
        }

        String contentType = file.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed.");
        }

        User user = userRepository.findById(authenticatedUser.getId())
                .orElseThrow(() -> new UsernameNotFoundException("No current user exists."));

        String avatarUrl = "/uploads/avatars/" + file.getOriginalFilename();

        user.setAvatar(avatarUrl);
        userRepository.save(user);

        AvatarUploadResponse response = new AvatarUploadResponse();
        response.setAvatarUrl(avatarUrl);

        return response;
    }
    public void updatePresence(boolean online) {
        User authenticatedUser = currentUser.get();

        User user = userRepository.findById(authenticatedUser.getId())
                .orElseThrow(() -> new UsernameNotFoundException("No current user exists."));

        user.setOnline(online);
        userRepository.save(user);
    }

}