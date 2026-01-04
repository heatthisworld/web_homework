package com.hospital.exception;

import com.hospital.model.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler({IllegalArgumentException.class, MissingServletRequestParameterException.class, HttpMessageNotReadableException.class})
    public Result<String> handleBadRequest(Exception ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return Result.error(400, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Result<String> handleServerError(Exception ex) {
        log.error("Unhandled server error", ex);
        return Result.error(500, "服务器内部错误：" + ex.getMessage());
    }
}
