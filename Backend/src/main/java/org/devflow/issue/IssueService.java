package org.devflow.issue;

import lombok.RequiredArgsConstructor;
import org.devflow.project.ProjectRepository;
import org.devflow.user.UserRepository;
import org.devflow.workspace.WorkspaceRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IssueService {
    private final IssueRepository issueRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final StatusHistoryRepository statusHistoryRepository;
}
