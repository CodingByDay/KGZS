import { useState, useEffect } from 'react';
import { AppShell } from '@/app/components/AppShell';
import { prijavaService, PrijavaDto, PrijavaStatus, ConfirmPaymentRequest, RejectPaymentRequest } from '@/application/services/PrijavaService';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useTranslation } from 'react-i18next';
import { HiEye, HiCheckCircle, HiXCircle, HiFunnel } from 'react-icons/hi2';

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

export function AdminPrijavePage() {
  const { t } = useTranslation();
  const [prijave, setPrijave] = useState<PrijavaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrijava, setSelectedPrijava] = useState<PrijavaDto | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await prijavaService.getAllPrijave();
      setPrijave(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('prijave.messages.loadError') || 'Failed to load prijave');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPrijava) return;

    try {
      const request: ConfirmPaymentRequest = { notes: confirmNotes || undefined };
      await prijavaService.confirmPayment(selectedPrijava.id, request);
      setShowConfirmModal(false);
      setSelectedPrijava(null);
      setConfirmNotes('');
      loadData();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to confirm payment');
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPrijava || !rejectReason.trim()) return;

    try {
      const request: RejectPaymentRequest = { reason: rejectReason };
      await prijavaService.rejectPayment(selectedPrijava.id, request);
      setShowRejectModal(false);
      setSelectedPrijava(null);
      setRejectReason('');
      loadData();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to reject payment');
    }
  };

  const filteredPrijave = prijave.filter((prijava) => {
    if (statusFilter !== 'all' && prijava.status !== parseInt(statusFilter)) return false;
    if (paymentStatusFilter !== 'all' && prijava.payment?.paymentStatus !== parseInt(paymentStatusFilter)) return false;
    if (paymentMethodFilter !== 'all' && prijava.payment?.paymentMethod !== parseInt(paymentMethodFilter)) return false;
    return true;
  });

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('prijave.admin.pageTitle') || 'Prijave Management'}</h1>
          <p className="text-gray-600 mt-1">{t('prijave.admin.pageSubtitle') || 'Review and confirm payments'}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
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
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('prijave.table.status') || 'Status'}</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  <option value={PrijavaStatus.PendingPayment.toString()}>{t('prijave.status.pendingPayment') || 'Pending Payment'}</option>
                  <option value={PrijavaStatus.PendingAdminConfirmation.toString()}>{t('prijave.status.pendingAdminConfirmation') || 'Pending Admin Confirmation'}</option>
                  <option value={PrijavaStatus.PendingReview.toString()}>{t('prijave.status.pendingReview') || 'Pending Review'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('prijave.table.paymentStatus') || 'Payment Status'}</label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  <option value="0">Unpaid</option>
                  <option value="1">Submitted</option>
                  <option value="2">Paid</option>
                  <option value="3">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('prijave.table.paymentMethod') || 'Payment Method'}</label>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  <option value="0">Stripe</option>
                  <option value="1">Card</option>
                  <option value="2">Bank Transfer</option>
                </select>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('prijave.table.organization') || 'Organization'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('prijave.table.item') || 'Item'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('prijave.table.dueDate') || 'Due Date'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('prijave.table.paymentMethod') || 'Payment Method'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('prijave.table.paymentStatus') || 'Payment Status'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('prijave.table.status') || 'Status'}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrijave.map((prijava) => (
                  <tr key={prijava.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prijava.organizationName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prijava.itemName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(prijava.reviewDueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prijava.payment
                        ? prijava.payment.paymentMethod === 0
                          ? 'Stripe'
                          : prijava.payment.paymentMethod === 1
                          ? 'Card'
                          : 'Bank Transfer'
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prijava.payment
                        ? prijava.payment.paymentStatus === 0
                          ? 'Unpaid'
                          : prijava.payment.paymentStatus === 1
                          ? 'Submitted'
                          : prijava.payment.paymentStatus === 2
                          ? 'Paid'
                          : 'Rejected'
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prijava.status)}`}>
                        {getStatusText(prijava.status, t)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPrijava(prijava);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <HiEye className="w-5 h-5" />
                        </button>
                        {prijava.status === PrijavaStatus.PendingAdminConfirmation && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedPrijava(prijava);
                                setShowConfirmModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              <HiCheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPrijava(prijava);
                                setShowRejectModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <HiXCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedPrijava && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">{t('prijave.details') || 'Details'}</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('prijave.table.organization') || 'Organization'}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedPrijava.organizationName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('prijave.table.item') || 'Item'}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedPrijava.itemName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('prijave.table.dueDate') || 'Due Date'}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(selectedPrijava.reviewDueDate).toLocaleDateString()}</dd>
                </div>
                {selectedPrijava.payment && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('prijave.table.paymentMethod') || 'Payment Method'}</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedPrijava.payment.paymentMethod === 0
                          ? 'Stripe'
                          : selectedPrijava.payment.paymentMethod === 1
                          ? 'Card'
                          : 'Bank Transfer'}
                      </dd>
                    </div>
                    {selectedPrijava.payment.bankTransferReceiptUrl && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">{t('prijave.payment.receipt') || 'Receipt'}</dt>
                        <dd className="mt-1">
                          <a
                            href={selectedPrijava.payment.bankTransferReceiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {t('prijave.payment.viewReceipt') || 'View Receipt'}
                          </a>
                        </dd>
                      </div>
                    )}
                  </>
                )}
              </dl>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedPrijava(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  {t('common.close') || 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        {showConfirmModal && selectedPrijava && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">{t('prijave.admin.confirmPayment') || 'Confirm Payment'}</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('prijave.admin.notes') || 'Notes (optional)'}</label>
                <textarea
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedPrijava(null);
                    setConfirmNotes('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('prijave.admin.confirm') || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedPrijava && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">{t('prijave.admin.rejectPayment') || 'Reject Payment'}</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('prijave.admin.reason') || 'Reason'} *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedPrijava(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleRejectPayment}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  {t('prijave.admin.reject') || 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
