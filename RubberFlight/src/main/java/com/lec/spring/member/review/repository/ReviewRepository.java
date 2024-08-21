package com.lec.spring.member.review.repository;

import com.lec.spring.member.review.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 모든 항공사 리뷰 목록(별점순)
    @Query(value = """
        SELECT * FROM ft_review r
        ORDER BY (r.seat_rate + r.service_rate + r.procedure_rate
        + r.flightmeal_rate + r.lounge_rate + r.clean_rate) / 6 DESC, r.date DESC
        """, nativeQuery = true)
    Page<Review> findByRateList(PageRequest pageRequest);

    // 해당 유저 리뷰 목록(최신순)
    Page<Review> findByFlightInfo_ReserveUserId(Long userId, PageRequest pageRequest);

    // 해당 유저 리뷰 목록(총 평점순)
    @Query(value = """
        SELECT r.id, r.content, r.clean_rate, r.date, r.flightinfo_id, r.flightmeal_rate, r.lounge_rate,
               r.procedure_rate, r.seat_rate, r.service_rate, r.title, r.airline_id, f.id AS flight_id,
               re.id AS reservation_id, u.id AS user_id
        FROM ft_review r
                 JOIN ft_airline a ON r.airline_id = a.id
                 JOIN ft_flightinfo f ON r.id = f.review_id
                 JOIN ft_reservation re ON f.reservation_id = re.id
                 JOIN ft_user u ON re.user_id = u.id
        where u.id = :id
        ORDER BY (r.seat_rate + r.service_rate + r.procedure_rate + r.flightmeal_rate
         + r.lounge_rate + r.clean_rate) / 6 DESC, r.date DESC
        """, nativeQuery = true)
    Page<Review> findByUserRate(@Param("id") Long user, PageRequest pageRequest);

    // 해당 항공사 리뷰 목록(최신순)
    Page<Review> findByAirlineId(Long airlineId, PageRequest pageRequest);

    // 해당 항공사 리뷰 목록(총 평점순)
    @Query(value = """
            SELECT r.id, r.content, r.clean_rate, r.date, r.flightinfo_id, r.flightmeal_rate, r.lounge_rate,
            r.procedure_rate, r.seat_rate, r.service_rate, r.title, r.airline_id
            FROM ft_review r
            JOIN ft_airline a ON r.airline_id = a.id
            where r.airline_id = :id
            ORDER BY (r.seat_rate + r.service_rate + r.procedure_rate + r.flightmeal_rate
             + r.lounge_rate + r.clean_rate) / 6 DESC, r.date DESC
                """, nativeQuery = true)
    Page<Review> findByAirlineRate(@Param("id") Long airline, PageRequest pageRequest);

    // 해당 유저 모든 리뷰 조회
    List<Review> findByFlightInfo_ReserveUserId(Long userId);

    // 리뷰 개수
    @Query("SELECT COUNT(r) FROM ft_review r JOIN r.flightInfo f JOIN f.reserve res WHERE res.user.id = :userId")
    int countReviewsByUserId(Long userId);
}


