package com.lec.spring.admin.coupon.controller;

import com.lec.spring.admin.coupon.domain.Coupon;
import com.lec.spring.admin.coupon.service.CouponService;
import com.lec.spring.general.user.domain.User;
import com.lec.spring.general.user.jwt.JWTUtil;
import com.lec.spring.general.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/coupon")
public class CouponController {

    private final CouponService couponService;
    private final UserService userService;
    private final JWTUtil jwtUtil;

    /* 관리자 */
    @CrossOrigin
    @GetMapping("/list")
    public ResponseEntity<?> findAll(){
        return new ResponseEntity<>(couponService.findAll(), HttpStatus.OK);
    }

    @CrossOrigin
    @PostMapping("/add")
    public ResponseEntity<?> save(@RequestBody Coupon coupon){
        return new ResponseEntity<>(couponService.save(coupon), HttpStatus.CREATED);   // 201
    }

    @CrossOrigin
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        couponService.deleteUserCouponsByCouponId(id);
        return new ResponseEntity<>(couponService.delete(id), HttpStatus.OK);
    }

    /* 사용자 */
    // 사용자 쿠폰 목록 확인
    @CrossOrigin
    @GetMapping("/user/coupons")
    public ResponseEntity<?> getCoupons(HttpServletRequest request) {
        String token = request.getHeader("Authorization").split(" ")[1];

        Long userId = jwtUtil.getId(token);

        List<Coupon> coupons = couponService.getCouponsByUserId(userId);
        return new ResponseEntity<>(coupons, HttpStatus.OK);
    }

    // 사용자 쿠폰 추가
    @CrossOrigin
    @PostMapping("/user/add")
    @Transactional
    public ResponseEntity<?> addCoupon(@RequestBody Map<String, String> requestBody, HttpServletRequest request) {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);

        User user = userService.findById(userId);

        String couponCode = requestBody.get("couponCode");
        Coupon coupon = couponService.findByCode(couponCode);

        if (coupon == null) {
            return new ResponseEntity<>("유효하지 않은 쿠폰 코드입니다.", HttpStatus.BAD_REQUEST);
        }

        if (user.getCoupons().contains(coupon)) {
            return new ResponseEntity<>("이미 보유한 쿠폰입니다.", HttpStatus.BAD_REQUEST);
        }

        user.getCoupons().add(coupon);
        userService.save(user);

        return new ResponseEntity<>(HttpStatus.OK);
    }


    // 사용자 쿠폰 사용
    @CrossOrigin
    @Transactional
    @PostMapping("/user/use/{couponId}")
    public ResponseEntity<?> useCoupon(@PathVariable Long couponId, HttpServletRequest request) {

        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);
        Coupon coupon = couponService.findById(couponId);

        if (coupon != null) {
            User user = userService.findById(userId);

            if (user.getCoupons().contains(coupon)) {
                user.getCoupons().remove(coupon);
                userService.save(user);

                return new ResponseEntity<>(HttpStatus.OK);
            } else {
                return new ResponseEntity<>("사용자가 소유하지 않은 쿠폰입니다.", HttpStatus.BAD_REQUEST);
            }
        }
        return new ResponseEntity<>("유효하지 않은 쿠폰 코드입니다.", HttpStatus.BAD_REQUEST);
    }

    // 사용자 쿠폰 개수
    @CrossOrigin
    @GetMapping("/count")
    public ResponseEntity<?> getReservationCnt(HttpServletRequest request) {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);

        int cnt = couponService.getCouponCountByUserId(userId);

        return ResponseEntity.ok(Map.of("count", cnt));
    }
}
