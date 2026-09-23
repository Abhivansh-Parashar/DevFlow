package org.devflow.workspace;

import lombok.RequiredArgsConstructor;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.devflow.workspace.dto.CreateWorkspaceRequest;
import org.devflow.workspace.dto.WorkspaceDto;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository repo;

    private final UserRepository userRepository;

    public WorkspaceDto createWorkspace(CreateWorkspaceRequest request,Long userId){
        User user = userRepository.findById(userId)
            .orElseThrow();

        String slug = request.getName()
                .toLowerCase()
                .replace(" ", "-");

        if(repo.existsBySlug(slug)){
            throw new RuntimeException("Slug already exists");
        }

        Workspace workspace = new Workspace(
                request.getName(),
                slug,
                user
        );
        Workspace savedWorkspace = repo.save(workspace);
        return new WorkspaceDto(
                savedWorkspace.getId(),
                savedWorkspace.getName(),
                savedWorkspace.getSlug(),
                savedWorkspace.getOwner().getId(),
                savedWorkspace.getCreatedAt(),
                savedWorkspace.getUpdatedAt()
        );
    }
}
