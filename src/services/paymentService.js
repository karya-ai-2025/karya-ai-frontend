const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const updatePaymentCustomerDetails = async ({ customerDetails, authHeader }) => {
  const response = await fetch(`${API_BASE_URL}/payments/customer-details`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader || {})
    },
    credentials: 'include',
    body: JSON.stringify(customerDetails)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update customer details');
  }

  return data;
};

export const createCashfreeOrder = async ({ paymentType, payload, customerDetails, authHeader }) => {
  const response = await fetch(`${API_BASE_URL}/payments/cashfree/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader || {})
    },
    credentials: 'include',
    body: JSON.stringify({ paymentType, payload, customerDetails })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create payment order');
  }

  return data;
};

export const verifyCashfreeOrder = async ({ orderId, authHeader }) => {
  const response = await fetch(`${API_BASE_URL}/payments/cashfree/verify-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader || {})
    },
    credentials: 'include',
    body: JSON.stringify({ orderId })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify payment order');
  }

  return data;
};
