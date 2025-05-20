package com.cnpm.managehotel.service.impl;

import com.cnpm.managehotel.dto.ProductDTO;
import com.cnpm.managehotel.entity.Category;
import com.cnpm.managehotel.entity.Product;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.mapper.ProductMapper;
import com.cnpm.managehotel.repository.CategoryRepo;
import com.cnpm.managehotel.repository.ProductRepo;
import com.cnpm.managehotel.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepo productRepo;
    private final CategoryRepo categoryRepo;
    private final ProductMapper productMapper;

    @Override
    public ProductDTO save(ProductDTO request) {
        Product product;

        if (request.getId() != null && productRepo.existsById(request.getId())) {
            product = productRepo.findById(request.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

            productMapper.updateEntity(request, product);
        } else {

            product = productMapper.toEntity(request);
        }

        Category category = categoryRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        product.setCategory(category);

        Product saved = productRepo.save(product);

        return productMapper.toDTO(saved);
    }

    @Override
    public ProductDTO findAll() {
        List<Product> entities = productRepo.findAll();
        List<ProductDTO> dtos = productMapper.toDTOList(entities);
        ProductDTO response = new ProductDTO();

        response.setListResult(dtos);
        return response;
    }


}
