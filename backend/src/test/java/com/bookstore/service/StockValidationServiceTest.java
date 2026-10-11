package com.bookstore.service;

import com.bookstore.dto.AddToCartRequest;
import com.bookstore.dto.CreateOrderRequest;
import com.bookstore.dto.UpdateCartItemRequest;
import com.bookstore.entity.Book;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockValidationServiceTest {

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

    private CartServiceImpl cartService;

    private User customer;
    private Book lowStockBook;

    @BeforeEach
    void setUp() {
        cartService = new CartServiceImpl(cartItemRepository, bookRepository, userRepository);

        customer = User.builder()
                .id(2L)
                .name("Charlie")
                .email("charlie@example.com")
                .role(Role.CUSTOMER)
                .build();

        lowStockBook = Book.builder()
                .id(202L)
                .title("Rare Collector Book")
                .author("Famous Author")
                .price(new BigDecimal("120.00"))
                .stock(3) // Only 3 copies available!
                .build();
    }

    @Test
    @DisplayName("Unit test: Order placement fails with BadRequestException when requested quantity exceeds available book stock")
    void testOrderPlacementFailsWhenStockInsufficient() {
        CartItem cartItemExceedingStock = CartItem.builder()
                .id(601L)
                .user(customer)
                .book(lowStockBook)
                .quantity(5) // Wants 5, but only 3 in stock!
                .build();

        CreateOrderRequest request = CreateOrderRequest.builder()
                .shippingAddress("456 Oak Avenue")
                .build();

        when(userRepository.findByEmail("charlie@example.com")).thenReturn(Optional.of(customer));
        when(cartItemRepository.findByUserId(2L)).thenReturn(List.of(cartItemExceedingStock));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orderService.placeOrder("charlie@example.com", request)
        );

        assertTrue(ex.getMessage().contains("Insufficient stock"));
        assertTrue(ex.getMessage().contains("Available: 3"));
        assertTrue(ex.getMessage().contains("requested: 5"));

        // Verify no order was saved and stock remained untouched at 3
        verify(orderRepository, never()).save(any());
        assertEquals(3, lowStockBook.getStock());
    }

    @Test
    @DisplayName("Unit test: Adding to cart fails when quantity exceeds available stock")
    void testAddToCartFailsWhenQuantityExceedsStock() {
        AddToCartRequest request = AddToCartRequest.builder()
                .bookId(202L)
                .quantity(10) // Only 3 in stock
                .build();

        when(userRepository.findByEmail("charlie@example.com")).thenReturn(Optional.of(customer));
        when(bookRepository.findById(202L)).thenReturn(Optional.of(lowStockBook));
        when(cartItemRepository.findByUserIdAndBookId(2L, 202L)).thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                cartService.addToCart("charlie@example.com", request)
        );

        assertTrue(ex.getMessage().contains("exceeds available stock"));
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Unit test: Updating cart item fails when updated quantity exceeds available stock")
    void testUpdateCartItemFailsWhenQuantityExceedsStock() {
        CartItem existingItem = CartItem.builder()
                .id(701L)
                .user(customer)
                .book(lowStockBook)
                .quantity(2)
                .build();

        UpdateCartItemRequest request = UpdateCartItemRequest.builder()
                .quantity(4) // 4 > 3 available
                .build();

        when(userRepository.findByEmail("charlie@example.com")).thenReturn(Optional.of(customer));
        when(cartItemRepository.findByIdAndUserId(701L, 2L)).thenReturn(Optional.of(existingItem));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                cartService.updateCartItem("charlie@example.com", 701L, request)
        );

        assertTrue(ex.getMessage().contains("exceeds available stock"));
    }
}
