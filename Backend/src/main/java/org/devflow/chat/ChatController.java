package org.devflow.chat;


import jakarta.validation.Valid;
import org.devflow.chat.dto.ChatMessageDto;
import org.devflow.chat.dto.SendMessageRequest;
import org.devflow.common.PageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/projects")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/{projectId}/chat")
    public ResponseEntity<ChatMessageDto> sendMessage(@PathVariable Long projectId, @Valid @RequestBody SendMessageRequest request){
        return ResponseEntity.status(201).body(chatService.sendMessage(projectId, request));
    }

    @GetMapping("/{projectId}/chat")
    public ResponseEntity<PageResponse<ChatMessageDto>> getMessages(@PathVariable Long projectId, Pageable pageable){
        return ResponseEntity.ok(chatService.getMessages(projectId, pageable.getPageNumber(), pageable.getPageSize()));
    }

}




