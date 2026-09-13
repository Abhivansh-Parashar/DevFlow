package org.devflow.project;

import org.devflow.project.dto.CreateProjectRequest;
import org.devflow.project.dto.ProjectDto;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.devflow.user.UserService;
import org.springframework.stereotype.Service;

@Service
public class ProjectService {

    private ProjectRepository projectRepository;
    private UserRepository userRepository;
    private UserService userService;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, UserService userService) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public ProjectDto createProject(CreateProjectRequest request){

        User user = userRepository.findByEmail(userService.getCurrentUser().getEmail());
        if(projectRepository.findByWorkspaceId(request.getName()))
    }
}
