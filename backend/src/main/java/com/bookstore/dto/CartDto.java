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
public class CartDto {
    @Builder.Default
    private List<CartItemDto> items = new ArrayList<>();
    private Integer totalItems;
    private BigDecimal totalPrice;
}
