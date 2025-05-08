package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.request.ServiceRequest;
import com.cnpm.managehotel.dto.response.ServiceResponse;

public interface ServiceService {
    ServiceResponse save(ServiceRequest request);
}
