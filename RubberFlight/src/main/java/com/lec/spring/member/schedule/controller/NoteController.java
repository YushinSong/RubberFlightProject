package com.lec.spring.member.schedule.controller;

import com.lec.spring.general.user.domain.User;
import com.lec.spring.general.user.jwt.JWTUtil;
import com.lec.spring.general.user.service.UserService;
import com.lec.spring.member.schedule.domain.Date;
import com.lec.spring.member.schedule.domain.DateListDTO;
import com.lec.spring.member.schedule.domain.JoinRequestDTO;
import com.lec.spring.member.schedule.domain.Schedule;
import com.lec.spring.member.schedule.service.DateService;
import com.lec.spring.member.schedule.service.ScheduleService;
import com.nimbusds.jose.util.Pair;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentSkipListSet;

@RequiredArgsConstructor
@RestController
public class NoteController {

    @Value("${awsServer.address}")
    private String serverUrl;
    private final ScheduleService scheduleService;
    private final DateService dateService;
    private final UserService userService;
    private List<String> notes = Collections.synchronizedList(new ArrayList<>());
    private final JWTUtil jwtUtil;

    @CrossOrigin
    @MessageMapping("/title/{id}")
    @SendTo("/topic/title/{id}")
    public Schedule broadcastNotes(@RequestBody Schedule schedule) {
        scheduleService.update(schedule);
        return schedule;
    }

    @CrossOrigin
    @GetMapping("/title/{id}")
    public Schedule getTitle(@PathVariable Long id) {
        Schedule schedule = scheduleService.detail(id);
        return schedule;
    }

    @CrossOrigin
    @MessageMapping("/dates/{id}")
    @SendTo("/topic/dates/{id}")
    public Pair<List<Date>, Long> fixDates(@RequestBody DateListDTO dates) {
        if(dates.getDeleteIndex() != -1)
            dateService.delete(dates.getDates().get(dates.getDeleteIndex()).getId());
        else{
            for(Date date: dates.getDates()){
                if(date.getId() == null)
                    dateService.save(dates.getScheduleId(), date);
                else{
                    dateService.update(date);
                }
            }
        }
        if(dates.getEditVersion() != -1)
            scheduleInputVersion.put(dates.getScheduleId(), dates.getEditVersion());
//        else
//            System.out.println("-1이 버전으로 들어옴");
        scheduleService.updateEditDate(dates.getScheduleId());
        List<Date> allList = dateService.findAllBySchedule(dates.getScheduleId());
        Pair<List<Date>, Long> result = Pair.of(allList, scheduleInputVersion.get(dates.getScheduleId()));
        return result;
    }

    @CrossOrigin
    @GetMapping("/dates/{id}")
    public Pair<List<Date>, Long> getDates(@PathVariable Long id) {
        List<Date> allList = dateService.findAllBySchedule(id);
        if(!scheduleInputVersion.containsKey(id))
            scheduleInputVersion.put(id, 0L);

        Pair<List<Date>, Long> result = Pair.of(allList, scheduleInputVersion.get(id));
        return result;
    }

    private final Map<Long, Set<Long>> activeUsersMap = new ConcurrentHashMap<>();
    private final Map<Long, Long> scheduleInputVersion = new ConcurrentHashMap<>();

    @CrossOrigin
    @MessageMapping("/join/{id}")
    @SendTo("/topic/users/{id}")
    public Set<Long> joinUser(@RequestBody JoinRequestDTO request) {
        Long scheduleId = request.getScheduleId();
        Long userId = jwtUtil.getId(request.getUserToken());

        activeUsersMap.computeIfAbsent(scheduleId, k -> new ConcurrentSkipListSet<>()).add(userId);
        if(!scheduleInputVersion.containsKey(scheduleId))
            scheduleInputVersion.put(scheduleId, 0L);

        Set<Long> users = activeUsersMap.get(scheduleId);

//        System.out.println("접속한 유저들" + users);

        return users;
    }


    @CrossOrigin
    @MessageMapping("/leave/{id}")
    @SendTo("/topic/users/{id}")
    public Set<Long> leaveUser(@RequestBody JoinRequestDTO request) {
        Long scheduleId = request.getScheduleId();
        Long userId = jwtUtil.getId(request.getUserToken());

        Set<Long> users = activeUsersMap.get(scheduleId);
        if (users != null) {
            users.remove(userId);
            if (users.isEmpty()) {
                activeUsersMap.remove(scheduleId);
                scheduleInputVersion.remove(scheduleId);
            }
        }
        return users;
    }

    @CrossOrigin
    @GetMapping("/scheduleusers/{id}")
    public Set<Long> getUsers(@PathVariable Long id) {
        Set<Long> usersPics = activeUsersMap.get(id);
        if(usersPics.isEmpty()){
            Set<Long> empty = new HashSet<>();
            return empty;
        }

        return usersPics;
    }

}