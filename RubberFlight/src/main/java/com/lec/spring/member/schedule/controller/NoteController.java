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
    public List<Date> fixDates(@RequestBody DateListDTO dates) {
        if(dates.getDeleteIndex() != -1)
            dateService.delete(dates.getDates().get(dates.getDeleteIndex()).getId());
        else{
            for(Date date: dates.getDates()){
                if(date.getId() == null)
                    dateService.save(dates.getScheduleId(), date);
                else
                    dateService.update(date);
            }
        }
        scheduleService.updateEditDate(dates.getScheduleId());
        List<Date> allList = dateService.findAllBySchedule(dates.getScheduleId());
        return allList;
    }

    @CrossOrigin
    @GetMapping("/dates/{id}")
    public List<Date> getDates(@PathVariable Long id) {
        List<Date> allList = dateService.findAllBySchedule(id);
        return allList;
    }

    private final Map<Long, Set<String>> activeUsersMap = new ConcurrentHashMap<>();

    @CrossOrigin
    @MessageMapping("/join/{id}")
    @SendTo("/topic/users/{id}")
    public Set<String> joinUser(@RequestBody JoinRequestDTO request) {
        Long scheduleId = request.getScheduleId();
        Long userId = jwtUtil.getId(request.getUserToken());
        User enteredUser = userService.findById(userId);
        String imageUrl = enteredUser.getImage();

        activeUsersMap.computeIfAbsent(scheduleId, k -> new ConcurrentSkipListSet<>()).add(imageUrl);
        Set<String> usersPics = activeUsersMap.get(scheduleId);

        return usersPics;
    }


    @CrossOrigin
    @MessageMapping("/leave/{id}")
    @SendTo("/topic/users/{id}")
    public Set<String> leaveUser(@RequestBody JoinRequestDTO request) {
        Long scheduleId = request.getScheduleId();
        Long userId = jwtUtil.getId(request.getUserToken());
        User enteredUser = userService.findById(userId);
        String imageUrl = enteredUser.getImage();

        Set<String> usersPics = activeUsersMap.get(scheduleId);
        if (usersPics != null) {
            usersPics.remove(imageUrl);
            if (usersPics.isEmpty()) {
                activeUsersMap.remove(scheduleId);
            }
        }
        return usersPics;
    }

    @CrossOrigin
    @GetMapping("/users/{id}")
    public Set<String> getUsers(@PathVariable Long id) {
        Set<String> usersPics = activeUsersMap.get(id);
        if(usersPics.isEmpty()){
            Set<String> empty = new HashSet<>();
            empty.add("empty");
            return empty;
        }

        return usersPics;
    }
}