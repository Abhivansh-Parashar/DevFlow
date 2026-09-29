package org.devflow.project;

import org.devflow.project.dto.CreateProjectRequest;
import org.devflow.project.dto.ProjectDto;
import org.devflow.project.dto.UpdateProjectRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping("/workspaces/{workspaceId}/projects")
    public ResponseEntity<ProjectDto> createProject(@PathVariable Long workspaceId, @RequestBody CreateProjectRequest request){
        return ResponseEntity.status(201).body(projectService.createProject(workspaceId, request));
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<ProjectDto> getProject(@PathVariable Long projectId){
        return ResponseEntity.ok(projectService.getProject(projectId));
    }

    @PutMapping("/projects/{projectId}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long projectId, @RequestBody UpdateProjectRequest request){
        return ResponseEntity.ok(projectService.updateProject(projectId, request));
    }

    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId){
        projectService.deleteProject(projectId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/workspaces/{workspaceId}/projects")
    public ResponseEntity<List<ProjectDto>> getProjectsByWorkspace(@PathVariable Long workspaceId){
        return ResponseEntity.ok(projectService.getProjectsByWorkspace(workspaceId));
    }
}

