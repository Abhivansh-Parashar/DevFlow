package org.devflow.user;

import org.devflow.user.dto.AvatarUploadResponse;
import org.devflow.user.dto.UpdateUserRequest;
import org.devflow.user.dto.UserDto;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                !(authentication.getPrincipal() instanceof User)) {
            throw new UsernameNotFoundException("No current user exists.");
        }

        User currentUser = (User) authentication.getPrincipal();

        UserDto userDto = new UserDto();
        userDto.setId(currentUser.getId());
        userDto.setName(currentUser.getName());
        userDto.setEmail(currentUser.getEmail());
        userDto.setAvatar(currentUser.getAvatar());

        return userDto;
    }

    public UserDto updateUser(UpdateUserRequest request) {
        UserDto currentUser = getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
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
        UserDto currentUser = getCurrentUser();

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file cannot be empty.");
        }

        String contentType = file.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed.");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new UsernameNotFoundException("No current user exists."));

        String avatarUrl = "/uploads/avatars/" + file.getOriginalFilename();

        user.setAvatar(avatarUrl);
        userRepository.save(user);

        AvatarUploadResponse response = new AvatarUploadResponse();
        response.setAvatarUrl(avatarUrl);

        return response;
    }
    public void updatePresence(boolean online) {
        UserDto currentUser = getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new UsernameNotFoundException("No current user exists."));

        user.setOnline(online);
        userRepository.save(user);
    }

}