package com.lec.spring.member.review.controller;

import com.lec.spring.general.user.jwt.JWTUtil;
import com.lec.spring.member.review.domain.Review;
import com.lec.spring.member.review.domain.ReviewDTO;
import com.lec.spring.member.review.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/review")
public class ReviewController {

    private final ReviewService reviewService;
    private final JWTUtil jwtUtil;

    // 리뷰 정보 조회
    @CrossOrigin
    @GetMapping("/reviewlist")
    public ResponseEntity<?> reviewList(HttpServletRequest request) {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);

        return new ResponseEntity<>(reviewService.reviewList(userId), HttpStatus.OK);
    }

    // 해당 유저의 리뷰 목록(최신순)
    @CrossOrigin
    @GetMapping("/list")
    public ResponseEntity<?> userReviewList(HttpServletRequest request,
                                            @RequestParam int page,
                                            @RequestParam int size) {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);

        return new ResponseEntity<>(reviewService.userReviewList(userId, page, size), HttpStatus.OK);
    }

    // 해당 유저의 리뷰 목록(별점순)
    @CrossOrigin
    @GetMapping("/ratelist")
    public ResponseEntity<?> userReviewRateList(HttpServletRequest request,
                                            @RequestParam int page,
                                            @RequestParam int size) {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);

        return new ResponseEntity<>(reviewService.userReviewRateList(userId, page, size), HttpStatus.OK);
    }

    // 리뷰 작성
    @CrossOrigin
    @PostMapping("/write/{flightInfo}")
    public ResponseEntity<?> write(@PathVariable Long flightInfo, @RequestBody ReviewDTO review){
        return new ResponseEntity<>(reviewService.write(flightInfo, review), HttpStatus.CREATED);
    }

    // 리뷰 내용 조회
    @CrossOrigin
    @GetMapping("/detail/{id}")
    public ResponseEntity<?> detail(@PathVariable Long id){
        return new ResponseEntity<>(reviewService.detail(id), HttpStatus.OK);
    }

    // 리뷰 수정
    @CrossOrigin
    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody ReviewDTO review){
        return new ResponseEntity<>(reviewService.update(review), HttpStatus.OK);
    }

    // 리뷰 삭제
    @CrossOrigin
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        return new ResponseEntity<>(reviewService.delete(id), HttpStatus.OK);
    }

    // 리뷰 개수 출력
    @CrossOrigin
    @GetMapping("/count")
    public ResponseEntity<?> getReservationCnt(HttpServletRequest request) {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);

        int cnt = reviewService.getReviewCntByUserId(userId);

        return ResponseEntity.ok(Map.of("count", cnt));
    }
}
