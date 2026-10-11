package com.bookstore.controller;

import com.bookstore.dto.*;
import com.bookstore.entity.OrderStatus;
import com.bookstore.service.AdminService;
import com.bookstore.service.BookService;
import com.bookstore.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;
    private final BookService bookService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboardStats() {
        AdminDashboardDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard statistics", stats));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<OrderDto> orders = orderService.getAllOrders(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderDto updated = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", updated));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getCustomers() {
        List<CustomerDto> customers = adminService.getCustomers();
        return ResponseEntity.ok(ApiResponse.success("Customers list retrieved successfully", customers));
    }

    @PatchMapping("/books/{id}/stock")
    public ResponseEntity<ApiResponse<BookDto>> updateBookStock(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStockRequest request
    ) {
        BookDto updated = bookService.updateStock(id, request.getStock());
        return ResponseEntity.ok(ApiResponse.success("Book stock updated successfully", updated));
    }
}
