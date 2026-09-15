package org.devflow.chat;

import org.devflow.chat.dto.ChatMessageDto;
import org.devflow.chat.dto.ReactionDto;
import org.devflow.chat.dto.SendMessageRequest;
import org.devflow.common.PageResponse;
import org.devflow.common.exception.ResourceNotFoundException;
import org.devflow.project.Project;
import org.devflow.project.ProjectRepository;
import org.devflow.project.member.ProjectMemberRepository;
import org.devflow.user.User;
import org.devflow.user.UserRepository;
import org.devflow.user.UserService;
import org.devflow.user.dto.UserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ReactionRepository reactionRepository;

    public ChatService(
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository,
            UserService userService,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            ReactionRepository reactionRepository
    ) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.reactionRepository = reactionRepository;
    }

    public ChatMessageDto sendMessage(Long projectId, SendMessageRequest request) {

        UserDto currentUser = userService.getCurrentUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No project found for the given id."
                        )
                );

        projectMemberRepository
                .findByProjectIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of the project."
                        )
                );

        Optional<ChatMessage> existingMessage =
                chatMessageRepository.findByProjectIdAndClientId(
                        projectId,
                        request.getClientId()
                );

        if (existingMessage.isPresent()) {
            ChatMessage message = existingMessage.get();

            return ChatMessageDto.builder()
                    .id(message.getId())
                    .senderId(message.getSender().getId())
                    .content(message.getBody())
                    .clientId(message.getClientId())
                    .createdAt(message.getCreatedAt())
                    .build();
        }

        User sender = userRepository.findByEmail(currentUser.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found.")
                );

        ChatMessage chatMessage = ChatMessage.builder()
                .project(project)
                .sender(sender)
                .body(request.getContent())
                .clientId(request.getClientId())
                .build();

        chatMessageRepository.save(chatMessage);

        return ChatMessageDto.builder()
                .id(chatMessage.getId())
                .senderId(chatMessage.getSender().getId())
                .content(chatMessage.getBody())
                .clientId(chatMessage.getClientId())
                .createdAt(chatMessage.getCreatedAt())
                .build();
    }

    public PageResponse<ChatMessageDto> getMessages(Long projectId, int page, int size){
        UserDto currentUser = userService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No project found for the given id."
                        )
                );

        projectMemberRepository
                .findByProjectIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of the project."
                        )
                );

        Page<ChatMessage> messages = chatMessageRepository.findByProjectIdOrderByCreatedAtDesc(pageable, projectId);
        PageResponse<ChatMessageDto> chatMessageDtos = new PageResponse<>();
        List<ChatMessageDto> content = new ArrayList<>();

        for (ChatMessage chatMessage : messages.getContent()) {
            ChatMessageDto dto = ChatMessageDto.builder()
                    .id(chatMessage.getId())
                    .senderId(chatMessage.getSender().getId())
                    .content(chatMessage.getBody())
                    .clientId(chatMessage.getClientId())
                    .createdAt(chatMessage.getCreatedAt())
                    .build();

            content.add(dto);
        }

        chatMessageDtos.setContent(content);
        chatMessageDtos.setPage(messages.getNumber());
        chatMessageDtos.setSize(messages.getSize());
        chatMessageDtos.setTotalElements(messages.getTotalElements());
        chatMessageDtos.setTotalPages(messages.getTotalPages());
        chatMessageDtos.setLast(messages.isLast());

        return chatMessageDtos;
    }

    public void deleteMessage(Long projectId, Long messageId) {

        UserDto currentUser = userService.getCurrentUser();

        projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No project found for the given id."
                        )
                );

        projectMemberRepository
                .findByProjectIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "You are not a member of the project."
                        )
                );

        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Message not found."
                        )
                );

        if (!message.getSender().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "You can only delete your own messages."
            );
        }

        chatMessageRepository.delete(message);
    }

    public ReactionDto addReaction(Long projectId, Long messageId, String emoji) {

        UserDto currentUser = userService.getCurrentUser();

        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        projectMemberRepository
                .findByProjectIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of the project."));

        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found."));

        if (!message.getProject().getId().equals(projectId)) {
            throw new AccessDeniedException("Message does not belong to this project.");
        }

        Optional<Reaction> existingReaction =
                reactionRepository.findByMessageIdAndUserIdAndEmoji(
                        messageId,
                        currentUser.getId(),
                        emoji
                );

        if (existingReaction.isPresent()) {
            return ReactionDto.builder()
                    .messageId(messageId)
                    .userId(currentUser.getId())
                    .emoji(emoji)
                    .build();
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Reaction reaction = Reaction.builder()
                .message(message)
                .user(user)
                .emoji(emoji)
                .build();

        reactionRepository.save(reaction);

        return ReactionDto.builder()
                .messageId(messageId)
                .userId(user.getId())
                .emoji(emoji)
                .build();
    }
}