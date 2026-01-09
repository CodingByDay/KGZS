import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppShell } from '@/app/components/AppShell';
import { prijavaService, PrijavaDto, PrijavaStatus, CreatePrijavaRequest, UpdatePrijavaRequest } from '@/application/services/PrijavaService';
import { productService, ProductDto } from '@/application/services/ProductService';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useTranslation } from 'react-i18next';
import { HiArrowLeft, HiCreditCard, HiDocumentText, HiArrowUpTray } from 'react-icons/hi2';

export function PrijavaDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  // Debug: Log immediately on mount
  console.log('=== PrijavaDetailPage RENDERED ===');
  console.log('  - location.pathname:', location.pathname);
  console.log('  - id from params:', id);
  console.log('  - location.search:', location.search);
  console.log('  - location.hash:', location.hash);
  
  // Check if this is the "new" route by checking the pathname directly
  const isNewRoute = location.pathname === '/app/prijave/new';
  const isNew = isNewRoute || id === 'new' || !id;
  
  // Debug: Log route params and location
  useEffect(() => {
    console.log('PrijavaDetailPage mounted/updated:');
    console.log('  - location.pathname:', location.pathname);
    console.log('  - id from params:', id);
    console.log('  - isNewRoute:', isNewRoute);
    console.log('  - isNew:', isNew);
  }, [id, isNew, isNewRoute, location.pathname]);
  
  // If we're on /app/prijave/new but id is not 'new', redirect
  useEffect(() => {
    if (isNewRoute && id && id !== 'new') {
      console.warn('Route mismatch: pathname is /app/prijave/new but id param is:', id);
    }
  }, [isNewRoute, id]);
  
  const [prijava, setPrijava] = useState<PrijavaDto | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState<CreatePrijavaRequest>({
    itemId: '',
    reviewDueDate: '',
  });
  
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [bankInstructions, setBankInstructions] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNewRoute]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('loadData - isNewRoute:', isNewRoute, 'isNew:', isNew, 'id:', id, 'pathname:', location.pathname);
      
      // Early return if this is a new prijava - just load products
      if (isNewRoute || isNew || id === 'new' || !id) {
        console.log('Loading products only (new prijava)');
        try {
          const productsData = await productService.getProducts();
          setProducts(productsData);
          console.log('Products loaded successfully:', productsData.length);
        } catch (err) {
          const apiError = err as ApiError;
          console.error('Error loading products:', err);
          setError(apiError.message || t('prijave.messages.loadError') || 'Failed to load products');
        } finally {
          setLoading(false);
        }
        return;
      }
      
      // Load both products and prijava data for existing prijava
      try {
        const [productsData, prijavaData] = await Promise.all([
          productService.getProducts(),
          prijavaService.getPrijavaById(id!)
        ]);
        
        setProducts(productsData);
        setPrijava(prijavaData);
        setFormData({
          itemId: prijavaData.itemId,
          reviewDueDate: prijavaData.reviewDueDate.split('T')[0],
        });
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.status === 404) {
          setError(t('prijave.messages.notFound') || 'Prijava not found');
        } else {
          setError(apiError.message || t('prijave.messages.loadError') || 'Failed to load data');
        }
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('prijave.messages.loadError') || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (isNew) {
        const request: CreatePrijavaRequest = {
          itemId: formData.itemId,
          reviewDueDate: new Date(formData.reviewDueDate).toISOString(),
        };
        const created = await prijavaService.createPrijava(request);
        setSuccessMessage(t('prijave.messages.createSuccess') || 'Prijava created successfully');
        setTimeout(() => {
          navigate(`/app/prijave/${created.id}`);
        }, 1500);
      } else if (id) {
        const request: UpdatePrijavaRequest = {
          itemId: formData.itemId,
          reviewDueDate: new Date(formData.reviewDueDate).toISOString(),
        };
        await prijavaService.updatePrijava(id, request);
        setSuccessMessage(t('prijave.messages.updateSuccess') || 'Prijava updated successfully');
        loadData();
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('prijave.messages.saveError') || 'Failed to save prijava');
    }
  };

  const handleStripePayment = async () => {
    if (!id || isNew) return;
    try {
      const response = await prijavaService.createStripeSession(id);
      window.location.href = response.checkoutUrl;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create Stripe session');
    }
  };

  const handleCardPayment = async () => {
    if (!id || isNew) return;
    try {
      const response = await prijavaService.createCardSession(id);
      window.location.href = response.checkoutUrl;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create card payment session');
    }
  };

  const handleBankTransfer = async () => {
    if (!id || isNew) return;
    try {
      const instructions = await prijavaService.getBankTransferInstructions(id);
      setBankInstructions(instructions);
      setShowPaymentOptions(true);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to get bank transfer instructions');
    }
  };

  const handleReceiptUpload = async () => {
    if (!id || isNew || !receiptFile) return;
    
    try {
      setUploadingReceipt(true);
      await prijavaService.uploadBankTransferReceipt(id, receiptFile);
      setSuccessMessage(t('prijave.messages.receiptUploaded') || 'Receipt uploaded successfully');
      setReceiptFile(null);
      loadData();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to upload receipt');
    } finally {
      setUploadingReceipt(false);
    }
  };

  // For new prijava, always allow editing. For existing, only if status allows it.
  const canEdit = isNew || !prijava || prijava.status === PrijavaStatus.PendingPayment || prijava.status === PrijavaStatus.PendingAdminConfirmation;
  const canPay = prijava && prijava.status === PrijavaStatus.PendingPayment;

  // Debug logging
  console.log('Render check - isNew:', isNew, 'prijava:', prijava, 'canEdit:', canEdit, 'loading:', loading, 'products.length:', products.length);

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/prijave')}
            className="text-gray-600 hover:text-gray-900"
          >
            <HiArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? (t('prijave.createTitle') || 'New Prijava') : (t('prijave.editTitle') || 'Edit Prijava')}
            </h1>
            {prijava && (
              <p className="text-gray-600 mt-1">
                {t('prijave.status.label') || 'Status'}: <span className="font-medium">{prijava.status}</span>
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Debug: Show canEdit status */}
        {console.log('About to render form - canEdit:', canEdit, 'isNew:', isNew, 'prijava:', prijava)}
        
        {canEdit ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('prijave.form.item') || 'Item'} *
              </label>
              <select
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('common.select') || 'Select...'}</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('prijave.form.reviewDueDate') || 'Review Due Date'} *
              </label>
              <input
                type="date"
                value={formData.reviewDueDate}
                onChange={(e) => setFormData({ ...formData, reviewDueDate: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/app/prijave')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isNew ? (t('common.create') || 'Create') : (t('common.save') || 'Save')}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">Debug: Form not rendered</p>
            <p>canEdit: {String(canEdit)}</p>
            <p>isNew: {String(isNew)}</p>
            <p>isNewRoute: {String(isNewRoute)}</p>
            <p>id: {id || 'undefined'}</p>
            <p>prijava: {prijava ? 'exists' : 'null'}</p>
            <p>loading: {String(loading)}</p>
            <p>products.length: {products.length}</p>
            <p>location.pathname: {location.pathname}</p>
          </div>
        )}

        {!canEdit && prijava && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('prijave.details') || 'Details'}</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('prijave.table.item') || 'Item'}</dt>
                <dd className="mt-1 text-sm text-gray-900">{prijava.itemName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('prijave.table.dueDate') || 'Due Date'}</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(prijava.reviewDueDate).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        )}

        {canPay && prijava && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('prijave.payment.title') || 'Payment'}</h2>
            <p className="text-gray-600">{t('prijave.payment.description') || 'Choose a payment method:'}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleStripePayment}
                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <HiCreditCard className="w-8 h-8 text-gray-600" />
                <span className="font-medium">Stripe</span>
              </button>
              
              <button
                onClick={handleCardPayment}
                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <HiCreditCard className="w-8 h-8 text-gray-600" />
                <span className="font-medium">{t('prijave.payment.card') || 'Card Payment'}</span>
              </button>
              
              <button
                onClick={handleBankTransfer}
                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <HiDocumentText className="w-8 h-8 text-gray-600" />
                <span className="font-medium">{t('prijave.payment.bankTransfer') || 'Bank Transfer'}</span>
              </button>
            </div>
          </div>
        )}

        {showPaymentOptions && bankInstructions && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('prijave.payment.bankTransferInstructions') || 'Bank Transfer Instructions'}</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('prijave.payment.iban') || 'IBAN'}</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{bankInstructions.iban}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('prijave.payment.reference') || 'Reference'}</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{bankInstructions.reference}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('prijave.payment.recipient') || 'Recipient'}</dt>
                <dd className="mt-1 text-sm text-gray-900">{bankInstructions.recipient}</dd>
              </div>
              {bankInstructions.amount && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('prijave.payment.amount') || 'Amount'}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{bankInstructions.amount} {bankInstructions.currency}</dd>
                </div>
              )}
            </dl>
            
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('prijave.payment.uploadReceipt') || 'Upload Receipt'} (PDF, JPG, PNG)
              </label>
              <div className="flex gap-3">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleReceiptUpload}
                  disabled={!receiptFile || uploadingReceipt}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  <HiArrowUpTray className="w-5 h-5" />
                  {uploadingReceipt ? (t('common.uploading') || 'Uploading...') : (t('common.upload') || 'Upload')}
                </button>
              </div>
            </div>
          </div>
        )}

        {prijava?.payment?.bankTransferReceiptUrl && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('prijave.payment.receipt') || 'Receipt'}</h3>
            <a
              href={prijava.payment.bankTransferReceiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              {t('prijave.payment.viewReceipt') || 'View Receipt'}
            </a>
          </div>
        )}
      </div>
    </AppShell>
  );
}
