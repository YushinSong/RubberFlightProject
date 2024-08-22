package com.lec.spring.general.user.config;

import com.lec.spring.general.user.jwt.JWTUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;

@Component
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${awsFrontServer.address}")
    private String frontServerUrl;
    private final JWTUtil jwtUtil;

    public CustomSuccessHandler(JWTUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {


        //OAuth2User
        CustomOAuth2User customUserDetails = (CustomOAuth2User) authentication.getPrincipal();

        String username = customUserDetails.getUsername();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        String role = auth.getAuthority();

        String name = customUserDetails.getName();
        Long id = customUserDetails.getId();

        String token = jwtUtil.createJwt(id, username, role, name,60*60*600L);

        Cookie jwtCookie = new Cookie("accessToken", token);
        jwtCookie.setHttpOnly(false); // Allow JavaScript access
        jwtCookie.setSecure(false);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(60 * 60 * 600);

        response.addCookie(jwtCookie);

        response.addCookie(createCookie("Authorization", token));


        System.out.println("리다이렉트 경로: " + frontServerUrl + "/");

        response.sendRedirect(frontServerUrl + "/");
    }


    private Cookie createCookie(String key, String value){
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(60*60*60);
        //cookie.setSecure(true)
        cookie.setPath("/");
        cookie.setHttpOnly(true);

        return cookie;
    }
}
