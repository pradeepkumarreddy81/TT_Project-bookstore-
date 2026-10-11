package com.bookstore.service;

import com.bookstore.dto.CreateOrderRequest;
import com.bookstore.dto.OrderDto;
import com.bookstore.dto.UpdateOrderStatusRequest;
import com.bookstore.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {
    OrderDto placeOrder(String userEmail, CreateOrderRequest request);
    List<OrderDto> getMyOrders(String userEmail);
    OrderDto getOrderById(String userEmail, Long orderId);
    Page<OrderDto> getAllOrders(OrderStatus status, Pageable pageable);
    OrderDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request);
}
