package com.housing.market.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Thrown when the Task 1 model API cannot be reached. Maps to HTTP 502. */
@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class ModelUnavailableException extends RuntimeException {

    public ModelUnavailableException(String message) {
        super(message);
    }
}
