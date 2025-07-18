import axios from 'axios';
import { Product } from './types';

// Add network status monitoring
let isOnline = navigator.onLine;
let pendingPaymentData: any = null;
let reconnectTimeout: NodeJS.Timeout | null = null;

// Network status event listeners
window.addEventListener('online', () => {
  isOnline = true;
  if (pendingPaymentData) {
    // Clear any existing reconnect timeout
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    // Add a small delay to ensure stable connection
    reconnectTimeout = setTimeout(() => {
      handlePendingPayment(pendingPaymentData);
    }, 1000);
  }
});

window.addEventListener('offline', () => {
  isOnline = false;
  // Clear any existing reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
});

/**
 * Loads the Razorpay script dynamically
 * @returns Promise<boolean> - Whether the script loaded successfully
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Creates a new payment order
 * @param amount - The amount to be paid
 * @returns Promise with order data
 */
export const createPaymentOrder = async (amount: string) => {
  try {
    const response = await axios.post("http://localhost:4000/api/payment/order", {
      amount: amount,
      currency: "INR",
    });
    return response.data.data;
  } catch (error) {
    console.error("Error creating payment order:", error);
    throw new Error("Failed to create payment order");
  }
};

/**
 * Verifies the payment with Razorpay
 * @param paymentData - The payment verification data
 * @returns Promise with verification result
 */
export const verifyPayment = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const response = await axios.post("http://localhost:4000/api/payment/verify", paymentData);
  return response.data;
};

/**
 * Places the order after successful payment
 * @param orderData - The order data
 * @returns Promise with order result
 */
export const placeOrder = async (orderData: {
  sku: string;
  price: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  quantity: number;
  productName: string;
}) => {
  const response = await axios.post("http://localhost:4000/api/order/place-order", orderData);
  return response.data;
};

/**
 * Sends order confirmation email
 * @param orderData - The order data for email
 * @param retryCount - Number of retry attempts
 * @returns Promise<void>
 */
export const sendEmailConfirmation = async (orderData: any, retryCount = 0): Promise<void> => {
  try {
    await axios.post("http://localhost:4000/api/email/send-order-confirmation", {
      email: orderData.email,
      name: orderData.name,
      orders: [{
        sku: orderData.sku,
        amount: orderData.amount,
        cardNumber: orderData.cardNumber,
        cardPin: orderData.cardPin,
        validity: orderData.validity,
        issuanceDate: orderData.issuanceDate,
        status: "Success"
      }],
      totalAmount: orderData.amount,
      orderId: orderData.razorpayOrderId || orderData.orderId
    });
  } catch (emailError: any) {
    if (emailError.response?.status === 421 && retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return sendEmailConfirmation(orderData, retryCount + 1);
    }
    
    if (retryCount >= 3) {
      throw new Error("Failed to send confirmation email after multiple attempts");
    }
  }
};

/**
 * Initializes Razorpay payment
 * @param options - Razorpay configuration options
 * @returns Razorpay instance
 */
export const initializeRazorpay = (options: any) => {
  return new (window as any).Razorpay(options);
};

/**
 * Handles pending payment when back online
 */
const handlePendingPayment = async (paymentData: {
  response: any;
  product: Product;
  selectedDenomination: string;
  userData: { email: string; phone: string; firstName: string; lastName: string };
  callbacks: {
    onProcessingStart: () => void;
    onProcessingEnd: () => void;
    onSuccess: (refno: string) => void;
    onError: (message: string, errorObj?: any) => void; // <-- update here
  };
}) => {
  const { response, product, selectedDenomination, userData, callbacks } = paymentData;
  try {
    
    // Show processing state - already set by the initial handleBuyNow call
    // callbacks.onProcessingStart();
    
    const verifyResult = await verifyPayment({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    });

    if (verifyResult.success) {
      if (!userData.firstName || !userData.lastName) {
        callbacks.onError('Please provide your full name (first and last name) in your profile before placing an order.');
        callbacks.onProcessingEnd();
        return;
      }
      const orderResult = await placeOrder({
        sku: product?.sku,
        price: selectedDenomination,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        email: userData.email,
        phone: userData.phone,
        firstName: userData.firstName,
        lastName: userData.lastName,
        quantity: 1,
        productName: product?.name || "Product",
      });

      // Show backend error to user
      if (!orderResult.success) {
        callbacks.onError(
          orderResult.details || orderResult.error || "Failed to place order"
        );
        callbacks.onProcessingEnd?.();
        return;
      }

      callbacks.onSuccess(orderResult.data.refno);
    } else {
      callbacks.onError("Payment verification failed.");
    }
  } catch (err: any) { // <-- this catch should be here!
    if (err && err.response && err.response.data) {
      const errorMsg =
        (err.response.data.details || err.response.data.error || err.response.data.message || "Verification failed. Please try again.")
        + "\nIf money was deducted, please contact support for a refund.";
      callbacks.onError(errorMsg, err.response.data);
    } else {
      callbacks.onError(err.message || "Verification failed. Please try again.");
    }
  } finally {
    pendingPaymentData = null;
    callbacks.onProcessingEnd(); // Keep this here as this is the end of the pending process
  }
};

/**
 * Handles the buy now action
 * @param product - The product to buy
 * @param selectedDenomination - Selected denomination
 * @param userData - User data for payment
 * @param callbacks - Callback functions for different states
 */
export const handleBuyNow = async (
  product: Product,
  selectedDenomination: string,
  userData: { email: string; phone: string; firstName: string; lastName: string },
  callbacks: {
    onProcessingStart: () => void;
    onProcessingEnd: () => void;
    onSuccess: (refno: string, onPostPaymentComplete: () => void) => void;
    onError: (message: string, errorObj?: any) => void;
  }
) => {
  try {
    if (!isOnline) {
      callbacks.onError("No internet connection. Please check your connection and try again.");
      return;
    }

    const razorpayLoaded = await loadRazorpayScript();
    if (!razorpayLoaded) {
      callbacks.onError("Razorpay SDK failed to load. Please check your internet connection.");
      return;
    }

    const orderData = await createPaymentOrder(selectedDenomination);
    if (!orderData || !orderData.id) {
      callbacks.onError("Failed to create order. Please try again.");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_yak1WhqOqlCkRb",
      amount: parseInt(selectedDenomination, 10) * 100,
      currency: "INR",
      name: `${userData.firstName} ${userData.lastName}`.trim(),
      description: product?.shortDescription || "Purchase",
      image: product?.images?.base || "/placeholder-image.jpg",
      order_id: orderData.id,
      handler: async (response: any) => {
        // Show processing modal immediately after payment is successful
        callbacks.onProcessingStart();
        try {
          if (!isOnline) {
            pendingPaymentData = {
              response,
              product,
              selectedDenomination,
              userData,
              callbacks
            };
            callbacks.onError("Connection interrupted. Your order will be processed automatically when you're back online.");
            return;
          }

          const verifyResult = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyResult.success) {
            if (!userData.firstName || !userData.lastName) {
              callbacks.onError('Please provide your full name (first and last name) in your profile before placing an order.');
              callbacks.onProcessingEnd();
              return;
            }
            const orderResult = await placeOrder({
              sku: product?.sku,
              price: selectedDenomination,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: userData.email,
              phone: userData.phone,
              firstName: userData.firstName,
              lastName: userData.lastName,
              quantity: 1,
              productName: product?.name || "Product",
            });

            // Show backend error to user
            if (!orderResult.success) {
              callbacks.onError(
                orderResult.details || orderResult.error || "Failed to place order"
              );
              callbacks.onProcessingEnd?.();
              return;
            }

            // Call onSuccess with the refno - the processing modal will be hidden in the success callback
            callbacks.onSuccess(orderResult.data.refno, callbacks.onProcessingEnd);
          } else {
            callbacks.onError("Payment verification failed.");
            callbacks.onProcessingEnd();
          }
        } catch (err: any) {
          console.error("Payment verification error:", err);
          if (err && err.response && err.response.data) {
            const errorMsg =
              (err.response.data.details || err.response.data.error || err.response.data.message || "Verification failed. Please try again.")
              + "\nIf money was deducted, please contact support for a refund.";
            callbacks.onError(errorMsg, err.response.data);
          } else {
            callbacks.onError(err.message || "Verification failed. Please try again.");
          }
          callbacks.onProcessingEnd();
        }
      },
      prefill: {
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email,
        contact: `+91${userData.phone}`,
      },
      theme: {
        color: "#F37254",
      },
      modal: {
        ondismiss: () => {
          callbacks.onProcessingEnd();
        },
      },
    };

    const razorpay = initializeRazorpay(options);
    razorpay.open();
  } catch (err) {
    console.error("Payment initialization error:", err);
    callbacks.onError("Payment failed. Please try again.");
    callbacks.onProcessingEnd();
  }
};