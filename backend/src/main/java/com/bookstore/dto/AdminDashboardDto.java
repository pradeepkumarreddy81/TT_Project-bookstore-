package com.bookstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private long totalBooks;
    private long totalCustomers;
    private long totalOrders;
    private BigDecimal totalRevenue;
    @Builder.Default
    private List<BookDto> lowStockBooks = new ArrayList<>();
    @Builder.Default
    private List<OrderDto> last5Orders = new ArrayList<>();
}
