//package org.devflow.project;
//
//import org.devflow.project.dto.CreateProjectRequest;
//import org.devflow.project.dto.ProjectDto;
//import org.devflow.user.User;
//import org.devflow.user.UserRepository;
//import org.devflow.security.CurrentUser;
//import org.springframework.stereotype.Service;
//
//@Service
//public class ProjectService {
//
//    private ProjectRepository projectRepository;
//    private UserRepository userRepository;
//    private CurrentUser currentUser;
//
//    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, CurrentUser currentUser) {
//        this.projectRepository = projectRepository;
//        this.userRepository = userRepository;
//        this.currentUser = currentUser;
//    }
//
//    public ProjectDto createProject(CreateProjectRequest request){
//
//        User user = userRepository.findByEmail(currentUser.get().getEmail());
////        if(projectRepository.findByWorkspaceId(request.getName()));
//    }
//}
