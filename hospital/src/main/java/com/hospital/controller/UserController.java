package com.hospital.controller;

import com.hospital.entity.User;
import com.hospital.model.Result;
import com.hospital.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public Result<List<User>> getAllUsers() {
        return Result.success(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public Result<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(Result::success)
                .orElseGet(() -> Result.error(404, "用户不存在"));
    }

    @GetMapping("/username/{username}")
    public Result<User> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.getUserByUsername(username);
        return user.map(Result::success)
                .orElseGet(() -> Result.error(404, "用户不存在"));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success();
    }
}
