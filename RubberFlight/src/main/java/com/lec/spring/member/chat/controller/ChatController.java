package com.lec.spring.member.chat.controller;

import com.lec.spring.general.user.jwt.JWTUtil;
import com.lec.spring.member.chat.domain.Chat;
import com.lec.spring.member.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final JWTUtil jwtUtil;

    @CrossOrigin
    @PostMapping("/chat")
    public ResponseEntity<?> chatContent(@RequestBody Chat chat){
        // 유저가 보낸 메세지
        String prompt = chat.getMessage();

        // 응답을 클라이언트로 반환
        return new ResponseEntity<>(chatService.getResponse(prompt), HttpStatus.OK);
    }
}
