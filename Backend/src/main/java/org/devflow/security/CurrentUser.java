package org.devflow.security;

import org.devflow.user.User;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    public User get(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(authentication == null || !authentication.isAuthenticated()){
            throw new AuthenticationCredentialsNotFoundException("No authentication found.");
        }

        User user = (User)authentication.getPrincipal();
        return user;
    }
}
