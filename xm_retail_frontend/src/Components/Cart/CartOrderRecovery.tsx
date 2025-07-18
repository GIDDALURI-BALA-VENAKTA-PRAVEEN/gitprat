import axios from 'axios';
import { OrderCard } from '../prodetailsorder/types';

export const forceUpdateOrder = async (refno: string) => {
  try {
    await axios.post(`http://localhost:4000/api/order/force-update/${refno}`);
  } catch (error) {}
};

export const checkOrderStatus = async (refno: string) => {
  const response = await axios.get(`http://localhost:4000/api/order/status/${refno}`);
  if (!response.data.success) {
    throw new Error(response.data.details || 'Failed to check order status');
  }
  return response.data.data;
};

export const fetchOrderDetails = async (refno: string) => {
  const response = await axios.get(`http://localhost:4000/api/order/details/${refno}`);
  if (!response.data.success) {
    throw new Error(response.data.details || 'Failed to fetch order details');
  }
  return response.data.data;
};

export const recoverOrder = async (
  refno: string,
  userData: { name: string; email: string; phone: string },
  callbacks: {
    onRecovering: () => void;
    onRecovered: (orderData: OrderCard[]) => void;
    onError: (error: string) => void;
    onCanceled: () => void;
  }
) => {
  try {
    callbacks.onRecovering();
    await forceUpdateOrder(refno);
    const statusData = await checkOrderStatus(refno);
    if (statusData.status === 'COMPLETE' || statusData.localStatus === 'completed') {
      const orderData = await fetchOrderDetails(refno);
      if (orderData.cards && orderData.cards.length > 0) {
        callbacks.onRecovered(orderData.cards);
      } else {
        startPolling(refno, userData, callbacks);
      }
    } else if (statusData.status === 'CANCELED') {
      callbacks.onCanceled();
    } else {
      startPolling(refno, userData, callbacks);
    }
  } catch (error) {
    callbacks.onError('Failed to recover order. Please contact support.');
  }
};

export const startPolling = (
  refno: string,
  userData: { name: string; email: string; phone: string },
  callbacks: {
    onRecovering: () => void;
    onRecovered: (orderData: OrderCard[]) => void;
    onError: (error: string) => void;
    onCanceled: () => void;
  }
) => {
  const pollInterval = setInterval(async () => {
    try {
      const statusData = await checkOrderStatus(refno);
      if (statusData.status === 'COMPLETE' || statusData.localStatus === 'completed') {
        clearInterval(pollInterval);
        if (statusData.cards && statusData.cards.length > 0) {
          callbacks.onRecovered(statusData.cards);
        } else {
          try {
            const orderData = await fetchOrderDetails(refno);
            if (orderData.cards && orderData.cards.length > 0) {
              callbacks.onRecovered(orderData.cards);
            }
          } catch {}
        }
      } else if (statusData.status === 'CANCELED') {
        clearInterval(pollInterval);
        callbacks.onCanceled();
      }
    } catch (error: any) {
      if (error.response && error.response.status !== 404) {
        clearInterval(pollInterval);
        callbacks.onError('Failed to check order status. Please contact support.');
      }
    }
  }, 5000);
  return pollInterval;
}; 