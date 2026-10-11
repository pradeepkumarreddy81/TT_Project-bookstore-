import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import AdminRoute from '@/components/shared/AdminRoute';

// Lazy-loaded Storefront Pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const CataloguePage = lazy(() => import('@/pages/CataloguePage'));
const BookDetailPage = lazy(() => import('@/pages/BookDetailPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Lazy-loaded Admin Studio Pages
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminBooks = lazy(() => import('@/pages/admin/AdminBooks'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers'));

function PageLoader() {
  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center font-sans">
      <div className="w-9 h-9 border-2 border-terracotta border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-xs uppercase tracking-wide-label text-ink-muted font-medium">
        Retrieving Archival Folio...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-paper text-ink selection:bg-terracotta/20 selection:text-ink font-sans">
                <Navbar />

                <div className="flex-1">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/books" element={<CataloguePage />} />
                      <Route path="/catalog" element={<CataloguePage />} />
                      <Route path="/books/:id" element={<BookDetailPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />

                      {/* Customer protected routes */}
                      <Route
                        path="/cart"
                        element={
                          <ProtectedRoute>
                            <CartPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <CheckoutPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders/confirmed/:id"
                        element={
                          <ProtectedRoute>
                            <OrderConfirmationPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <ProtectedRoute>
                            <OrdersPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Studio routes (Protected by AdminRoute) */}
                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminLayout />
                          </AdminRoute>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="books" element={<AdminBooks />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="customers" element={<AdminCustomers />} />
                      </Route>

                      {/* 404 Route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </div>

                <Footer />
              </div>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
