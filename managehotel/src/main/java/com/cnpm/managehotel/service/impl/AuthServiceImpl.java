package com.cnpm.managehotel.service.impl;


import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.dto.request.AuthenticationRequest;
import com.cnpm.managehotel.dto.request.IntrospectRequest;
import com.cnpm.managehotel.dto.response.AuthenticationResponse;
import com.cnpm.managehotel.dto.response.IntrospectResponse;
import com.cnpm.managehotel.entity.User;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.repository.UserRepo;
import com.cnpm.managehotel.service.AuthService;
import com.cnpm.managehotel.service.UserService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import java.util.StringJoiner;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {

    @Value("${jwt.signerKey}")
    @NonFinal
    String SIGNER_KEY;

    final long expirationTime = 7200;

    private final UserRepo userRepo;

    private final UserService userService;

    private final PasswordEncoder passwordEncoder;

    @Override
    public void register(UserDTO request) {

        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            throw new AppException(ErrorCode.USERNAME_INVALID);
        }

        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        request.setPassword(passwordEncoder.encode(request.getPassword()));

        userService.save(request);
    }

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        String token = request.getToken();

        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expityTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        return IntrospectResponse.builder()
                .valid(verified && expityTime.after(new Date()))
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request){
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        var user = userRepo.findByEmail(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if(!authenticated)
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        var token = generateToken(user);

        return AuthenticationResponse.builder()
                .authenticated(authenticated)
                .token(token)
                .build();
    }

    public String generateToken(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("managehotel.com")
                .issueTime(Date.from(Instant.now()))
                .expirationTime(
                        Date.from(Instant.now().plusSeconds(expirationTime)
                        ))
                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    private String buildScope(User user) {
        return user.getRole() != null ? user.getRole() : "";
    }


}
