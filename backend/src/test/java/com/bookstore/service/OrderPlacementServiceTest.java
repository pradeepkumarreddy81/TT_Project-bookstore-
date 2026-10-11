package com.bookstore.service;

import com.bookstore.dto.CreateOrderRequest;
import com.bookstore.dto.OrderDto;
import com.bookstore.entity.*;
import com.bookstore.exception.BadRequestException;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CartItemRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderPlacementServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User customer;
    private Book book;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        customer = User.builder()
                .id(1L)
                .name("Bob Builder")
                .email("bob@example.com")
                .role(Role.CUSTOMER)
                .build();

        book = Book.builder()
                .id(101L)
                .title("Clean Code")
                .author("Robert C. Martin")
                .isbn("978-0132350884")
                .price(new BigDecimal("40.00"))
                .stock(10)
                .build();

        cartItem = CartItem.builder()
                .id(501L)
                .user(customer)
                .book(book)
                .quantity(2)
                .build();
    }

    @Test
    @DisplayName("Unit test: Successful order placement converts cart, decrements stock, records priceAtPurchase, and clears cart")
    void testPlaceOrderSuccess() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .shippingAddress("123 Elm Street, Cityville")
                .build();

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(customer));
        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of(cartItem));

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order orderToSave = invocation.getArgument(0);
            orderToSave.setId(999L);
            orderToSave.setCreatedAt(LocalDateTime.now());
            return orderToSave;
        });

        OrderDto result = orderService.placeOrder("bob@example.com", request);

        // Verify order result
        assertNotNull(result);
        assertEquals(999L, result.getId());
        assertEquals(1L, result.getUserId());
        assertEquals(OrderStatus.PENDING, result.getStatus());
        assertEquals("123 Elm Street, Cityville", result.getShippingAddress());
        assertEquals(new BigDecimal("80.00"), result.getTotalAmount()); // 2 * 40.00
        assertEquals(1, result.getItems().size());
        assertEquals(new BigDecimal("40.00"), result.getItems().get(0).getPriceAtPurchase());

        // Verify stock decremented from 10 to 8
        assertEquals(8, book.getStock());
        verify(bookRepository).save(book);

        // Verify cart was cleared
        verify(cartItemRepository).deleteByUserId(1L);
    }

    @Test
    @DisplayName("Unit test: Empty cart throws BadRequestException and does not create an order")
    void testPlaceOrderWithEmptyCartThrowsBadRequest() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .shippingAddress("123 Elm Street")
                .build();

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(customer));
        when(cartItemRepository.findByUserId(1L)).thenReturn(new ArrayList<>());

        BadRequestException exception = assertThrows(BadRequestException.class, () ->
                orderService.placeOrder("bob@example.com", request)
        );

        assertTrue(exception.getMessage().contains("empty cart"));
        verify(orderRepository, never()).save(any());
        verify(cartItemRepository, never()).deleteByUserId(any());
    }
}
