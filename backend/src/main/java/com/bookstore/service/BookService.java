package com.bookstore.service;

import com.bookstore.dto.BookDto;
import com.bookstore.dto.CreateBookRequest;
import com.bookstore.dto.UpdateBookRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookService {
    Page<BookDto> getBooks(String search, Long categoryId, Pageable pageable);
    BookDto getBookById(Long id);
    BookDto getBookByIsbn(String isbn);
    List<BookDto> getFeaturedBooks();
    BookDto createBook(CreateBookRequest request);
    BookDto updateBook(Long id, UpdateBookRequest request);
    BookDto updateStock(Long id, Integer stock);
    void deleteBook(Long id);
}
