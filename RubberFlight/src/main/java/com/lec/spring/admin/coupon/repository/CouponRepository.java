package com.lec.spring.admin.coupon.repository;

import com.lec.spring.admin.coupon.domain.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long>  {

    List<Coupon> findAllByOrderByIdDesc();

    Coupon findByCode(String couponCode);

    @Query("SELECT COUNT(c) FROM FT_COUPON c JOIN c.users u WHERE u.id = :userId")
    int countByUsersId(Long userId);
}
