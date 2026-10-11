import React, { useState, useEffect } from 'react';
import client from '@/api/client';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Tags, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminCategories() {
  useDocumentTitle('Departments & Categories');
  const { success, error: showError } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete Dialog
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await client.get('/categories');
      setCategories(res.data?.data || []);
    } catch {
      showError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setNameError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setDescription(cat.description || '');
    setNameError('');
    setModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Department name is required');
      return;
    }
    setNameError('');
    setSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
    };

    try {
      if (editingCategory) {
        await client.put(`/categories/${editingCategory.id}`, payload);
        success(`Department "${payload.name}" updated successfully`);
      } else {
        await client.post('/categories', payload);
        success(`Department "${payload.name}" created`);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await client.delete(`/categories/${categoryToDelete.id}`);
      success(`Department "${categoryToDelete.name}" deleted`);
      setDeleteModalOpen(false);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    } catch (err) {
      showError(err.response?.data?.message || 'Cannot delete department containing active books');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border pb-6">
        <div>
          <span className="text-xs uppercase tracking-wide-label font-bold text-forest block mb-1">
            Department Taxonomy
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight-title">
            Categories & Departments ({categories.length})
          </h2>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Department
        </Button>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="bg-paper-light border border-paper-border rounded-lg shadow-paper overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper-muted border-b border-paper-border text-[10px] uppercase tracking-wide-label text-ink-subtle">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Department Name</th>
                <th className="px-5 py-3.5">Archival Description</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border text-ink">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-paper/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-ink-subtle">{cat.id}</td>
                  <td className="px-5 py-4 font-serif font-bold text-sm text-ink">{cat.name}</td>
                  <td className="px-5 py-4 text-ink-muted max-w-md">{cat.description || 'No description recorded.'}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-ink-muted hover:text-ink hover:bg-paper-muted rounded transition-colors"
                        title="Edit department"
                        aria-label={`Edit ${cat.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(cat)}
                        className="p-1.5 text-ink-muted hover:text-terracotta hover:bg-terracotta/10 rounded transition-colors"
                        title="Delete department"
                        aria-label={`Delete ${cat.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Tags}
          title="No Categories Configured"
          description="Create your first department to organize books in the storefront."
          actionLabel="Create Department"
          onAction={handleOpenAdd}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Department' : 'Create New Department'}
        description="Departments organize titles on the storefront navigation and catalogue filters."
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Department Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            error={nameError}
            placeholder="e.g. Rare Manuscripts & Essays"
            required
          />

          <div>
            <label className="text-xs uppercase tracking-wide-label text-ink-muted font-medium select-none block mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of books curated under this taxonomy..."
              className="w-full p-3 text-xs bg-paper-light border border-paper-border rounded text-ink outline-none focus:border-ink transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-paper-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={saving}
            >
              {editingCategory ? 'Save Department' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Department"
        description={`Are you certain you wish to remove the "${categoryToDelete?.name}" department? This will fail if books remain assigned to it.`}
        confirmLabel="Confirm Deletion"
        isLoading={deleting}
      />
    </div>
  );
}
