package com.lec.spring.member.flightInfo.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/flightInfo")
@RequiredArgsConstructor
public class FlightInfoController {

    private final FlightInfoService flightInfoService;
    private final JWTUtil jwtUtil;
    private final ReserveService reserveService;

    @Value("${app.api-key.aviation}")
    private String aviation_key;

    // 유저별 모든 예약 정보
    @CrossOrigin
    @GetMapping("/list")
    public ResponseEntity<Map<String, List<FlightInfo>>> getAllFlightInfo(HttpServletRequest request) {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);

        List<FlightInfo> flightInfoList = flightInfoService.findByUserId(userId);

        // 예정된 항공편과 지난 항공편으로 분리
        List<FlightInfo> upcomingFlights = new ArrayList<>();
        List<FlightInfo> pastFlights = new ArrayList<>();

        for (FlightInfo flightInfo : flightInfoList) {
            Reserve reserve = reserveService.detail(flightInfo.getReserve().getId());
            if (reserve != null && reserve.isIsended()) {
                pastFlights.add(flightInfo);
            } else {
                upcomingFlights.add(flightInfo);
            }
        }

        Map<String, List<FlightInfo>> response = new HashMap<>();
        response.put("upcomingFlights", upcomingFlights);
        response.put("pastFlights", pastFlights);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // 사용자 예약 정보에 따른 항공편 정보
    @CrossOrigin
    @GetMapping("/flights/{id}")
    public ResponseEntity<?> getFlightInfo(@PathVariable Long id, HttpServletRequest request) throws IOException {
        String token = request.getHeader("Authorization").split(" ")[1];
        Long userId = jwtUtil.getId(token);

        FlightInfo flightInfo = flightInfoService.findByIdAndUserId(id, userId);
        if (flightInfo == null) {
            return new ResponseEntity<>("항공편 정보를 찾을 수 없거나 권한이 없습니다.", HttpStatus.NOT_FOUND);
        }

        Reserve reserve = reserveService.detail(flightInfo.getReserve().getId());
        Map<String, Object> combinedResponse = new HashMap<>();
        combinedResponse.put("flightInfo", flightInfo);

        // 예약 상태에 따라 다른 API 호출
        if (reserve != null && reserve.isIsended()) {
            return getFlightHistory(flightInfo, combinedResponse);
        } else {
            return getFlightTimetable(flightInfo, combinedResponse);
        }
    }

    private ResponseEntity<?> getFlightTimetable(FlightInfo flightInfo, Map<String, Object> combinedResponse) throws IOException {
        String depIata = flightInfo.getDepIata();
        String flightIat = flightInfo.getFlightIat();

        RestTemplate restTemplate = new RestTemplate();
        URI uri = UriComponentsBuilder
                .fromUriString("https://aviation-edge.com/v2/public/timetable")
                .queryParam("key", aviation_key)
                .queryParam("iataCode", depIata)
                .queryParam("type", "departure")
                .queryParam("flight_iata", flightIat)
                .build()
                .encode()
                .toUri();

        String response = restTemplate.getForObject(uri, String.class);
        List<Map<String, Object>> timetableList = parseTimetableResponse(response); // JSON 리스트로 변환
        combinedResponse.put("timetable", timetableList);

        return new ResponseEntity<>(combinedResponse, HttpStatus.OK);
    }

    private ResponseEntity<?> getFlightHistory(FlightInfo flightInfo, Map<String, Object> combinedResponse) throws IOException {
        String arrIata = flightInfo.getArrIata();
        String flightIat = flightInfo.getFlightIat().replaceAll("[^0-9]", "");
        String airlineIata = flightInfo.getFlightIat().replaceAll("[^A-Za-z]", "");
        LocalDateTime depSch = flightInfo.getDepSch();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String date = depSch.format(formatter);

        RestTemplate restTemplate = new RestTemplate();
        URI uri = UriComponentsBuilder
                .fromUriString("https://aviation-edge.com/v2/public/flightsHistory")
                .queryParam("key", aviation_key)
                .queryParam("code", arrIata)
                .queryParam("type", "arrival")
                .queryParam("date_from", date)
                .queryParam("flight_number", flightIat)
                .queryParam("airline_iata", airlineIata)
                .queryParam("status", "landed")
                .build()
                .encode()
                .toUri();

        String response = restTemplate.getForObject(uri, String.class);
        List<Map<String, Object>> historyList = parseTimetableResponse(response);
        combinedResponse.put("history", historyList);

        return new ResponseEntity<>(combinedResponse, HttpStatus.OK);
    }


    // 항공편 일정 응답 JSON 파싱
    private List<Map<String, Object>> parseTimetableResponse(String jsonResponse) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(jsonResponse);
        List<Map<String, Object>> timetableList;

        if (rootNode.isArray()) {
            timetableList = objectMapper.convertValue(rootNode, new TypeReference<List<Map<String, Object>>>() {});
        } else if (rootNode.isObject()) {
            timetableList = Collections.singletonList(objectMapper.convertValue(rootNode, new TypeReference<Map<String, Object>>() {}));
        } else {
            return Collections.emptyList();
        }

        return timetableList.stream()
                .filter(timetable -> timetable.containsKey("arrival") && timetable.containsKey("flight"))
                .collect(Collectors.toList());
    }
}