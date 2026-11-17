
package org.devflow.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Email is required.")
    @Email(message = "Please provide a valid email address.")
    @Size(max = 254, message = "Email cannot exceed 254 characters.")
    private String email;

    @NotBlank(message = "Password is required.")
    @Size(max = 72, message = "Password cannot exceed 72 characters.")
    private String password;
}