'use client';

import React, { useState } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import { useAuth } from '@/contexts/AuthContext';
import { createCashfreeOrder, updatePaymentCustomerDetails } from '@/services/paymentService';
import { CreditCard, Loader2, Mail, Phone, User, X } from 'lucide-react';

const getCashfreeMode = () => {
  const mode = (process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox').toLowerCase();
  return mode === 'production' ? 'production' : 'sandbox';
};

export default function CashfreePaymentGateway({
  paymentType,
  payload,
  buttonLabel = 'Pay Now',
  processingLabel = 'Opening checkout...',
  className = '',
  disabled = false,
  redirectTarget = '_self',
  confirmCustomerDetails = true,
  onStart,
  onCheckoutOpen,
  onError,
  children
}) {
  const { user, getAuthHeader } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  const notifyError = (message) => {
    onError?.(message || 'Payment could not be started');
  };

  const startPayment = async () => {
    if (isProcessing || disabled) return;

    if (!user) {
      notifyError('Please login to continue payment');
      return;
    }

    setIsProcessing(true);
    setShowConfirmModal(false);
    const shouldContinue = onStart?.();
    if (shouldContinue === false) {
      setIsProcessing(false);
      return;
    }

    try {
      const authHeader = getAuthHeader();
      const customerDetails = {
        fullName: customerForm.fullName.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone.trim()
      };

      await updatePaymentCustomerDetails({
        customerDetails,
        authHeader
      });

      const orderResponse = await createCashfreeOrder({
        paymentType,
        payload,
        customerDetails,
        authHeader
      });

      const paymentSessionId = orderResponse?.data?.paymentSessionId;
      if (!paymentSessionId) {
        throw new Error('Payment session was not returned by the server');
      }

      const cashfree = await load({ mode: getCashfreeMode() });
      if (!cashfree) {
        throw new Error('Unable to load Cashfree checkout');
      }

      onCheckoutOpen?.(orderResponse.data);

      await cashfree.checkout({
        paymentSessionId,
        redirectTarget
      });
    } catch (error) {
      setIsProcessing(false);
      notifyError(error.message || 'Payment could not be started');
    }
  };

  const handlePaymentClick = () => {
    if (isProcessing || disabled) return;

    if (!user) {
      notifyError('Please login to continue payment');
      return;
    }

    if (confirmCustomerDetails) {
      setCustomerForm({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || ''
      });
      setShowConfirmModal(true);
      return;
    }

    startPayment();
  };

  const customerDetails = [
    { key: 'fullName', label: 'Name', value: customerForm.fullName, icon: User, type: 'text', editable: !user?.fullName },
    { key: 'email', label: 'Email', value: customerForm.email, icon: Mail, type: 'email', editable: !user?.email },
    { key: 'phone', label: 'Phone', value: customerForm.phone, icon: Phone, type: 'tel', editable: !user?.phone }
  ];
  const hasRequiredDetails = Boolean(customerForm.email?.trim() && customerForm.phone?.trim());

  return (
    <>
      <button
        type="button"
        onClick={handlePaymentClick}
        disabled={disabled || isProcessing}
        className={className}
      >
        {typeof children === 'function'
          ? children({ isProcessing })
          : (isProcessing ? processingLabel : buttonLabel)}
      </button>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white shadow-xl">
            <div className="flex items-start gap-3 border-b border-gray-200 px-4 py-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-gray-900">Confirm Your Details</h3>
                <p className="mt-0.5 text-xs text-gray-500">Review your billing contact before payment.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 px-4 py-3">
              {customerDetails.map((detail) => {
                const Icon = detail.icon;

                return (
                  <div key={detail.label} className="grid grid-cols-[88px_1fr] items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-50">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{detail.label}</span>
                    </div>
                    {detail.editable ? (
                      <input
                        type={detail.type}
                        value={detail.value}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, [detail.key]: e.target.value }))}
                        className="h-8 min-w-0 rounded-md border border-gray-300 px-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder={`Enter ${detail.label.toLowerCase()}`}
                      />
                    ) : (
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{detail.value || 'Not available'}</p>
                      </div>
                    )}
                  </div>
                );
              })}
              {!hasRequiredDetails && (
                <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  All required fields are required before continuing.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-gray-200 px-4 py-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startPayment}
                disabled={isProcessing || !hasRequiredDetails}
                className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                <span>{isProcessing ? 'Opening...' : 'Confirm & Pay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
