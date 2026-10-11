package com.bookstore.service;

import com.bookstore.dto.BookDto;
import com.bookstore.dto.CreateBookRequest;
import com.bookstore.dto.UpdateBookRequest;
import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public Page<BookDto> getBooks(String search, Long categoryId, Pageable pageable) {
        Page<Book> books = bookRepository.searchAndFilterBooks(search, categoryId, pageable);
        return books.map(this::mapToDto);
    }

    @Override
    public BookDto getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return mapToDto(book);
    }

    @Override
    public BookDto getBookByIsbn(String isbn) {
        Book book = bookRepository.findByIsbn(isbn)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ISBN: " + isbn));
        return mapToDto(book);
    }

    @Override
    public List<BookDto> getFeaturedBooks() {
        Pageable topSix = PageRequest.of(0, 6);
        return bookRepository.findAll(topSix).getContent().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional
    public BookDto createBook(CreateBookRequest request) {
        if (bookRepository.existsByIsbn(request.getIsbn().trim())) {
            throw new BadRequestException("Book with ISBN " + request.getIsbn() + " already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Book book = Book.builder()
                .title(request.getTitle().trim())
                .author(request.getAuthor().trim())
                .isbn(request.getIsbn().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .category(category)
                .build();

        return mapToDto(bookRepository.save(book));
    }

    @Override
    @Transactional
    public BookDto updateBook(Long id, UpdateBookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        if (request.getIsbn() != null && !request.getIsbn().trim().equalsIgnoreCase(book.getIsbn())) {
            if (bookRepository.existsByIsbn(request.getIsbn().trim())) {
                throw new BadRequestException("Book with ISBN " + request.getIsbn() + " already exists");
            }
            book.setIsbn(request.getIsbn().trim());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            book.setCategory(category);
        }

        if (request.getTitle() != null) book.setTitle(request.getTitle().trim());
        if (request.getAuthor() != null) book.setAuthor(request.getAuthor().trim());
        if (request.getDescription() != null) book.setDescription(request.getDescription());
        if (request.getPrice() != null) book.setPrice(request.getPrice());
        if (request.getStock() != null) book.setStock(request.getStock());
        if (request.getImageUrl() != null) book.setImageUrl(request.getImageUrl());

        return mapToDto(bookRepository.save(book));
    }

    @Override
    @Transactional
    public BookDto updateStock(Long id, Integer stock) {
        if (stock < 0) {
            throw new BadRequestException("Stock cannot be negative");
        }
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        book.setStock(stock);
        return mapToDto(bookRepository.save(book));
    }

    @Override
    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        bookRepository.delete(book);
    }

    private BookDto mapToDto(Book book) {
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
}
