import { useState, useEffect } from 'react';
import { AppShell } from '@/app/components/AppShell';
import { productService, ProductDto, CreateProductRequest, UpdateProductRequest } from '@/application/services/ProductService';
import { apiClient } from '@/infrastructure/api/apiClient';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useTranslation } from 'react-i18next';
import { HiPencil, HiTrash, HiMagnifyingGlass, HiFunnel, HiXMark } from 'react-icons/hi2';

interface Group {
  id: string;
  name: string;
  description?: string;
}

interface Subgroup {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description?: string;
}

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<Group[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load products, categories, and subgroups separately to handle individual failures
      let productsData: ProductDto[] = [];
      let categoriesData: Group[] = [];
      let subgroupsData: Subgroup[] = [];
      
      try {
        productsData = await productService.getProducts();
      } catch (err) {
        console.error('ProductsPage: Error loading products:', err);
      }
      
      try {
        categoriesData = await apiClient.get<Group[]>('/api/groups');
        console.log('ProductsPage: Successfully loaded categories:', categoriesData.length, categoriesData);
      } catch (err) {
        const apiError = err as ApiError;
        console.error('ProductsPage: Error loading categories:', apiError);
        console.error('ProductsPage: Category API Error status:', apiError.status, 'message:', apiError.message);
        // Don't set error for categories, just log it - allow user to continue
      }
      
      try {
        subgroupsData = await apiClient.get<Subgroup[]>('/api/subgroups');
        console.log('ProductsPage: Successfully loaded subgroups:', subgroupsData.length, subgroupsData);
      } catch (err) {
        const apiError = err as ApiError;
        console.error('ProductsPage: Error loading subgroups:', apiError);
        // Don't set error for subgroups, just log it
      }
      
      setProducts(productsData);
      setCategories(categoriesData);
      setSubgroups(subgroupsData);
      
      if (categoriesData.length === 0) {
        console.warn('ProductsPage: No categories loaded. Check if categories exist in database or if API endpoint is accessible.');
      }
    } catch (err) {
      const apiError = err as ApiError;
      console.error('ProductsPage: Unexpected error:', err);
      setError(apiError.message || t('products.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const handleCreateProduct = async (data: CreateProductRequest, imageFile?: File) => {
    try {
      const created = await productService.createProduct(data);
      
      // Upload image if provided
      if (imageFile && created.id) {
        try {
          await productService.uploadProductImage(created.id, imageFile);
        } catch (imageErr) {
          // Log but don't fail the whole operation
          console.error('Failed to upload product image:', imageErr);
        }
      }
      
      setShowCreateModal(false);
      await loadData();
      addToast('success', t('products.messages.createSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('products.messages.createError'));
    }
  };

  const handleUpdateProduct = async (data: UpdateProductRequest) => {
    if (!selectedProduct) return;
    try {
      await productService.updateProduct(selectedProduct.id, data);
      setShowEditModal(false);
      setSelectedProduct(null);
      await loadData();
      addToast('success', t('products.messages.updateSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('products.messages.updateError'));
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await productService.deleteProduct(selectedProduct.id);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      await loadData();
      addToast('success', t('products.messages.deleteSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('products.messages.deleteError'));
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (nameFilter && !product.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    if (categoryFilter !== 'all' && product.categoryId !== categoryFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('common.loading')}</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Toasts */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-2 rounded shadow text-sm ${
                toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('products.pageTitle')}</h1>
            <p className="text-gray-600 mt-1">{t('products.pageSubtitle')}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('products.addButton')}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <HiFunnel className="w-4 h-4" />
              {t('common.filters') || 'Filters'}
              {(nameFilter || categoryFilter !== 'all') && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {[nameFilter && '1', categoryFilter !== 'all' && '1'].filter(Boolean).length}
                </span>
              )}
            </button>
            {(nameFilter || categoryFilter !== 'all') && (
              <button
                onClick={() => {
                  setNameFilter('');
                  setCategoryFilter('all');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {t('common.clearFilters') || 'Clear Filters'}
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              {/* Name filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('products.table.name')}
                </label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder={t('common.search') || 'Search...'}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('products.table.category')}
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">
                {products.length === 0 
                  ? t('products.messages.noProducts')
                  : (t('common.noResults') || 'No results found')}
              </p>
              {products.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('products.addButton')}
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.table.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.table.category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.table.description')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.table.unit')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.table.createdAt')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.categoryName}
                        {product.subcategoryName && (
                          <span className="text-gray-500"> / {product.subcategoryName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {product.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{product.unit || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title={t('products.actions.edit')}
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title={t('products.actions.delete')}
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateProductModal
            categories={categories}
            subgroups={subgroups}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateProduct}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedProduct && (
          <UpdateProductModal
            product={selectedProduct}
            categories={categories}
            subgroups={subgroups}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProduct(null);
            }}
            onSubmit={handleUpdateProduct}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedProduct && (
          <DeleteModal
            product={selectedProduct}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedProduct(null);
            }}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </AppShell>
  );
}

function CreateProductModal({
  categories,
  subgroups,
  onClose,
  onSubmit,
}: {
  categories: Group[];
  subgroups: Subgroup[];
  onClose: () => void;
  onSubmit: (data: CreateProductRequest, imageFile?: File) => void;
}) {
  const { t } = useTranslation();
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  // Debug: Log received props
  useEffect(() => {
    console.log('CreateProductModal: Received categories:', categories.length, categories);
    console.log('CreateProductModal: Received subgroups:', subgroups.length, subgroups);
    console.log('CreateProductModal: Categories array:', JSON.stringify(categories, null, 2));
  }, [categories, subgroups]);
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    categoryId: '',
    subcategoryId: '',
    description: '',
    unit: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter subgroups by selected category
  const availableSubgroups = formData.categoryId
    ? subgroups.filter(sg => sg.categoryId === formData.categoryId)
    : [];

  // Reset subcategory when category changes
  useEffect(() => {
    if (!formData.categoryId) {
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    } else if (formData.subcategoryId && !availableSubgroups.find(sg => sg.id === formData.subcategoryId)) {
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId, formData.subcategoryId, availableSubgroups]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('products.createModal.nameRequired');
    if (!formData.categoryId) newErrors.categoryId = t('products.createModal.categoryRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        description: formData.description?.trim() || undefined,
        unit: formData.unit?.trim() || undefined,
        imageUrl: formData.imageUrl || undefined,
      }, imageFile || undefined);
    }
  };

  return (
    <div 
      className="fixed bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" 
      style={{ 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: '1rem'
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('products.createModal.title')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.createModal.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('products.createModal.namePlaceholder')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.createModal.category')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">{t('products.createModal.selectCategory')}</option>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>{t('common.loading')}</option>
              )}
            </select>
            {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
            {categories.length === 0 && (
              <p className="mt-1 text-sm text-gray-500">{t('products.createModal.noCategories')}</p>
            )}
          </div>

          {/* Subcategory */}
          {formData.categoryId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.createModal.subcategory')} {t('common.optional')}
              </label>
              <select
                value={formData.subcategoryId}
                onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('products.createModal.selectSubcategory')}</option>
                {availableSubgroups.length > 0 ? (
                  availableSubgroups.map((subgroup) => (
                    <option key={subgroup.id} value={subgroup.id}>
                      {subgroup.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>{t('products.createModal.noSubcategories')}</option>
                )}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.createModal.description')} {t('common.optional')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('products.createModal.descriptionPlaceholder')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.createModal.unit')} {t('common.optional')}
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder={t('products.createModal.unitPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.createModal.image')} {t('common.optional')}
            </label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-300" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload-create"
                />
                <label
                  htmlFor="image-upload-create"
                  className="cursor-pointer text-gray-600 hover:text-gray-900"
                >
                  {t('products.createModal.uploadImage')}
                </label>
              </div>
            )}
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={uploadingImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingImage ? t('common.uploading') : t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateProductModal({
  product,
  categories,
  subgroups,
  onClose,
  onSubmit,
}: {
  product: ProductDto;
  categories: Group[];
  subgroups: Subgroup[];
  onClose: () => void;
  onSubmit: (data: UpdateProductRequest, imageFile?: File) => void;
}) {
  const { t } = useTranslation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080';
  const [formData, setFormData] = useState<UpdateProductRequest>({
    name: product.name,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId || '',
    description: product.description || '',
    unit: product.unit || '',
    imageUrl: product.imageUrl || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product.imageUrl ? `${baseUrl}${product.imageUrl}` : null
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Filter subgroups by selected category
  const availableSubgroups = formData.categoryId
    ? subgroups.filter(sg => sg.categoryId === formData.categoryId)
    : [];

  // Reset subcategory when category changes
  useEffect(() => {
    if (!formData.categoryId) {
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    } else if (formData.subcategoryId && !availableSubgroups.find(sg => sg.id === formData.subcategoryId)) {
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId, formData.subcategoryId, availableSubgroups]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('products.createModal.nameRequired');
    if (!formData.categoryId) newErrors.categoryId = t('products.createModal.categoryRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        description: formData.description?.trim() || undefined,
        unit: formData.unit?.trim() || undefined,
        imageUrl: formData.imageUrl || undefined,
      }, imageFile || undefined);
    }
  };

  return (
    <div 
      className="fixed bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" 
      style={{ 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: '1rem'
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('products.editModal.title')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.createModal.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('products.createModal.namePlaceholder')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.createModal.category')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => {
                const newCategoryId = e.target.value;
                console.log('UpdateProductModal: Category changed to:', newCategoryId, 'Available categories:', categories.length);
                setFormData({ ...formData, categoryId: newCategoryId, subcategoryId: '' });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">{t('products.createModal.selectCategory')}</option>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>{t('products.createModal.noCategories')}</option>
              )}
            </select>
            {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
            {categories.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">{t('products.createModal.noCategories')}</p>
            )}
          </div>

          {/* Subcategory */}
          {formData.categoryId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.createModal.subcategory')} {t('common.optional')}
              </label>
              <select
                value={formData.subcategoryId}
                onChange={(e) => {
                  console.log('UpdateProductModal: Subcategory changed to:', e.target.value, 'Available subgroups:', availableSubgroups.length);
                  setFormData({ ...formData, subcategoryId: e.target.value });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('products.createModal.selectSubcategory')}</option>
                {availableSubgroups.length > 0 ? (
                  availableSubgroups.map((subgroup) => (
                    <option key={subgroup.id} value={subgroup.id}>
                      {subgroup.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>{t('products.createModal.noSubcategories')}</option>
                )}
              </select>
              {availableSubgroups.length === 0 && formData.categoryId && (
                <p className="mt-1 text-sm text-gray-500">{t('products.createModal.noSubcategories')}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.createModal.description')} {t('common.optional')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('products.createModal.descriptionPlaceholder')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.createModal.unit')} {t('common.optional')}
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder={t('products.createModal.unitPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.createModal.image')} {t('common.optional')}
            </label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-300" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload-edit"
                />
                <label
                  htmlFor="image-upload-edit"
                  className="cursor-pointer text-gray-600 hover:text-gray-900"
                >
                  {t('products.createModal.uploadImage')}
                </label>
              </div>
            )}
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={uploadingImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingImage ? t('common.uploading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({
  product,
  onClose,
  onConfirm,
}: {
  product: ProductDto;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" 
      style={{ 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: '1rem'
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('products.deleteModal.title')}</h2>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            {t('products.deleteModal.message', { name: product.name })}
          </p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
