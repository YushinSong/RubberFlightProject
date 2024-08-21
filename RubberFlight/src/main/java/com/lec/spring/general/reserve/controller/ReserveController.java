package com.lec.spring.general.reserve.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.lec.spring.admin.airport.service.AirportService;
import com.lec.spring.admin.coupon.domain.Coupon;
import com.lec.spring.admin.coupon.service.CouponService;
import com.lec.spring.general.reserve.domain.Flight;
import com.lec.spring.general.reserve.domain.ReservationRequest;
import com.lec.spring.general.reserve.domain.Reserve;
import com.lec.spring.general.reserve.service.ReserveService;
import com.lec.spring.general.user.domain.User;
import com.lec.spring.general.user.jwt.JWTUtil;
import com.lec.spring.general.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
@RestController
public class ReserveController {


    @Value("${app.api-key.aviation}")
    private String aviation_key;

    @Autowired
    private ReserveService reserveService;

    @Autowired
    private AirportService airportService;

    private final JWTUtil jwtUtil;

    private final CouponService couponService;

    // 검색 페이지(api)
    @CrossOrigin
    @GetMapping("/search")
    public ResponseEntity<?> searchFlights(@RequestParam String iataCode,
                                           @RequestParam String depDate,
                                           @RequestParam String arrIataCode,
                                           @RequestParam(required = false) String arrDate
                                          ) {

        String type = "departure";

        String depTimezone = airportService.findByIso(iataCode).getTimezone();
        String arrTimezone = airportService.findByIso(arrIataCode).getTimezone();

//        System.out.println("출발 iataCode" + iataCode);
//        System.out.println("도착 iataCode" + arrIataCode);
//        System.out.println("출발 날짜" + depDate);
//        System.out.println("도착 날짜" + arrDate);
//        System.out.println("출발 타임존" + depTimezone);
//        System.out.println("도착 타임존" + arrTimezone) ;
//        System.out.println("arrDate: " + arrDate);



        String depAirportName = airportService.findByIso(iataCode).getAirportName();
        String arrAirportName = airportService.findByIso(arrIataCode).getAirportName();

        List<Flight> outboundFlights = fetchFlights(iataCode, arrIataCode, depDate, type, depTimezone, arrTimezone, depAirportName, arrAirportName);

        List<Flight> inboundFlights = (arrDate != null && !arrDate.isEmpty())
                ? fetchFlights(arrIataCode, iataCode, arrDate, type, arrTimezone, depTimezone, arrAirportName, depAirportName)
                : Collections.emptyList();

        if (!outboundFlights.isEmpty() && !inboundFlights.isEmpty()) {
            List<Map<String, Object>> sortedCombinations = reserveService.getSortedFlightCombinations(outboundFlights, inboundFlights);
            return new ResponseEntity<>(Collections.singletonMap("combinations", sortedCombinations), HttpStatus.OK);
        }

        List<Flight> sortedOutboundFlights = reserveService.getFlights(outboundFlights);
        List<Flight> sortedInboundFlights = reserveService.getFlights(inboundFlights);

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("outboundFlights", sortedOutboundFlights);
        responseMap.put("inboundFlights", sortedInboundFlights);

//        System.out.println("항공권 정보" + responseMap);

        return new ResponseEntity<>(responseMap, HttpStatus.OK);
    }

    private List<Flight> fetchFlights(String depIata, String arrIata, String date, String type, String depTimezone, String arrTimezone, String depAirportName, String arrAirportName) {   // TIMEZONE
        URI uri = UriComponentsBuilder
                .fromUriString("https://aviation-edge.com/v2/public/flightsFuture")
                .queryParam("key", aviation_key)
                .queryParam("iataCode", depIata)
                .queryParam("type", type)
                .queryParam("date", date)
                .queryParam("arr_iataCode", arrIata)
                .build()
                .encode()
                .toUri();

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);

        return parseFlightInfo(response.getBody(), depIata, arrIata, date, depTimezone, arrTimezone, depAirportName, arrAirportName);
    }

    private List<Flight> parseFlightInfo(String response, String depIata, String arrIata, String date, String depTimezone, String arrTimezone, String depAirportName, String arrAirportName) {
        ObjectMapper objectMapper = new ObjectMapper();
        List<Flight> flights = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(response);
            if (root.isArray()) {
                for (JsonNode jsonNode : root) {
                    double distance = reserveService.calculateDistance(depIata, arrIata);
                    int price = reserveService.calculateRandomPrice(distance);
                    Flight flight = new Flight(jsonNode, depIata, arrIata, date, price, depTimezone, arrTimezone, depAirportName, arrAirportName);

                    if(!flight.getAirlineName().equals("") && !flight.getAirlineName().trim().isEmpty()) {
                        flights.add(flight);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return flights;
    }

    private List<Map<String, Object>> createFlightCombinations(List<Flight> outboundFlights, List<Flight> inboundFlights) {
        List<Map<String, Object>> combinations = new ArrayList<>();
        for (Flight outbound : outboundFlights) {
            for (Flight inbound : inboundFlights) {
                Map<String, Object> combination = new HashMap<>();
                combination.put("id", outbound.getId() + "_" + inbound.getId());
                combination.put("outbound", outbound);
                combination.put("inbound", inbound);

                if (outbound.getDepAirport().equals(inbound.getArrAirport()) && outbound.getArrAirport().equals(inbound.getDepAirport())) {
                    combination.put("depTimezone", outbound.getDepTimezone());
                    combination.put("arrTimezone", inbound.getArrTimezone());
                } else {
                    combination.put("depTimezone", outbound.getDepTimezone());
                    combination.put("arrTimezone", inbound.getArrTimezone());
                }

                combinations.add(combination);
            }
        }
        return combinations;
    }

    // db 정보 저장하기
    @CrossOrigin
    @PostMapping("/reservation")
    public ResponseEntity<Reserve> saveReserve(@RequestBody ReservationRequest reserveRequest,
                                               HttpServletRequest request
                                                ) {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);
//        System.out.println("유저 아이디" + userId);
        boolean isRoundTrip;

        Flight outboundFlight = reserveRequest.getOutboundFlight();
//        System.out.println("outboundFlight" + outboundFlight);

        Flight inboundFlight =  reserveRequest.getInboundFlight().orElse(null);
//        System.out.println("inboundFlight" + inboundFlight);

        if(inboundFlight == null || inboundFlight.equals("")) isRoundTrip = false;
        else isRoundTrip = true;
//        System.out.println("왕복일까요111" + isRoundTrip);

        Coupon coupon = couponService.findById(reserveRequest.getCouponId());
//        System.out.println("가져온 쿠폰 정보" + coupon);

        Reserve reserve = reserveService.saveReservation(userId, reserveRequest.getPersonnel(), isRoundTrip, outboundFlight, inboundFlight, coupon);
//        System.out.println("예약정보" + reserve);
        return ResponseEntity.ok(reserve);
    }

    // 유저의 예약 횟수 가져오기
    @CrossOrigin
    @GetMapping("/reservation/count")
    public ResponseEntity<?> getReservationCnt(HttpServletRequest request) {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);

        int cnt = reserveService.getReservationCntByUserId(userId);

        return ResponseEntity.ok(Map.of("count", cnt));
    }



}

