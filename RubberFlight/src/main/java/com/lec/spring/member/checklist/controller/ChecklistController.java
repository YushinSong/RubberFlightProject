package com.lec.spring.member.checklist.controller;

import com.lec.spring.general.user.jwt.JWTUtil;
import com.lec.spring.member.checklist.domain.ChecklistDTO;
import com.lec.spring.member.checklist.domain.Checklist;
import com.lec.spring.member.checklist.domain.ChecklistItemDTO;
import com.lec.spring.member.checklist.domain.Checklist_item;
import com.lec.spring.member.checklist.repository.ChecklistRepository;
import com.lec.spring.member.checklist.repository.Checklist_itemRepository;
import com.lec.spring.member.checklist.service.ChecklistService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/checklist")
public class ChecklistController {

    @Autowired
    private ChecklistService checklistService;
    @Autowired
    Checklist_itemRepository checklist_itemRepository;

    @Autowired
    ChecklistRepository checklistRepository;

    @Autowired
    JWTUtil jwtUtil;

    // 유저 아이디로 체크리스트 목록 불러오기
    @GetMapping("/user")
    public ResponseEntity<List<ChecklistDTO>> getChecklistsByUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);

        return new ResponseEntity<>(checklistService.getChecklistsByUserId(userId), HttpStatus.OK);
    }

    // 체크리스트 생성하기
    @PostMapping("/create")
    public ResponseEntity<ChecklistDTO> createChecklist(@RequestBody ChecklistDTO checklistDTO) {
        ChecklistDTO createdChecklist = checklistService.createChecklist(checklistDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdChecklist);
    }

    // 체크리스트 상세 조회하기
    @GetMapping("/{id}")
    public ResponseEntity<ChecklistDTO> getChecklistById(@PathVariable Long id) {
        ChecklistDTO checklistDTO = checklistService.getChecklistById(id);
        if (checklistDTO == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(checklistDTO);
    }

    // 체크리스트 수정하기
    @PutMapping("/{id}")
    public ResponseEntity<ChecklistDTO> updateChecklist(@PathVariable Long id, @RequestBody ChecklistDTO updatedChecklistDTO) {
        ChecklistDTO updatedChecklist = checklistService.updateChecklist(id, updatedChecklistDTO);
        if (updatedChecklist == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedChecklist);
    }

    // 체크리스트 삭제하기
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChecklist(@PathVariable Long id) {
        checklistService.deleteChecklist(id);
        return ResponseEntity.noContent().build();
    }

    // 체크리스트 항목 추가하기
    @PostMapping("/items/create")
    public ResponseEntity<ChecklistItemDTO> createChecklistItem(@RequestBody ChecklistItemDTO itemDTO) {
        try {
            Checklist_item createdItem = checklistService.createChecklistItem(itemDTO);
            // Convert entity to DTO for response
            ChecklistItemDTO responseDTO = new ChecklistItemDTO();
            responseDTO.setId(createdItem.getId());
            responseDTO.setItemName(createdItem.getItemName());
            responseDTO.setChecked(createdItem.isChecked());
            responseDTO.setChecklistId(createdItem.getChecklist().getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            // Log and handle the exception
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 체크리스트 항목 조회하기
    @GetMapping("/items/{checklistId}")
    public ResponseEntity<List<ChecklistItemDTO>> getChecklistItemsByChecklistId(@PathVariable Long checklistId) {
        List<ChecklistItemDTO> items = checklistService.getChecklistItemsByChecklistId(checklistId);
//        System.out.println("체크리스트 ID: " + checklistId + "에 대한 아이템: " + items);
        if (items.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(items);
    }

    // 체크리스트 항목 수정하기
    @PutMapping("/items/{id}")
    public ResponseEntity<ChecklistItemDTO> updateChecklistItem(
            @PathVariable Long id,
            @RequestBody ChecklistItemDTO updatedItemDTO) {

        // 요청 파라미터 검증
        if (id == null || updatedItemDTO.getChecklistId() == null) {
            return ResponseEntity.badRequest().body(null); // ID가 null인 경우 잘못된 요청 반환
        }

        try {
            // 체크리스트 아이템 조회
            Checklist_item item = checklist_itemRepository.findById(id).orElse(null);
            if (item == null) {
                return ResponseEntity.notFound().build();
            }

            // 체크리스트 객체 설정
            Checklist checklist = checklistRepository.findById(updatedItemDTO.getChecklistId()).orElse(null);
            if (checklist == null) {
                return ResponseEntity.badRequest().body(null); // 체크리스트가 없는 경우 잘못된 요청 반환
            }

            // 아이템 업데이트
            item.setItemName(updatedItemDTO.getItemName()); // 수정: setItemName 사용
            item.setChecked(updatedItemDTO.isChecked());    // 수정: setChecked 사용
            item.setChecklist(checklist);  // 체크리스트 설정

            Checklist_item updatedItem = checklist_itemRepository.save(item);

            // DTO로 변환하여 반환
            ChecklistItemDTO responseDTO = new ChecklistItemDTO();
            responseDTO.setId(updatedItem.getId());
            responseDTO.setItemName(updatedItem.getItemName());
            responseDTO.setChecked(updatedItem.isChecked());
            responseDTO.setChecklistId(updatedItem.getChecklist() != null ? updatedItem.getChecklist().getId() : null); // 수정: checklistId 가져오기

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            e.printStackTrace(); // 스택 트레이스를 로그에 출력
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    // 체크리스트 항목 삭제하기
    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteChecklistItem(@PathVariable Long id) {
        checklistService.deleteChecklistItem(id);
        return ResponseEntity.noContent().build();
    }
}
