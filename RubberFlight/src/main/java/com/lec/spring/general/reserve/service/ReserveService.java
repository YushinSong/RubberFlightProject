package com.lec.spring.general.reserve.service;

import com.lec.spring.admin.airport.domain.Airport;
import com.lec.spring.admin.airport.repository.AirportRepository;
import com.lec.spring.admin.coupon.domain.Coupon;
import com.lec.spring.general.reserve.domain.Flight;
import com.lec.spring.general.reserve.domain.Reserve;
import com.lec.spring.general.reserve.repository.ReserveRepository;
import com.lec.spring.general.user.domain.User;
import com.lec.spring.general.user.repository.UserRepository;
import com.lec.spring.member.flightInfo.domain.FlightInfo;
import com.lec.spring.member.flightInfo.repository.FlightInfoRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ReserveService {

    private final ReserveRepository reserveRepository;

    private final FlightInfoRepository flightInfoRepository;

    private final UserRepository userRepository;

    private final AirportRepository airportRepository;
    public ReserveService(ReserveRepository reserveRepository, FlightInfoRepository flightInfoRepository, UserRepository userRepository, AirportRepository airportRepository) {
        this.reserveRepository = reserveRepository;
        this.flightInfoRepository = flightInfoRepository;
        this.userRepository = userRepository;
        this.airportRepository = airportRepository;
    }

    public Reserve createReservation(String personnel, FlightInfo depFlightInfo, FlightInfo retFlightInfo) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);

        Reserve reservation = Reserve.builder()
                .user(user)
                .personnel(personnel)
                .build();

        if (depFlightInfo != null) {
            reservation.addFlightInfo(depFlightInfo);
        }

        if (retFlightInfo != null) {
            reservation.addFlightInfo(retFlightInfo);
        }

        return reserveRepository.save(reservation);
    }

    // detail
    public Reserve detail(Long id) {
        Reserve reserve = reserveRepository.findById(id).orElse(null);

        if(reserve != null) {
            List<FlightInfo> flightInfos = flightInfoRepository.findByReserveId(reserve.getId());
            reserve.setFlightInfoList(flightInfos);
        }
        return reserve;
    }

    // 거리 측정

    private static final double EARTH_RADIUS = 6371.0; // 지구 반지름 (킬로미터)
    private static final int MIN_PRICE_PER_KM = 72;
    private static final int MAX_PRICE_PER_KM = 104;

    public double calculateDistance(String departureIata, String arrivalIata) {
        Airport departureAirport = airportRepository.findByAirportIso(departureIata);
        Airport arrivalAirport = airportRepository.findByAirportIso(arrivalIata);

        if (departureAirport == null || arrivalAirport == null) {
            throw new IllegalArgumentException("잘못된 공항 선택입니다");
        }

        double lat1 = Math.toRadians(departureAirport.getLatitudeAirport());    // 출발 공항 위도
        double lon1 = Math.toRadians(departureAirport.getLongitudeAirport());   // 경도
        double lat2 = Math.toRadians(arrivalAirport.getLatitudeAirport());      // 도착 공항 위도
        double lon2 = Math.toRadians(arrivalAirport.getLongitudeAirport());     // 경도

        double deltaLat = lat2 - lat1;
        double deltaLon = lon2 - lon1;

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

    // 랜덤 값 출력
    public int calculateRandomPrice(double distance) {
        Random random = new Random();
        int pricePerKm = MIN_PRICE_PER_KM + random.nextInt(MAX_PRICE_PER_KM - MIN_PRICE_PER_KM + 1);
        int price = (int) (pricePerKm * distance);
        price = (price / 10) * 10;
        return price;
    }

    // 리스트(왕복)
    public List<Map<String, Object>> getSortedFlightCombinations(List<Flight> outboundFlights, List<Flight> inboundFlights) {
        List<Map<String, Object>> combinations = new ArrayList<>();

        for (Flight outbound : outboundFlights) {
            for (Flight inbound : inboundFlights) {
                Map<String, Object> combination = new HashMap<>();
                int totalPrice = outbound.getPrice() + inbound.getPrice();
                int totalDuration = outbound.getTakeTime() + inbound.getTakeTime();
                combination.put("id", outbound.getId() + "_" + inbound.getId());
                combination.put("outbound", outbound);
                combination.put("inbound", inbound);
                combination.put("totalPrice", totalPrice);
                combination.put("totalDuration", totalDuration);


                combinations.add(combination);
            }
        }

        // 가격에 따라 정렬
        return combinations.stream()
                .sorted(Comparator.comparingInt((Map<String, Object> combination) -> (int) combination.get("totalPrice"))
                        .thenComparingInt(combination -> (int) combination.get("totalDuration")))
                .collect(Collectors.toList());
    }

    // 리스트(편도)
    public List<Flight> getFlights(List<Flight> flights) {
        return flights.stream()
                .sorted(Comparator.comparingInt(Flight::getPrice)
                        .thenComparingInt(Flight::getTakeTime))
                .limit(10)
                .collect(Collectors.toList());
    }

    // DB 저장
    @Transactional
    public Reserve saveReservation(Long userId, String personnel, boolean isRoundTrip, Flight outboundFlight, Flight inboundFlight, Coupon coupon) {
//        System.out.println("saveReservation Coupon" + coupon);
//        System.out.println("왕복인가요" + isRoundTrip);
        Reserve reserve = new Reserve();
        User user = userRepository.findById(userId).orElse(null);
        reserve.setUser(user);
        reserve.setPersonnel(personnel);
        reserveRepository.save(reserve);

        List<FlightInfo> flights = new ArrayList<>();

        int adults = extractPersonnelCount(personnel, "성인");
        int children = extractPersonnelCount(personnel, "소아");
        int infants = extractPersonnelCount(personnel, "유아");

        double childDiscount = 0.75;
        double infantDiscount = 0.10;

        if(isRoundTrip) {
            if (outboundFlight != null) {
                int outboundPrice = (int) Math.floor(calculateTotalPrice(adults, children, infants, outboundFlight.getPrice(), childDiscount, infantDiscount));
                int discountedPrice = calculateDiscountedPrice(outboundPrice , coupon);
                System.out.println("outboundFlight discountedPrice" + discountedPrice);
                FlightInfo outbound = createFlightInfo(reserve, outboundFlight, discountedPrice);
                flights.add(outbound);
            }
            if (inboundFlight != null) {
                int inboundPrice = (int) Math.floor(calculateTotalPrice(adults, children, infants, inboundFlight.getPrice(), childDiscount, infantDiscount));
                int discountedPrice = calculateDiscountedPrice(inboundPrice, coupon);
                System.out.println("inboundFlight discountedPrice" + discountedPrice);
                FlightInfo inbound = createFlightInfo(reserve, inboundFlight, discountedPrice);
                flights.add(inbound);
            }

        } else {
            int outboundPrice = (int) Math.floor(calculateTotalPrice(adults, children, infants, outboundFlight.getPrice(), childDiscount, infantDiscount));
            int discountedPrice = calculateDiscountedPrice(outboundPrice, coupon);
            FlightInfo outbound = createFlightInfo(reserve, outboundFlight, discountedPrice);
            flights.add(outbound);
        }

        flightInfoRepository.saveAll(flights);
        return reserve;
    }

    // 정규식으로 인원 추출
    private int extractPersonnelCount(String personnelString, String type) {
        Pattern pattern = Pattern.compile(type + " (\\d+)명");
        Matcher matcher = pattern.matcher(personnelString);

        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        } else {
            return 0;
        }
    }

    // 총 가격을 계산
    private double calculateTotalPrice(int adults, int children, int infants, double adultPrice, double childDiscount, double infantDiscount) {
        double childPrice = adultPrice * childDiscount;
        double infantPrice = adultPrice * infantDiscount;
        return (adults * adultPrice) + (children * childPrice) + (infants * infantPrice);
    }


    private int calculateDiscountedPrice(int price, Coupon coupon) {
//        System.out.println("calculateDiscoutendRrice price" + price);
//        System.out.println("calculateDiscoutendRrice coupon percent" + coupon.getPercent());
        if(coupon == null) {return (price / 10 * 10);}
        return (int) (price * (1 - coupon.getPercent() /  100.0) / 10) * 10;
    }

    private FlightInfo createFlightInfo(Reserve reserve, Flight flight, int discountedPrice) {
        FlightInfo flightInfo = new FlightInfo();
        String depAirportName = flight != null ? airportRepository.findByAirportIso(flight.getDepAirport()).getAirportName() : null;
        String arrAirportName = flight != null ? airportRepository.findByAirportIso(flight.getArrAirport()).getAirportName() : null;

        System.out.println("가격은요?" + discountedPrice);
        flight.setPrice(discountedPrice);

        System.out.println(depAirportName);
        System.out.println(arrAirportName);
        flightInfo.setReserve(reserve);
        flightInfo.setDepAirport(depAirportName);
        flightInfo.setDepIata(flight.getDepAirport());
        flightInfo.setArrAirport(arrAirportName);
        flightInfo.setArrIata(flight.getArrAirport());
        flightInfo.setPrice(discountedPrice);
        flightInfo.setFlightIat(flight.getFlightIata());
        flightInfo.setDepSch(flight.getDepSch());
        flightInfo.setArrSch(flight.getArrSch());
        flightInfo.setAirlineName(flight.getAirlineName());
        flightInfo.setDepTerminal(flight.getDepTerminal());
        flightInfo.setDepGate(flight.getDepGate());
        flightInfo.setArrTerminal(flight.getArrTerminal());
        flightInfo.setArrGate(flight.getArrGate());

        return flightInfo;
    }

    @Scheduled(fixedRate = 60000) // 1분마다 실행
    public void updateEndedReservations() {
        LocalDateTime now = LocalDateTime.now();

        // 모든 예약
        List<Reserve> allReserves = reserveRepository.findAll();

        for (Reserve reserve : allReserves) {
//            System.out.println("끝남 여부" + reserve.isIsended());
            if (!reserve.isIsended()) {
                List<FlightInfo> flightInfos = flightInfoRepository.findByReserve(reserve);

//                System.out.println(flightInfos);

                // 왕복 예약인 경우, 마지막 도착 시간 찾기
                LocalDateTime latestArrSch = flightInfos.stream()
                        .map(FlightInfo::getArrSch)
                        .max(LocalDateTime::compareTo)
                        .orElse(null);

                if (latestArrSch != null && latestArrSch.isBefore(now)) {
                    reserve.setIsended(true);
                    reserveRepository.save(reserve);
                }
            }
        }
    }

    public int getReservationCntByUserId(Long userId) {
        return reserveRepository.countByUserId(userId);
    }
}
