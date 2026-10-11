package com.bookstore.service;

import com.bookstore.dto.AdminDashboardDto;
import com.bookstore.dto.CustomerDto;

import java.util.List;

public interface AdminService {
    AdminDashboardDto getDashboardStats();
    List<CustomerDto> getCustomers();
}
