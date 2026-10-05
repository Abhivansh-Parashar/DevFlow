package org.devflow.project.member;


import org.devflow.project.ProjectRole;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    public ProjectMemberController(ProjectMemberService projectMemberService) {
        this.projectMemberService = projectMemberService;
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<ProjectMemberDto> addMember(@PathVariable Long projectId, @RequestBody ProjectMemberRequest request){
        return ResponseEntity.status(201).body(projectMemberService.addMember(projectId, request));
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable(name = "projectId") Long projectId,
            @PathVariable(name = "userId") Long userId)
    {
        projectMemberService.removeMember(projectId, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{projectId}/members/{userId}/role")
    public ResponseEntity<ProjectMemberDto> changeRole(
            @PathVariable(name = "projectId") Long projectId,
            @PathVariable(name = "userId") Long userId,
            @RequestBody ProjectRole role)
    {
        return ResponseEntity.ok(projectMemberService.changeRole(projectId, userId, role));
    }
}
