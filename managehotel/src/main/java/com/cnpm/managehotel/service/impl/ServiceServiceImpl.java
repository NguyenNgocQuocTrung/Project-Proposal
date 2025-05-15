package com.cnpm.managehotel.service.impl;

import com.cnpm.managehotel.dto.ProductDTO;
import com.cnpm.managehotel.dto.request.ServiceRequest;
import com.cnpm.managehotel.dto.response.ServiceResponse;
import com.cnpm.managehotel.entity.Booking;
import com.cnpm.managehotel.entity.Product;
import com.cnpm.managehotel.entity.ServiceEntity;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.mapper.ProductMapper;
import com.cnpm.managehotel.mapper.ServiceMapper;
import com.cnpm.managehotel.repository.BookingRepo;
import com.cnpm.managehotel.repository.ProductRepo;
import com.cnpm.managehotel.repository.ServiceRepo;
import com.cnpm.managehotel.service.ProductService;
import com.cnpm.managehotel.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepo serviceRepo;
    private final ProductRepo productRepo;
    private final BookingRepo bookingRepo;

    private final ServiceMapper serviceMapper;
    private final ProductMapper productMapper;

    private final ProductService productService;

    @Override
    @Transactional
    public ServiceResponse save(ServiceRequest request) {
        Booking booking = bookingRepo.findByRoomNo(request.getRoomNo())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Product product = productRepo.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        ServiceEntity service;

        if (product.getCategory() != null && product.getCategory().getId() == 1L) {
            if (product.getAmount() < request.getAmount()) {
                throw new AppException(ErrorCode.NOT_ENOUGH);
            }

            product.setAmount(product.getAmount() - request.getAmount());

            ProductDTO productDto = productMapper.toDTO(product);

            productService.save(productDto);
        }

        service = serviceMapper.toEntity(request);
        service.setProduct(product);
        service.setBooking(booking);

        ServiceEntity savedService = serviceRepo.save(service);
        return serviceMapper.toDTO(savedService);
    }

    @Override
    public void delete(Long[] ids) {
        for (Long id : ids) {
            ServiceEntity service = serviceRepo.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_FOUND));

            Product product = service.getProduct();
            if (product.getCategory().getId() == 1) {
                product.setAmount(product.getAmount() + service.getAmount());
                ProductDTO productDto = productMapper.toDTO(product);
                productService.save(productDto);
            }

            serviceRepo.deleteById(id);
        }
    }

}
