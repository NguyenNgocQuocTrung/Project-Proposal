package com.cnpm.managehotel.config;

import com.cnpm.managehotel.constant.UserRole;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
public class SercurityConfig {

    @Value("${jwt.signerKey}")
    @NonFinal
    String signerKey;

    private static final String[] RECEPTIONIST_GET_ENDPOINTS = {
            "/room/available",
            "/payment/{bookingCode}/invoice-preview",
            "/booking",
            "/vn-pay",
            "/vn-pay-callback",
            "/report"
    };

    private static final String[] RECEPTIONIST_POST_ENDPOINTS = {
            "/booking",
            "/booking/unpaid",
            "/booking/checkin",
            "/service",
    };

    private static final String[] RECEPTIONIST_DELETE_ENDPOINTS = {
            "/booking",
            "/service"
    };

    private static final String[] ADMIN_GET_ENDPOINTS ={
            "/booking",
            "/feedback",
            "/report"
    };

    private static final String[] ADMIN_POST_ENDPOINTS = {
            "/room",
            "/products"
    };

    private static final String[] ADMIN_PUT_ENDPOINTS = {
            "/room",
            "/products"
    };

    private static final String[] ADMIN_DELETE_ENDPOINTS = {
            "/room"
    };

    private static final String[] COMMON_GET_ENDPOINTS = {
            "/booking",
            "/report",
            "/room"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity)
            throws Exception {

        httpSecurity
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.GET, RECEPTIONIST_GET_ENDPOINTS).hasRole(UserRole.RECEPTIONIST)
                        .requestMatchers(HttpMethod.POST, RECEPTIONIST_POST_ENDPOINTS).hasRole(UserRole.RECEPTIONIST)
                        .requestMatchers(HttpMethod.DELETE, RECEPTIONIST_DELETE_ENDPOINTS).hasRole(UserRole.RECEPTIONIST)
                        .requestMatchers(HttpMethod.GET, ADMIN_GET_ENDPOINTS).hasRole(UserRole.ADMIN)
                        .requestMatchers(HttpMethod.POST, ADMIN_POST_ENDPOINTS).hasRole(UserRole.ADMIN)
                        .requestMatchers(HttpMethod.PUT, ADMIN_PUT_ENDPOINTS).hasRole(UserRole.ADMIN)
                        .requestMatchers(HttpMethod.DELETE, ADMIN_DELETE_ENDPOINTS).hasRole(UserRole.ADMIN)
                        .requestMatchers(HttpMethod.GET, COMMON_GET_ENDPOINTS).hasAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST)
                        .requestMatchers(HttpMethod.POST, "/feedback").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/feedback").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/register").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs*/**").permitAll()
                        .anyRequest()
                        .authenticated());

        httpSecurity.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwtConfigurer ->
                        jwtConfigurer.decoder(jwtDecoder())
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
        );

        httpSecurity.csrf(AbstractHttpConfigurer :: disable);

        return httpSecurity.build();
    }

    @Bean
    JwtDecoder jwtDecoder(){
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        jwtGrantedAuthoritiesConverter.setAuthoritiesClaimName("scope");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
