package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.dto.request.AuthenticationRequest;
import com.cnpm.managehotel.dto.request.IntrospectRequest;
import com.cnpm.managehotel.dto.response.AuthenticationResponse;
import com.cnpm.managehotel.dto.response.IntrospectResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthService {
    void register(UserDTO request);
    AuthenticationResponse authenticate(AuthenticationRequest request);
    IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException;
}
