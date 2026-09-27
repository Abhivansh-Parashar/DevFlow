package org.devflow.user;


import jakarta.validation.Valid;
import org.devflow.user.dto.AvatarUploadResponse;
import org.devflow.user.dto.UpdateUserRequest;
import org.devflow.user.dto.UserDto;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(){
        return ResponseEntity.ok().body(userService.getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateUser(@Valid @RequestBody UpdateUserRequest request){
        return ResponseEntity.ok().body(userService.updateUser(request));
    }

    @PostMapping(
            value = "/me/avatar",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<AvatarUploadResponse> uploadAvatar(@RequestParam("file") MultipartFile file){
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty.");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("File size cannot exceed 2 MB.");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                (!contentType.equals("image/jpeg")
                        && !contentType.equals("image/png")
                        && !contentType.equals("image/webp"))) {
            throw new IllegalArgumentException("Only JPEG, PNG and WebP images are allowed.");
        }

        return ResponseEntity.ok().body(userService.updateAvatar(file));
    }
}
