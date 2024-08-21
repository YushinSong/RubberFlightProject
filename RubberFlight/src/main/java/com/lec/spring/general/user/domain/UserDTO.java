package com.lec.spring.general.user.domain;

import com.lec.spring.member.checklist.domain.ChecklistDTO;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserDTO {

    private Long id;
    private String role;
    private String name;
    private String username;
    private String image;
    private String password;
    private String email;
    private String tel;

    private List<ChecklistDTO> checklists;

}
