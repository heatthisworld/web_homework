package com.hospital.exception;

import com.hospital.model.Result;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * 全局异常处理器
 */
@ControllerAdvice
@ResponseBody
public class GlobalExceptionHandler {
    
    /**
     * 处理所有未捕获的异常
     */
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e, HttpServletRequest request) {
        // 记录异常日志
        e.printStackTrace();
        
        // 返回统一的错误响应
        return Result.error(500, "服务器内部错误：" + e.getMessage());
    }
    
    /**
     * 处理运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    public Result<?> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        // 记录异常日志
        e.printStackTrace();
        
        // 返回统一的错误响应
        return Result.error(400, e.getMessage());
    }
    
    /**
     * 处理IOException异常
     */
    @ExceptionHandler(IOException.class)
    public Result<?> handleIOException(IOException e, HttpServletRequest request) {
        // 记录异常日志
        e.printStackTrace();
        
        // 返回统一的错误响应
        return Result.error(500, "IO操作异常：" + e.getMessage());
    }
    
    /**
     * 处理NullPointerException异常
     */
    @ExceptionHandler(NullPointerException.class)
    public Result<?> handleNullPointerException(NullPointerException e, HttpServletRequest request) {
        // 记录异常日志
        e.printStackTrace();
        
        // 返回统一的错误响应
        return Result.error(500, "空指针异常：" + e.getMessage());
    }
    
    /**
     * 处理IllegalArgumentException异常
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public Result<?> handleIllegalArgumentException(IllegalArgumentException e, HttpServletRequest request) {
        // 记录异常日志
        e.printStackTrace();
        
        // 返回统一的错误响应
        return Result.error(400, "参数错误：" + e.getMessage());
    }
    
    /**
     * 处理数据完整性异常，包括唯一约束异常
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public Result<?> handleDataIntegrityViolationException(DataIntegrityViolationException e, HttpServletRequest request) {
        // 记录异常日志
        e.printStackTrace();
        
        // 解析错误信息，判断是邮箱还是电话重复
        String errorMessage = e.getMessage();
        if (errorMessage != null) {
            // 使用更精确的匹配方式，确保匹配完整的字段名
            // 考虑不同数据库可能返回的不同格式
            if (errorMessage.matches(".*\b(?:email|EMAIL)\b.*") && !errorMessage.matches(".*\b(?:phone|PHONE)\b.*")) {
                return Result.error(400, "此邮箱已经被使用");
            } else if (errorMessage.matches(".*\b(?:phone|PHONE)\b.*")) {
                return Result.error(400, "此电话已经被使用");
            } else if (errorMessage.matches(".*\b(?:username|USERNAME)\b.*")) {
                return Result.error(400, "此用户名已经被使用");
            }
            // 如果无法精确匹配，尝试检查约束名称或其他模式
            else if (errorMessage.contains("email") && !errorMessage.contains("phone")) {
                return Result.error(400, "此邮箱已经被使用");
            } else if (errorMessage.contains("phone")) {
                return Result.error(400, "此电话已经被使用");
            } else if (errorMessage.contains("username")) {
                return Result.error(400, "此用户名已经被使用");
            }
        }
        
        // 返回通用的错误响应
        return Result.error(400, "数据完整性错误：" + e.getMessage());
    }
}