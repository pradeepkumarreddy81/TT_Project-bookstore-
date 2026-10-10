package com.bookstore.controller;

import com.bookstore.dto.ApiResponse;
import com.bookstore.entity.CartItem;
import com.bookstore.repository.CartItemRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CartItem>>> getCartItems(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByEmail(userDetails.getUsername())
                .map(u -> u.getId())
                .orElse(0L);
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart items retrieved successfully", items));
    }
}
