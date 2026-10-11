package com.bookstore.service;

import com.bookstore.dto.AddToCartRequest;
import com.bookstore.dto.CartDto;
import com.bookstore.dto.CartItemDto;
import com.bookstore.dto.UpdateCartItemRequest;
import com.bookstore.entity.Book;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CartItemRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartDto getCart(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<CartItem> items = cartItemRepository.findByUserId(user.getId());
        return buildCartDto(items);
    }

    @Override
    public CartDto addToCart(String userEmail, AddToCartRequest request) {
        User user = getUserByEmail(userEmail);
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + request.getBookId()));

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndBookId(user.getId(), book.getId());

        int newQuantity = request.getQuantity();
        if (existingItemOpt.isPresent()) {
            newQuantity += existingItemOpt.get().getQuantity();
        }

        if (newQuantity > book.getStock()) {
            throw new BadRequestException("Requested quantity (" + newQuantity + ") exceeds available stock (" + book.getStock() + ")");
        }

        if (existingItemOpt.isPresent()) {
            CartItem item = existingItemOpt.get();
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .user(user)
                    .book(book)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
        }

        List<CartItem> items = cartItemRepository.findByUserId(user.getId());
        return buildCartDto(items);
    }

    @Override
    public CartDto updateCartItem(String userEmail, Long cartItemId, UpdateCartItemRequest request) {
        User user = getUserByEmail(userEmail);
        CartItem cartItem = cartItemRepository.findByIdAndUserId(cartItemId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        Book book = cartItem.getBook();
        if (request.getQuantity() > book.getStock()) {
            throw new BadRequestException("Requested quantity (" + request.getQuantity() + ") exceeds available stock (" + book.getStock() + ")");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        List<CartItem> items = cartItemRepository.findByUserId(user.getId());
        return buildCartDto(items);
    }

    @Override
    public CartDto removeCartItem(String userEmail, Long cartItemId) {
        User user = getUserByEmail(userEmail);
        CartItem cartItem = cartItemRepository.findByIdAndUserId(cartItemId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        cartItemRepository.delete(cartItem);

        List<CartItem> items = cartItemRepository.findByUserId(user.getId());
        return buildCartDto(items);
    }

    @Override
    public void clearCart(String userEmail) {
        User user = getUserByEmail(userEmail);
        cartItemRepository.deleteByUserId(user.getId());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private CartDto buildCartDto(List<CartItem> items) {
        List<CartItemDto> itemDtos = items.stream().map(item -> {
            BigDecimal subtotal = item.getBook().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return CartItemDto.builder()
                    .id(item.getId())
                    .bookId(item.getBook().getId())
                    .bookTitle(item.getBook().getTitle())
                    .bookAuthor(item.getBook().getAuthor())
                    .bookIsbn(item.getBook().getIsbn())
                    .bookPrice(item.getBook().getPrice())
                    .bookImageUrl(item.getBook().getImageUrl())
                    .quantity(item.getQuantity())
                    .subtotal(subtotal)
                    .build();
        }).toList();

        int totalItems = itemDtos.stream().mapToInt(CartItemDto::getQuantity).sum();
        BigDecimal totalPrice = itemDtos.stream()
                .map(CartItemDto::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDto.builder()
                .items(itemDtos)
                .totalItems(totalItems)
                .totalPrice(totalPrice)
                .build();
    }
}
