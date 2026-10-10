package com.bookstore.service;

import com.bookstore.dto.BookDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookService {
    Page<BookDto> getBooks(String query, Long categoryId, Pageable pageable);
    BookDto getBookById(Long id);
    BookDto getBookByIsbn(String isbn);
    List<BookDto> getFeaturedBooks();
    BookDto createBook(BookDto bookDto);
    BookDto updateBook(Long id, BookDto bookDto);
    void deleteBook(Long id);
}
