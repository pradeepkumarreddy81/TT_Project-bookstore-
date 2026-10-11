package com.bookstore.service;

import com.bookstore.dto.AdminDashboardDto;
import com.bookstore.dto.BookDto;
import com.bookstore.dto.CustomerDto;
import com.bookstore.dto.OrderDto;
import com.bookstore.dto.OrderItemDto;
import com.bookstore.entity.Book;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderStatus;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;

    @Override
    public AdminDashboardDto getDashboardStats() {
        long totalBooks = bookRepository.count();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue(OrderStatus.CANCELLED);

        List<Book> lowStockEntities = bookRepository.findByStockLessThanOrderByStockAsc(5);
        List<BookDto> lowStockBooks = lowStockEntities.stream().map(this::mapBookToDto).toList();

        List<Order> last5OrderEntities = orderRepository.findTop5ByOrderByCreatedAtDesc();
        List<OrderDto> last5Orders = last5OrderEntities.stream().map(this::mapOrderToDto).toList();

        return AdminDashboardDto.builder()
                .totalBooks(totalBooks)
                .totalCustomers(totalCustomers)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .lowStockBooks(lowStockBooks)
                .last5Orders(last5Orders)
                .build();
    }

    @Override
    public List<CustomerDto> getCustomers() {
        List<User> customers = userRepository.findByRoleOrderByCreatedAtDesc(Role.CUSTOMER);
        return customers.stream().map(user -> CustomerDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .orderCount(orderRepository.countByUserId(user.getId()))
                .build()
        ).toList();
    }

    private BookDto mapBookToDto(Book book) {
        return BookDto.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .description(book.getDescription())
                .price(book.getPrice())
                .stock(book.getStock())
                .imageUrl(book.getImageUrl())
                .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .createdAt(book.getCreatedAt())
                .build();
    }

    private OrderDto mapOrderToDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream().map(item -> {
            BigDecimal subtotal = item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()));
            return OrderItemDto.builder()
                    .id(item.getId())
                    .bookId(item.getBook().getId())
                    .bookTitle(item.getBook().getTitle())
                    .bookAuthor(item.getBook().getAuthor())
                    .bookImageUrl(item.getBook().getImageUrl())
                    .quantity(item.getQuantity())
                    .priceAtPurchase(item.getPriceAtPurchase())
                    .subtotal(subtotal)
                    .build();
        }).toList();

        return OrderDto.builder()
                .id(order.getId())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userName(order.getUser() != null ? order.getUser().getName() : null)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .items(itemDtos)
                .build();
    }
}
