package com.lec.spring.admin.airport.service;

import com.lec.spring.admin.airport.domain.Airport;
import com.lec.spring.admin.airport.repository.AirportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class AirportService {
    private final AirportRepository airportRepository;

    // 공항 목록
    @Transactional
    public List<Airport> list() {
        return airportRepository.findAll(Sort.by(Sort.Order.asc("airportIso")));
    }

    // 나라별 공항 목록
    @Transactional
    public List<Airport> detail(Long countryId) {
        return airportRepository.findByCountryId(countryId);
    }

    // 나라 추가
    @Transactional
    public Airport add(Airport airport) {
        return airportRepository.save(airport);
    }

    // 나라 삭제
    @Transactional
    public int delete(String airportIso) {
        Optional<Airport> airport = Optional.ofNullable(airportRepository.findByAirportIso(airportIso));
        if (airport.isPresent()) {
            airportRepository.delete(airport.get());
            return 1; // Deleted successfully
        } else {
            return 0; // Not found
        }
    }

    @Transactional
    public Airport findByIso(String airport_iso) {
        return airportRepository.findByAirportIso(airport_iso);
    }

}
