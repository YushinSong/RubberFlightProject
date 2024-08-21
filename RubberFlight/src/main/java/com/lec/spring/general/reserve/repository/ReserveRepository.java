package com.lec.spring.general.reserve.repository;

import com.lec.spring.general.reserve.domain.Reserve;
import com.lec.spring.member.flightInfo.domain.FlightInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ReserveRepository extends JpaRepository<Reserve, Long> {

    @Query("SELECT COUNT(r) FROM ft_reservation r WHERE r.user.id = :userId")
    int countByUserId(Long userId);
}
