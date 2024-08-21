package com.lec.spring.general.user.service;

import com.lec.spring.general.user.config.CustomOAuth2User;
import com.lec.spring.general.user.domain.*;
import com.lec.spring.general.user.repository.UserRepository;
import com.lec.spring.member.checklist.service.ChecklistService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.parameters.P;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Value("${awsServer.address}")
    private String serverUrl;
    private final UserRepository userRepository;
    private final ChecklistService checklistService;

    public CustomOAuth2UserService(UserRepository userRepository, ChecklistService checklistService) {
        this.userRepository = userRepository;
        this.checklistService = checklistService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        if (oAuth2User == null) {
//            System.out.println("OAuth2User is null.");
            throw new OAuth2AuthenticationException("OAuth2User is null");
        }

//        System.out.println("OAuth2User: " + oAuth2User);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2Response oAuth2Response = null;

        // 등록된 서비스에 따라 OAuth2Response를 만듦
        if (registrationId.equals("naver")) {
            oAuth2Response = new NaverResponse(oAuth2User.getAttributes());
        } else if (registrationId.equals("google")) {
            oAuth2Response = new GoogleResponse(oAuth2User.getAttributes());
        } else if (registrationId.equals("facebook")) {
            oAuth2Response = new FacebookResponse(oAuth2User.getAttributes());
        } else if (registrationId.equals("kakao")) {
            oAuth2Response = new KakaoResponse(oAuth2User.getAttributes());
        } else {
            return null;
        }

        // 사용자 이름 생성
        String username = oAuth2Response.getProvider() + " " + oAuth2Response.getProviderId();
//        System.out.println("생성된 사용자 이름: " + username);

        // 사용자 존재 여부 확인
        User existData = userRepository.findByUsername(username);
//        System.out.println("기존 사용자 데이터: " + existData);

        if (existData == null) {
            // 신규 사용자 가입 처리
            String email = oAuth2Response.getEmail() != null ? oAuth2Response.getEmail() : oAuth2Response.getProviderId() + "@kakao.com";
            String name = oAuth2Response.getName() != null ? oAuth2Response.getName() : "user";
            String image = oAuth2Response.getImage() != null ? oAuth2Response.getImage() : serverUrl + "/uploads/user.png";
//
//            System.out.println("이메일: " + email);
//            System.out.println("이름: " + name);
//            System.out.println("이미지 URL: " + image);

            // 사용자 저장
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setName(name);
            user.setRole("ROLE_MEMBER");
            user.setPassword("defaultPassword");
            user.setTel("");
            user.setImage(image);

            User savedUser = userRepository.save(user);
//            System.out.println("새 사용자 저장됨: " + savedUser);

            // 기본 체크리스트 생성
            checklistService.createDefaultChecklists(savedUser.getId());

            // 새 사용자 정보 반환
            UserDTO userDTO = new UserDTO();
            userDTO.setId(savedUser.getId());
            userDTO.setUsername(username);
            userDTO.setName(name);
            userDTO.setRole("ROLE_MEMBER");
            userDTO.setImage(image);

            return new CustomOAuth2User(userDTO);
        } else {
            // 이미 가입된 사용자 처리
//            System.out.println("이미 가입된 회원입니다.");

            // 기존 사용자 정보 반환
            UserDTO userDTO = new UserDTO();
            userDTO.setId(existData.getId());
            userDTO.setUsername(existData.getUsername());
            userDTO.setName(existData.getName());
            userDTO.setRole(existData.getRole());
            userDTO.setImage(existData.getImage());

            return new CustomOAuth2User(userDTO);
        }
    }
}
