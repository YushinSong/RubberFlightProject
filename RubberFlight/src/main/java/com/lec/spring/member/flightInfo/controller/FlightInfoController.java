package com.lec.spring.member.flightInfo.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lec.spring.general.reserve.domain.Reserve;
import com.lec.spring.general.reserve.service.ReserveService;
import com.lec.spring.general.user.jwt.JWTUtil;
import com.lec.spring.member.flightInfo.domain.FlightInfo;
import com.lec.spring.member.flightInfo.service.FlightInfoService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/flightInfo")
@RequiredArgsConstructor
public class FlightInfoController {

    private final FlightInfoService flightInfoService;
    private final JWTUtil jwtUtil;

    @Value("${app.api-key.aviation}")
    private String aviation_key;

    // 모든 예약 정보
    @CrossOrigin
    @GetMapping("/list")
    public ResponseEntity<List<FlightInfo>> getAllFlightInfo(HttpServletRequest request) {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);

        List<FlightInfo> flightInfoList = flightInfoService.findByUserId(userId);
        return new ResponseEntity<>(flightInfoList, HttpStatus.OK);
    }

    // 사용자 예약 정보에 따른 항공편 정보
    @CrossOrigin
    @GetMapping("/flights/{id}")
    public ResponseEntity<?> getFlightInfoById(@PathVariable Long id, HttpServletRequest request) throws IOException {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);

        // 항공편 정보 가져오기 (해당 예약이 로그인한 사용자의 것인지 확인)
        FlightInfo flightInfo = flightInfoService.findByIdAndUserId(id, userId);
        if (flightInfo == null) {
            return new ResponseEntity<>("항공편 정보를 찾을 수 없거나 권한이 없습니다.", HttpStatus.NOT_FOUND);
        }

        // 출발 및 도착 IATA 코드 가져오기
        String depIata = flightInfo.getDepIata();
        String arrIata = flightInfo.getArrIata();
        String flightIat = flightInfo.getFlightIat();

        // 항공편 일정 API
        RestTemplate restTemplate = new RestTemplate();
        URI uri2 = UriComponentsBuilder
                .fromUriString("https://aviation-edge.com/v2/public/timetable")
                .queryParam("key", aviation_key)
                .queryParam("iataCode", depIata)
                .queryParam("type", "departure")
                .build()
                .encode()
                .toUri();

        String response = restTemplate.getForObject(uri2, String.class);
        List<Map<String, Object>> timetableList = parseTimetableResponse(response, arrIata, flightIat.toUpperCase()); // JSON 리스트로 변환

        Map<String, Object> combinedResponse = new HashMap<>();
        combinedResponse.put("flightInfo", flightInfo);
        combinedResponse.put("timetable", timetableList);

        // getForEntity 대신 getForObject 를 사용하고 Entity 를 직접 만들어서 보내기
        return new ResponseEntity<>(combinedResponse, HttpStatus.OK);
    }

    // 항공편 일정 응답 JSON 파싱
    private List<Map<String, Object>> parseTimetableResponse(String jsonResponse, String arrIata, String flightIat) throws IOException {
        List<Map<String, Object>> timetableList = new ObjectMapper().readValue(jsonResponse, new TypeReference<List<Map<String, Object>>>() {});

        return timetableList.stream()
                .filter(timetable -> ((Map<String, Object>) timetable.get("arrival")).get("iataCode").equals(arrIata) &&
                        ((Map<String, Object>) timetable.get("flight")).get("iataNumber").equals(flightIat))
                .collect(Collectors.toList());

    }
}