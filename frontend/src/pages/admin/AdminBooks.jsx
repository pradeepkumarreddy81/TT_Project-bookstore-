import React, { useState, useEffect } from 'react';
import client from '@/api/client';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import SlideOver from '@/components/ui/SlideOver';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminBooks() {
  useDocumentTitle('Books Management');
  const { success, error: showError } = useToast();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // SlideOver (Add/Edit)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formValues, setFormValues] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    categoryId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [savingBook, setSavingBook] = useState(false);

  // Delete Confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Inline Stock Edit State
  const [editingStockId, setEditingStockId] = useState(null);
  const [inlineStockVal, setInlineStockVal] = useState(0);
  const [updatingStock, setUpdatingStock] = useState(false);

  // Fetch categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await client.get('/categories');
        setCategories(res.data?.data || []);
      } catch (err) {
        console.warn('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch books
  const loadBooks = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: 8,
      };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const res = await client.get('/books', { params });
      const data = res.data?.data;
      setBooks(data?.content || []);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements || 0);
    } catch {
      showError('Failed to retrieve book catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    loadBooks();
  };

  // Open Drawer for Add
  const handleOpenAdd = () => {
    setEditingBook(null);
    setFormValues({
      title: '',
      author: '',
      isbn: '',
      description: '',
      price: '',
      stock: '',
      imageUrl: '',
      categoryId: categories[0]?.id ? String(categories[0].id) : '',
    });
    setFormErrors({});
    setDrawerOpen(true);
  };

  // Open Drawer for Edit
  const handleOpenEdit = (book) => {
    setEditingBook(book);
    setFormValues({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      description: book.description || '',
      price: String(book.price || ''),
      stock: String(book.stock ?? ''),
      imageUrl: book.imageUrl || '',
      categoryId: String(book.categoryId || categories[0]?.id || ''),
    });
    setFormErrors({});
    setDrawerOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errs = {};
    if (!formValues.title.trim()) errs.title = 'Title is required';
    if (!formValues.author.trim()) errs.author = 'Author is required';
    if (!formValues.isbn.trim()) errs.isbn = 'ISBN is required';
    if (!formValues.price || isNaN(Number(formValues.price)) || Number(formValues.price) < 0) {
      errs.price = 'Valid non-negative price is required';
    }
    if (!formValues.stock || isNaN(parseInt(formValues.stock, 10)) || parseInt(formValues.stock, 10) < 0) {
      errs.stock = 'Valid non-negative stock is required';
    }
    if (!formValues.categoryId) {
      errs.categoryId = 'Department category is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Drawer Form (Create or Update)
  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSavingBook(true);
    const payload = {
      title: formValues.title.trim(),
      author: formValues.author.trim(),
      isbn: formValues.isbn.trim(),
      description: formValues.description.trim(),
      price: parseFloat(formValues.price),
      stock: parseInt(formValues.stock, 10),
      imageUrl: formValues.imageUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      categoryId: parseInt(formValues.categoryId, 10),
    };

    try {
      if (editingBook) {
        await client.put(`/books/${editingBook.id}`, payload);
        success(`"${payload.title}" updated successfully`);
      } else {
        await client.post('/books', payload);
        success(`New volume "${payload.title}" added to catalogue`);
      }
      setDrawerOpen(false);
      loadBooks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save book record';
      showError(msg);
    } finally {
      setSavingBook(false);
    }
  };

  // Inline Stock Edit
  const handleStartInlineStock = (book) => {
    setEditingStockId(book.id);
    setInlineStockVal(book.stock);
  };

  const handleSaveInlineStock = async (bookId) => {
    setUpdatingStock(true);
    const updatedVal = parseInt(inlineStockVal, 10);
    try {
      await client.patch(`/admin/books/${bookId}/stock`, { stock: updatedVal });
      // Optimistic update in table
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, stock: updatedVal } : b))
      );
      success('Inventory stock updated');
      setEditingStockId(null);
    } catch {
      showError('Failed to update inventory');
    } finally {
      setUpdatingStock(false);
    }
  };

  // Delete Book
  const handleOpenDelete = (book) => {
    setBookToDelete(book);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    setDeleting(true);
    try {
      await client.delete(`/books/${bookToDelete.id}`);
      success(`"${bookToDelete.title}" removed from catalogue`);
      setDeleteModalOpen(false);
      setBooks((prev) => prev.filter((b) => b.id !== bookToDelete.id));
      setTotalElements((prev) => Math.max(0, prev - 1));
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to remove book');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border pb-6">
        <div>
          <span className="text-xs uppercase tracking-wide-label font-bold text-terracotta block mb-1">
            Archival Inventory
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight-title">
            Books Catalogue ({totalElements})
          </h2>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Volume
        </Button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, author, or keyword..."
            className="w-full h-10 pl-9 pr-4 text-xs bg-paper-light border border-paper-border rounded text-ink placeholder:text-ink-subtle outline-none focus:border-ink transition-colors shadow-paper"
          />
        </div>
        <Button type="submit" variant="outline" size="md">
          Search
        </Button>
      </form>

      {/* Books Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded" />
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="bg-paper-light border border-paper-border rounded-lg shadow-paper overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper-muted border-b border-paper-border text-[10px] uppercase tracking-wide-label text-ink-subtle">
              <tr>
                <th className="px-4 py-3.5">Folio</th>
                <th className="px-4 py-3.5">Title & Author</th>
                <th className="px-4 py-3.5">ISBN</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border text-ink">
              {books.map((book) => {
                const isEditingStock = editingStockId === book.id;
                const isLowStock = book.stock > 0 && book.stock < 5;
                const isOutOfStock = book.stock <= 0;

                return (
                  <tr key={book.id} className="hover:bg-paper/40 transition-colors">
                    {/* Cover Thumbnail */}
                    <td className="px-4 py-3 w-12">
                      <img
                        src={book.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                        alt={book.title}
                        className="w-9 h-12 object-cover rounded border border-paper-border bg-paper-muted shrink-0"
                      />
                    </td>

                    {/* Title & Author */}
                    <td className="px-4 py-3 max-w-xs">
                      <span className="font-serif font-bold text-ink block truncate">
                        {book.title}
                      </span>
                      <span className="text-ink-muted text-[11px] truncate block">
                        {book.author}
                      </span>
                    </td>

                    {/* ISBN */}
                    <td className="px-4 py-3 font-mono text-[11px] text-ink-subtle">
                      {book.isbn || 'N/A'}
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wide-label bg-paper-muted border border-paper-border rounded-sm font-semibold">
                        {book.categoryName || 'General'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 font-serif font-bold text-terracotta">
                      ${Number(book.price).toFixed(2)}
                    </td>

                    {/* Inline Stock Editing */}
                    <td className="px-4 py-3">
                      {isEditingStock ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={inlineStockVal}
                            onChange={(e) => setInlineStockVal(e.target.value)}
                            className="w-16 h-7 px-1.5 text-xs bg-paper border border-ink rounded font-mono"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveInlineStock(book.id)}
                            disabled={updatingStock}
                            className="p-1 text-forest hover:bg-forest/10 rounded"
                            title="Save stock"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="p-1 text-terracotta hover:bg-terracotta/10 rounded"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartInlineStock(book)}
                          className="group flex items-center gap-1.5 px-2 py-0.5 rounded border border-transparent hover:border-paper-border hover:bg-paper font-mono"
                          title="Click to quickly edit stock"
                        >
                          <span
                            className={
                              isOutOfStock
                                ? 'text-red-700 font-bold'
                                : isLowStock
                                ? 'text-terracotta font-bold'
                                : 'text-ink font-semibold'
                            }
                          >
                            {book.stock}
                          </span>
                          <Edit2 className="w-2.5 h-2.5 text-ink-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(book)}
                          className="p-1.5 text-ink-muted hover:text-ink hover:bg-paper-muted rounded transition-colors"
                          title="Edit volume details"
                          aria-label={`Edit ${book.title}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(book)}
                          className="p-1.5 text-ink-muted hover:text-terracotta hover:bg-terracotta/10 rounded transition-colors"
                          title="Delete volume"
                          aria-label={`Delete ${book.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No Matching Books Found"
          description="Adjust your search criteria or add a new volume to the inventory."
          actionLabel="Clear Search"
          onAction={() => {
            setSearchTerm('');
            loadBooks();
          }}
        />
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* Add / Edit SlideOver Drawer */}
      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingBook ? 'Edit Archival Volume' : 'Add New Book Folio'}
        description={editingBook ? `Modify catalog parameters for "${editingBook.title}".` : 'Enter details to register a new book in the inventory database.'}
      >
        <form onSubmit={handleSaveBook} className="space-y-4">
          <Input
            label="Book Title"
            value={formValues.title}
            onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
            error={formErrors.title}
            placeholder="e.g. Designing Data-Intensive Applications"
            required
          />

          <Input
            label="Author(s)"
            value={formValues.author}
            onChange={(e) => setFormValues({ ...formValues, author: e.target.value })}
            error={formErrors.author}
            placeholder="e.g. Martin Kleppmann"
            required
          />

          <Input
            label="ISBN Number"
            value={formValues.isbn}
            onChange={(e) => setFormValues({ ...formValues, isbn: e.target.value })}
            error={formErrors.isbn}
            placeholder="978-1449373320"
            required
          />

          <div>
            <label className="text-xs uppercase tracking-wide-label text-ink-muted font-medium select-none block mb-1.5">
              Department Category
            </label>
            <select
              value={formValues.categoryId}
              onChange={(e) => setFormValues({ ...formValues, categoryId: e.target.value })}
              className="w-full h-10 px-3.5 text-xs bg-paper-light border border-paper-border rounded text-ink outline-none focus:border-ink transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($ USD)"
              type="number"
              step="0.01"
              min="0"
              value={formValues.price}
              onChange={(e) => setFormValues({ ...formValues, price: e.target.value })}
              error={formErrors.price}
              placeholder="39.99"
              required
            />

            <Input
              label="Warehouse Stock"
              type="number"
              min="0"
              value={formValues.stock}
              onChange={(e) => setFormValues({ ...formValues, stock: e.target.value })}
              error={formErrors.stock}
              placeholder="15"
              required
            />
          </div>

          {/* Image URL with live preview */}
          <div>
            <Input
              label="Cover Image URL"
              value={formValues.imageUrl}
              onChange={(e) => setFormValues({ ...formValues, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />

            {formValues.imageUrl && (
              <div className="mt-2.5 p-3 bg-paper-light border border-paper-border rounded flex items-center gap-3">
                <img
                  src={formValues.imageUrl}
                  alt="Live Cover Preview"
                  className="w-12 h-16 object-cover rounded border border-paper-border"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80';
                  }}
                />
                <div className="text-[11px] text-ink-muted">
                  <span className="font-semibold text-ink block">Cover Preview Validated</span>
                  Aspect ratio 3:4 will be preserved across storefront grids.
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide-label text-ink-muted font-medium select-none block mb-1.5">
              Editorial Synopsis / Description
            </label>
            <textarea
              rows={4}
              value={formValues.description}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              placeholder="Provide a thorough synopsis of the volume's arguments and literary merit..."
              className="w-full p-3 text-xs bg-paper-light border border-paper-border rounded text-ink outline-none focus:border-ink transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-paper-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={savingBook}
            >
              {editingBook ? 'Save Changes' : 'Register Volume'}
            </Button>
          </div>
        </form>
      </SlideOver>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Expunge Book Record"
        description={`Are you certain you wish to remove "${bookToDelete?.title}" from the registry? Readers will no longer be able to purchase or view this title.`}
        confirmLabel="Confirm Deletion"
        isLoading={deleting}
      />
    </div>
  );
}
