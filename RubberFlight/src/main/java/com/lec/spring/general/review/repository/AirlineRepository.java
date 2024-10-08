package com.lec.spring.general.review.repository;

import com.lec.spring.general.review.domain.Airline;
import com.lec.spring.member.review.domain.Review;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AirlineRepository extends JpaRepository<Airline, Long> {
    // 항공사에 이름이 저장되어 있는지 확인
    Airline findByName(String name);

    // 이름 존재 여부 확인
    boolean existsByName(String name);
}
