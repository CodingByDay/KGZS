import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/app/components/AppShell';
import { prijavaService, PrijavaDto, PrijavaStatus } from '@/application/services/PrijavaService';
import { productService, ProductDto } from '@/application/services/ProductService';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useTranslation } from 'react-i18next';
import { HiPencil, HiTrash, HiFunnel, HiPlus, HiEye, HiCreditCard } from 'react-icons/hi2';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

const getStatusColor = (status: PrijavaStatus): string => {
  switch (status) {
    case PrijavaStatus.PendingPayment:
      return 'bg-yellow-100 text-yellow-800';
    case PrijavaStatus.PendingAdminConfirmation:
      return 'bg-blue-100 text-blue-800';
    case PrijavaStatus.PendingReview:
      return 'bg-green-100 text-green-800';
    case PrijavaStatus.Rejected:
      return 'bg-red-100 text-red-800';
    case PrijavaStatus.Cancelled:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: PrijavaStatus, t: any): string => {
  switch (status) {
    case PrijavaStatus.PendingPayment:
      return t('prijave.status.pendingPayment') || 'Pending Payment';
    case PrijavaStatus.PendingAdminConfirmation:
      return t('prijave.status.pendingAdminConfirmation') || 'Pending Admin Confirmation';
    case PrijavaStatus.PendingReview:
      return t('prijave.status.pendingReview') || 'Pending Review';
    case PrijavaStatus.Rejected:
      return t('prijave.status.rejected') || 'Rejected';
    case PrijavaStatus.Cancelled:
      return t('prijave.status.cancelled') || 'Cancelled';
    default:
      return '';
  }
};

export function PrijavePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [prijave, setPrijave] = useState<PrijavaDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrijava, setSelectedPrijava] = useState<PrijavaDto | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemFilter, setItemFilter] = useState<string>('all');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [toDateFilter, setToDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [prijaveData, productsData] = await Promise.all([
        prijavaService.getPrijave(),
        productService.getProducts()
      ]);
      
      setPrijave(prijaveData);
      setProducts(productsData);
    } catch (err) {
      const apiError = err as ApiError;
      console.error('PrijavePage: Error loading data:', err);
      setError(apiError.message || t('prijave.messages.loadError') || 'Failed to load prijave');
      addToast('error', apiError.message || t('prijave.messages.loadError') || 'Failed to load prijave');
    } finally {
      setLoading(false);
    }
  };

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const handleDelete = async () => {
    if (!selectedPrijava) return;

    try {
      await prijavaService.deletePrijava(selectedPrijava.id);
      addToast('success', t('prijave.messages.deleteSuccess') || 'Prijava deleted successfully');
      setShowDeleteModal(false);
      setSelectedPrijava(null);
      loadData();
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('prijave.messages.deleteError') || 'Failed to delete prijava');
    }
  };

  const filteredPrijave = prijave.filter((prijava) => {
    if (statusFilter !== 'all' && prijava.status !== parseInt(statusFilter)) return false;
    if (itemFilter !== 'all' && prijava.itemId !== itemFilter) return false;
    if (fromDateFilter) {
      const fromDate = new Date(fromDateFilter);
      if (new Date(prijava.createdAt) < fromDate) return false;
    }
    if (toDateFilter) {
      const toDate = new Date(toDateFilter);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(prijava.createdAt) > toDate) return false;
    }
    return true;
  });

  const hasActiveFilters = statusFilter !== 'all' || itemFilter !== 'all' || fromDateFilter || toDateFilter;

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">{t('common.loading') || 'Loading...'}</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('prijave.pageTitle') || 'Prijave'}</h1>
            <p className="text-gray-600 mt-1">{t('prijave.pageSubtitle') || 'Manage your applications'}</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log('Button clicked - navigating to /app/prijave/new');
              console.log('Current location:', window.location.href);
              navigate('/app/prijave/new');
              console.log('Navigate called');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HiPlus className="w-5 h-5" />
            {t('prijave.addButton') || 'New Prijava'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <HiFunnel className="w-4 h-4" />
              {t('common.filters') || 'Filters'}
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {[statusFilter !== 'all' && '1', itemFilter !== 'all' && '1', fromDateFilter && '1', toDateFilter && '1'].filter(Boolean).length}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setItemFilter('all');
                  setFromDateFilter('');
                  setToDateFilter('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {t('common.clearFilters') || 'Clear Filters'}
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('prijave.table.status') || 'Status'}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  <option value={PrijavaStatus.PendingPayment.toString()}>{t('prijave.status.pendingPayment') || 'Pending Payment'}</option>
                  <option value={PrijavaStatus.PendingAdminConfirmation.toString()}>{t('prijave.status.pendingAdminConfirmation') || 'Pending Admin Confirmation'}</option>
                  <option value={PrijavaStatus.PendingReview.toString()}>{t('prijave.status.pendingReview') || 'Pending Review'}</option>
                  <option value={PrijavaStatus.Rejected.toString()}>{t('prijave.status.rejected') || 'Rejected'}</option>
                  <option value={PrijavaStatus.Cancelled.toString()}>{t('prijave.status.cancelled') || 'Cancelled'}</option>
                </select>
              </div>

              {/* Item filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('prijave.table.item') || 'Item'}
                </label>
                <select
                  value={itemFilter}
                  onChange={(e) => setItemFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* From date filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('prijave.table.fromDate') || 'From Date'}
                </label>
                <input
                  type="date"
                  value={fromDateFilter}
                  onChange={(e) => setFromDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* To date filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('prijave.table.toDate') || 'To Date'}
                </label>
                <input
                  type="date"
                  value={toDateFilter}
                  onChange={(e) => setToDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('prijave.table.item') || 'Item'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('prijave.table.dueDate') || 'Due Date'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('prijave.table.status') || 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('prijave.table.paymentMethod') || 'Payment Method'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('prijave.table.createdAt') || 'Created'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions') || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrijave.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      {t('common.noResults') || 'No results found'}
                    </td>
                  </tr>
                ) : (
                  filteredPrijave.map((prijava) => (
                    <tr key={prijava.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{prijava.itemName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(prijava.reviewDueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prijava.status)}`}>
                          {getStatusText(prijava.status, t)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {prijava.payment
                            ? prijava.payment.paymentMethod === 0
                              ? 'Stripe'
                              : prijava.payment.paymentMethod === 1
                              ? 'Card'
                              : 'Bank Transfer'
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(prijava.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/app/prijave/${prijava.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title={t('common.view') || 'View'}
                          >
                            <HiEye className="w-5 h-5" />
                          </button>
                          {(prijava.status === PrijavaStatus.PendingPayment || prijava.status === PrijavaStatus.PendingAdminConfirmation) && (
                            <button
                              onClick={() => navigate(`/app/prijave/${prijava.id}`)}
                              className="text-gray-600 hover:text-gray-900"
                              title={t('prijave.edit') || 'Edit'}
                            >
                              <HiPencil className="w-5 h-5" />
                            </button>
                          )}
                          {prijava.status === PrijavaStatus.PendingPayment && (
                            <button
                              onClick={() => navigate(`/app/prijave/${prijava.id}`)}
                              className="text-green-600 hover:text-green-900"
                              title={t('prijave.pay') || 'Pay'}
                            >
                              <HiCreditCard className="w-5 h-5" />
                            </button>
                          )}
                          {prijava.status !== PrijavaStatus.PendingReview && (
                            <button
                              onClick={() => {
                                setSelectedPrijava(prijava);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title={t('common.delete') || 'Delete'}
                            >
                              <HiTrash className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && selectedPrijava && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('prijave.deleteModal.title') || 'Delete Prijava'}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('prijave.deleteModal.description', { itemName: selectedPrijava.itemName }) || 
                  `Are you sure you want to delete the prijava for ${selectedPrijava.itemName}? This action cannot be undone.`}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedPrijava(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('common.delete') || 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
