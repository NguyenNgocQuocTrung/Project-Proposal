package com.cnpm.managehotel.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    INVALID_DATE(1009, "Check-in date must come before check-out date", HttpStatus.BAD_REQUEST),
    NOT_ENOUGH_STOCK(2001, "Not enough stock available", HttpStatus.BAD_REQUEST),
    ROOM_NOT_FOUND(2001, "Roonm does not exist", HttpStatus.BAD_REQUEST),
    ROOM_CONFLICT(2002, "Room number already exist", HttpStatus.BAD_REQUEST),
    ROOM_IN_USE(2003, "Room is in use", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_FOUND(3001, "Booking does not exist", HttpStatus.BAD_REQUEST),
    FEEDBACK_NOT_FOUND(4001, "Feedback does not exist", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_FOUND(5001, "Product does not exist", HttpStatus.BAD_REQUEST),
    NOT_ENOUGH(5002, "Amount of product not enough in stock", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(6001, "Category does not exist", HttpStatus.BAD_REQUEST),
    SERVICE_NOT_FOUND(7001, "Service does not exist", HttpStatus.BAD_REQUEST),
    INVOICE_NOT_FOUND(8001, "Invoice does not exist", HttpStatus.BAD_REQUEST),
    TOTAL_NOT_EQUAL(8001, "Total price not equal", HttpStatus.BAD_REQUEST)
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
