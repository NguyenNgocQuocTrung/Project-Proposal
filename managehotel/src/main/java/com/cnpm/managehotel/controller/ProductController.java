package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.dto.ProductDTO;
import com.cnpm.managehotel.dto.response.ApiResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Product API", description = "CRUD for hotel products")
public class ProductController {

    private final ProductService productService;

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        return new ResponseEntity<>(response, errorCode.getStatusCode());
    }

    @PostMapping
    @Operation(
            summary = "Create a new product",
            description = "Adds a new product to the system with details like name, price, description, and quantity"
    )
    public ApiResponse<ProductDTO> createProduct(@RequestBody ProductDTO request) {
        ProductDTO result = productService.save(request);
        return ApiResponse.<ProductDTO>builder()
                .result(result)
                .build();
    }

    @PutMapping
    @Operation(
            summary = "Update an existing product",
            description = "Updates product details such as name, description, price, or quantity based on the provided ID"
    )
    public ApiResponse<ProductDTO> updateProduct(@RequestBody ProductDTO request) {
        ProductDTO result = productService.save(request);
        return ApiResponse.<ProductDTO>builder()
                .result(result)
                .build();
    }

    @GetMapping
    @Operation(
            summary = "Get all product",
            description = "Get all prodcut in database"
    )
    public ApiResponse<ProductDTO> getAllProduct() {
        ProductDTO result = productService.findAll();
        return ApiResponse.<ProductDTO>builder()
                .result(result)
                .build();
    }
}
