package com.lec.spring.member.review.service;

import com.lec.spring.general.review.domain.Airline;
import com.lec.spring.general.review.repository.AirlineRepository;

import com.lec.spring.member.flightInfo.domain.FlightInfo;
import com.lec.spring.member.flightInfo.repository.FlightInfoRepository;
import com.lec.spring.member.review.domain.Review;
import com.lec.spring.member.review.domain.ReviewDTO;
import com.lec.spring.member.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AirlineRepository airlineRepository;
    private final FlightInfoRepository flightInfoRepository;

    // <마이페이지 리뷰>
    // 리뷰 정보 조회
    @Transactional(readOnly = true)
    public List<Review> reviewList(Long user) {
        return reviewRepository.findByFlightInfo_ReserveUserId(user);
    }

    // 해당 유저의 리뷰 목록 조회(최신순)
    @Transactional(readOnly = true)
    public Page<Review> userReviewList(Long user, int page, int size) {
        if (page < 0) {
            page = 0; // 페이지 번호가 음수일 경우 0으로 설정
        }
        if (size <= 0) {
            size = 1; // 사이즈가 0 이하일 경우 1로 설정
        }
        return reviewRepository.findByFlightInfo_ReserveUserId(user,
                PageRequest.of(page, size, Sort.by(Sort.Order.desc("date"))));
    }

    // 해당 유저의 리뷰 목록 조회(별점순)
    @Transactional(readOnly = true)
    public Page<Review> userReviewRateList(Long user, int page, int size) {
        if (page < 0) {
            page = 0; // 페이지 번호가 음수일 경우 0으로 설정
        }
        if (size <= 0) {
            size = 1; // 사이즈가 0 이하일 경우 1로 설정
        }
        return reviewRepository.findByUserRate(user, PageRequest.of(page, size));
    }

    // 리뷰 작성
    @Transactional
    public Review write(Long flightInfo, ReviewDTO review) {


        // FlightInfo 조회
        FlightInfo flight = flightInfoRepository.findById(flightInfo)
                .orElseThrow(() -> new IllegalArgumentException("flightInfo_id를 확인하세요"));

        Airline airline;
        // 항공사 존재하는지 확인
        if (!airlineRepository.existsByName(flight.getAirlineName())) {
            airline = new Airline();
            airline.setName(flight.getAirlineName());
            airlineRepository.save(airline);  // 새로운 항공사 저장
        } else {
            // 항공사 존재하면 해당 항공사 가져오기
            airline = airlineRepository.findByName(flight.getAirlineName());
        }

        // ReviewDTO를 Review 엔티티로 변환
        Review reviewEntity = Review.builder()
                .title(review.getTitle())
                .seat_rate(review.getSeat_rate())
                .service_rate(review.getService_rate())
                .procedure_rate(review.getProcedure_rate())
                .flightmeal_rate(review.getFlightmeal_rate())
                .lounge_rate(review.getLounge_rate())
                .clean_rate(review.getClean_rate())
                .content(review.getContent())
                .date(LocalDateTime.now())
                .flightInfo(flight) // flightInfo와 연결
                .airline(airline)   // airline 연결
                .build();

        reviewEntity = reviewRepository.save(reviewEntity); // Review 저장
        flight.setReview(reviewEntity); // flightInfo 에 review 추가

        return reviewEntity;
    }

    // 리뷰 상세 조회
    @Transactional
    public Review detail(Long id) {
        return reviewRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("id를 확인해주세요"));
    }

    // 리뷰 수정
    @Transactional
    public Review update(ReviewDTO review) {
        Review reviewEntity = reviewRepository.findById(review.getId()).orElseThrow(() -> new IllegalArgumentException("id를 확인해주세요"));

        reviewEntity.setClean_rate(review.getClean_rate()); // 청결 점수
        reviewEntity.setTitle(review.getTitle());   // 리뷰 제목
        reviewEntity.setService_rate(review.getService_rate()); // 서비스 점수
        reviewEntity.setFlightmeal_rate(review.getFlightmeal_rate()); // 기내식 및 음료 점수
        reviewEntity.setLounge_rate(review.getLounge_rate()); // 라운지 점수
        reviewEntity.setSeat_rate(review.getSeat_rate()); // 좌석 점수
        reviewEntity.setProcedure_rate(review.getProcedure_rate()); // 체크인 및 탑승 점수
        reviewEntity.setContent(review.getContent()); // 리뷰 내용

        return reviewEntity;
    }

    // 리뷰 삭제
    public int delete(Long id) {
        FlightInfo flightInfo = flightInfoRepository.findByReviewId(id);

        if (reviewRepository.existsById(id)) {
            flightInfo.setReview(null);
            reviewRepository.deleteById(id);
            return 1;
        } else {
            return 0;
        }
    }

    // ====================================================================
    // <메인 리뷰 페이지>
    // 모든 유저 목록 조회(최신순)
    @Transactional(readOnly = true) // 변경사항 체크 X
    public Page<Review> list(int page, int size) {
        if (page < 0) {
            page = 0; // 페이지 번호가 음수일 경우 0으로 설정
        }
        if (size <= 0) {
            size = 1; // 사이즈가 0 이하일 경우 1로 설정
        }
        return reviewRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Order.desc("id")))); // id 순으로 내림차순
    }

    // 모든 유저 목록 조회(별점순)
    @Transactional(readOnly = true) // 변경사항 체크 X
    public Page<Review> rateList(int page, int size) {
        if (page < 0) {
            page = 0; // 페이지 번호가 음수일 경우 0으로 설정
        }
        if (size <= 0) {
            size = 1; // 사이즈가 0 이하일 경우 1로 설정
        }
        return reviewRepository.findByRateList(PageRequest.of(page, size));    }

    // 해당 항공사의 리뷰 목록 조회(최신순)
    @Transactional(readOnly = true)
    public Page<Review> airlineReviewList(Long airline, int page, int size) {
        if (page < 0) {
            page = 0; // 페이지 번호가 음수일 경우 0으로 설정
        }
        if (size <= 0) {
            size = 1; // 사이즈가 0 이하일 경우 1로 설정
        }
        return reviewRepository.findByAirlineId(airline, PageRequest.of(page, size, Sort.by(Sort.Order.desc("date"))));
    }

    // 해당 항공사의 리뷰 목록 조회(별점순)
    @Transactional(readOnly = true)
    public Page<Review> airlineReviewRateList(Long airline, int page, int size) {
        if (page < 0) {
            page = 0; // 페이지 번호가 음수일 경우 0으로 설정
        }
        if (size <= 0) {
            size = 1; // 사이즈가 0 이하일 경우 1로 설정
        }
        return reviewRepository.findByAirlineRate(airline, PageRequest.of(page, size));
    }

    public int getReviewCntByUserId(Long userId) {
        return reviewRepository.countReviewsByUserId(userId);
    }
}
