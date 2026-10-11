package com.bookstore.service;

import com.bookstore.dto.AddToCartRequest;
import com.bookstore.dto.CartDto;
import com.bookstore.dto.UpdateCartItemRequest;

public interface CartService {
    CartDto getCart(String userEmail);
    CartDto addToCart(String userEmail, AddToCartRequest request);
    CartDto updateCartItem(String userEmail, Long cartItemId, UpdateCartItemRequest request);
    CartDto removeCartItem(String userEmail, Long cartItemId);
    void clearCart(String userEmail);
}
