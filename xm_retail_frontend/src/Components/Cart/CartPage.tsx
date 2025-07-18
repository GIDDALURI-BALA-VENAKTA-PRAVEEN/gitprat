import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import Nav from "../NavBar/Nav";
import CartGiftCardDisplay from "./CartGiftCardDisplay";
import CartNetworkStatusModal from "./CartNetworkStatusModal";
import CartToastNotification from "./CartToastNotification";
import { OrderCard } from "../prodetailsorder/types";
import ProcessingOrderModal from './ProcessingOrderModal';

interface CartItem {
  sku: string;
  name: string;
  image: string;
  denomination: string;
  currency: { symbol: string };
  quantity: number;
  price: string | number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDataList, setOrderDataList] = useState<OrderCard[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const completedOrders = useRef(new Set<string>());
  const recoveryTimeout = useRef<NodeJS.Timeout | null>(null);
  const networkStabilityTimeout = useRef<NodeJS.Timeout | null>(null);
  const modalShown = useRef(false);
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = !!storedUser?.email;
  const [cartLimitError, setCartLimitError] = useState(false);

  // Load completed orders from localStorage on mount
  useEffect(() => {
    const savedCompletedOrders = localStorage.getItem('completedOrders');
    if (savedCompletedOrders) {
      completedOrders.current = new Set(JSON.parse(savedCompletedOrders));
    }
    
    // Clean up old frontend-generated refnos
    const cleanupOldRefnos = () => {
      const pendingRefnos = JSON.parse(localStorage.getItem('pendingOrderRefnos') || '[]');
      const validRefnos = pendingRefnos.filter((refno: string) => refno.startsWith('XMR'));
      const invalidRefnos = pendingRefnos.filter((refno: string) => !refno.startsWith('XMR'));
      
      if (invalidRefnos.length > 0) {
        console.log('Cleaning up old invalid refnos:', invalidRefnos);
        localStorage.setItem('pendingOrderRefnos', JSON.stringify(validRefnos));
      }
    };
    
    cleanupOldRefnos();
  }, []);

  // Save completed orders to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('completedOrders', JSON.stringify(Array.from(completedOrders.current)));
  }, [completedOrders.current]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setIsReconnecting(true);
      setIsRestoring(true);
      setShowNetworkModal(true);
      setIsProcessingComplete(false);
      // Show processing modal immediately after network is restored
      setTimeout(() => {
        setShowNetworkModal(false);
        setIsProcessing(true); // Show processing modal as soon as network modal disappears
      }, 100); // Small delay to allow network modal to disappear
      // Clear any existing recovery timeout
      if (recoveryTimeout.current) {
        clearTimeout(recoveryTimeout.current);
      }
      // Add a small delay before checking pending orders
      recoveryTimeout.current = setTimeout(async () => {
        try {
          const pendingRefnos = JSON.parse(localStorage.getItem('pendingOrderRefnos') || '[]');
          if (pendingRefnos.length > 0) {
            modalShown.current = false;
            recoverOrders(pendingRefnos);
          } else {
            setIsProcessingComplete(true);
            setIsRestoring(false);
            setShowNetworkModal(false);
            setIsProcessing(false); // Hide processing modal if nothing to recover
          }
        } catch (error) {
          setIsProcessingComplete(true);
          setIsRestoring(false);
          setShowNetworkModal(false);
          setIsProcessing(false); // Hide processing modal on error
        } finally {
          setIsReconnecting(false);
        }
      }, 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
      setIsRestoring(false);
      setIsProcessingComplete(false);
      setShowNetworkModal(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (!navigator.onLine) {
      setShowNetworkModal(true);
    }
    // Check for pending orders when page loads
    const initialCheckTimeout = setTimeout(() => {
      const pendingRefnos = JSON.parse(localStorage.getItem('pendingOrderRefnos') || '[]');
      if (pendingRefnos.length > 0) {
        recoverOrders(pendingRefnos);
      }
    }, 3000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (recoveryTimeout.current) {
        clearTimeout(recoveryTimeout.current);
      }
      if (networkStabilityTimeout.current) {
        clearTimeout(networkStabilityTimeout.current);
      }
      clearTimeout(initialCheckTimeout);
      modalShown.current = false;
    };
  }, []);

  const recoverOrders = async (refnos: string[]) => {
    if (!refnos.length) return;
    
    // Filter out old frontend-generated refnos and only keep backend-generated ones
    const validRefnos = refnos.filter(refno => refno.startsWith('XMR'));
    const invalidRefnos = refnos.filter(refno => !refno.startsWith('XMR'));
    
    if (invalidRefnos.length > 0) {
      console.log('Removing invalid refnos:', invalidRefnos);
      // Remove invalid refnos from localStorage
      const currentPendingRefnos = JSON.parse(localStorage.getItem('pendingOrderRefnos') || '[]');
      const updatedPendingRefnos = currentPendingRefnos.filter((r: string) => !invalidRefnos.includes(r));
      localStorage.setItem('pendingOrderRefnos', JSON.stringify(updatedPendingRefnos));
    }
    
    if (validRefnos.length === 0) {
      console.log('No valid refnos to recover');
      return;
    }
    
    console.log('Recovering orders for refnos:', validRefnos);
    
    // Show processing modal after network is restored and before cards are displayed
    if (!isProcessing) setIsProcessing(true);
    
    try {
      setIsRecovering(true);
      setRecoveryError(null);
      const successfulOrders: OrderCard[] = [];
      const failedRefnos: string[] = [];
      let hasNewSuccessfulOrders = false;
      
      const recoveryPromises = validRefnos.map(async (refno) => {
        if (completedOrders.current.has(refno)) {
          console.log(`Order ${refno} already completed, skipping...`);
          return null;
        }
        
        try {
          console.log(`Processing order ${refno}`);
          
          // First try to force update the order
          try {
            const updateResponse = await axios.post(`http://localhost:4000/api/order/force-update/${refno}`);
            console.log(`Force update response for ${refno}:`, updateResponse.data);
            
            // Add a small delay after force update
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (updateError: any) {
            console.error(`Force update failed for ${refno}:`, updateError.response?.data || updateError.message);
            // Continue with status check even if force update fails
          }

          // Check order status
          const statusResponse = await axios.get(`http://localhost:4000/api/order/status/${refno}`);
          console.log(`Status check response for ${refno}:`, statusResponse.data);

          if (!statusResponse.data.success) {
            throw new Error(statusResponse.data.details || 'Failed to check order status');
          }

          const statusData = statusResponse.data.data;
          console.log(`Order ${refno} status:`, statusData);

          if (statusData.status === 'COMPLETE' || statusData.localStatus === 'completed') {
            // Add a small delay before getting details
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const detailsResponse = await axios.get(`http://localhost:4000/api/order/details/${refno}`);
            console.log(`Details response for ${refno}:`, detailsResponse.data);

            if (!detailsResponse.data.success) {
              throw new Error(detailsResponse.data.details || 'Failed to fetch order details');
            }

            const orderData = detailsResponse.data.data;
            
            const hasCardDetails = orderData.cardNumber && orderData.cardPin;

            if (hasCardDetails) {
              // Mark order as completed and remove from pending orders immediately
              completedOrders.current.add(refno);
              hasNewSuccessfulOrders = true;
              
              // Remove this refno from pending orders in localStorage
              const currentPendingRefnos = JSON.parse(localStorage.getItem('pendingOrderRefnos') || '[]');
              const updatedPendingRefnos = currentPendingRefnos.filter((r: string) => r !== refno);
              localStorage.setItem('pendingOrderRefnos', JSON.stringify(updatedPendingRefnos));

              return {
                amount: orderData.amount,
                cardNumber: orderData.cardNumber,
                cardPin: orderData.cardPin,
                sku: orderData.sku,
                validity: orderData.validity,
                issuanceDate: orderData.issuanceDate,
                status: 'completed',
                refno: refno
              };
            } else {
              console.log(`Order ${refno} completed but missing card details:`, {
                hasCardNumber: !!orderData.cardNumber,
                hasCardPin: !!orderData.cardPin,
                orderData: orderData
              });
              
              // Try to force update the order to get card details
              try {
                console.log(`Attempting force update for ${refno} to get card details`);
                const forceUpdateResponse = await axios.post(`http://localhost:4000/api/order/force-update/${refno}`);
                console.log(`Force update response for ${refno}:`, forceUpdateResponse.data);
                
                // Wait a bit and check again
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const retryDetailsResponse = await axios.get(`http://localhost:4000/api/order/details/${refno}`);
                if (retryDetailsResponse.data.success) {
                  const retryOrderData = retryDetailsResponse.data.data;
                  if (retryOrderData.cardNumber && retryOrderData.cardPin) {
                    // Now we have card details
                    completedOrders.current.add(refno);
                    hasNewSuccessfulOrders = true;
                    
                    const currentPendingRefnos = JSON.parse(localStorage.getItem('pendingOrderRefnos') || '[]');
                    const updatedPendingRefnos = currentPendingRefnos.filter((r: string) => r !== refno);
                    localStorage.setItem('pendingOrderRefnos', JSON.stringify(updatedPendingRefnos));

                    return {
                      amount: retryOrderData.amount,
                      cardNumber: retryOrderData.cardNumber,
                      cardPin: retryOrderData.cardPin,
                      sku: retryOrderData.sku,
                      validity: retryOrderData.validity,
                      issuanceDate: retryOrderData.issuanceDate,
                      status: 'completed',
                      refno: refno
                    };
                  }
                }
              } catch (forceUpdateError) {
                console.error(`Force update failed for ${refno}:`, forceUpdateError);
              }
              
              // If we still don't have card details, throw error to keep in pending
              throw new Error('Missing card details after retry');
            }
          } else if (statusData.status === 'CANCELED') {
            console.log(`Order ${refno} was canceled`);
            throw new Error('Order was canceled');
          } else {
            console.log(`Order ${refno} still pending/processing with status: ${statusData.status}`);
            throw new Error('Order still processing');
          }
        } catch (error: any) {
          console.error(`Failed to recover order ${refno}:`, error);
          return null;
        }
      });

      const results = await Promise.all(recoveryPromises);
      
      results.forEach((result, index) => {
        if (result) {
          successfulOrders.push(result);
        } else {
          failedRefnos.push(validRefnos[index]);
        }
      });

      // Only update failed refnos if there are any
      if (failedRefnos.length > 0) {
        console.log('Storing failed refnos for retry:', failedRefnos);
        localStorage.setItem('pendingOrderRefnos', JSON.stringify(failedRefnos));
      } else {
        console.log('All orders processed successfully, clearing pending refnos');
        localStorage.removeItem('pendingOrderRefnos');
      }

      // Only update UI and show modal if we have new successful orders
      if (successfulOrders.length > 0 && hasNewSuccessfulOrders) {
        console.log('Adding successful orders to UI:', successfulOrders);
        successfulOrders.sort((a, b) => (a.refno || '').localeCompare(b.refno || ''));
        setOrderDataList(successfulOrders);
        setIsProcessing(false);
        setShowSuccessModal(true);
        modalShown.current = true;
        setShowNetworkModal(false); // Hide network modal only after success modal is shown
      } else {
        console.log('No new successful orders to display');
      }

      setIsRecovering(false);
      setRecoveryError(null);
    } catch (error: any) {
      console.error('Recovery process failed:', error);
      if (error.response) {
        console.error('Error details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      setRecoveryError('Failed to recover orders. Please contact support.');
      setIsRecovering(false);
    } finally {
      setIsRecovering(false);
      setIsProcessing(false); // Always hide processing modal at the end
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const totalAmount = cart.reduce(
    (acc, item) => acc + Number(item.denomination) * item.quantity,
    0
  );

  // Helper to get total quantity in cart
  const getTotalQuantity = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  // Modified updateQuantity to enforce cart limit
  const updateQuantity = (sku: string, denomination: string, delta: number) => {
    // Find the item to update
    const itemToUpdate = cart.find(item => item.sku === sku && item.denomination === denomination);
    if (!itemToUpdate) return;
    const newQty = itemToUpdate.quantity + delta;
    // If decreasing, allow as usual
    if (delta < 0) {
      const updatedCart = cart
        .map((item) => {
          if (item.sku === sku && item.denomination === denomination) {
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item) => item !== null);
      setCart(updatedCart as CartItem[]);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }
    // If increasing, check total quantity limit
    const totalQuantity = getTotalQuantity();
    if (totalQuantity >= 3) {
      setCartLimitError(true);
      setShowToast(true);
      setToastMessage("You can only buy up to 3 cards at a time.");
      return;
    }
    if (totalQuantity + delta > 3) {
      setCartLimitError(true);
      setShowToast(true);
      setToastMessage("You can only buy up to 3 cards at a time.");
      return;
    }
    // Otherwise, allow update
    const updatedCart = cart
      .map((item) => {
        if (item.sku === sku && item.denomination === denomination) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
    setCart(updatedCart as CartItem[]);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (sku: string, denomination: string) => {
    const updatedCart = cart.filter(
      (item) => !(item.sku === sku && item.denomination === denomination)
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Modified handleCheckout to block if cart is over the limit
  const handleCheckout = async () => {
    setIsProcessing(false); // Remove processing modal if user clicks checkout (before payment)
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      setToastMessage("Your cart is empty.");
      setShowToast(true);
      return;
    }
    if (getTotalQuantity() > 3) {
      setToastMessage("You can only buy up to 3 cards at a time.");
      setShowToast(true);
      return;
    }
    
    // Debug: Log user data
    console.log('User data for checkout:', {
      firstName: storedUser.firstName,
      lastName: storedUser.lastName,
      email: storedUser.email,
      phone: storedUser.phone,
      isLoggedIn
    });
    
    try {
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        setToastMessage("Razorpay SDK failed to load.");
        setShowToast(true);
        return;
      }
      const orderResponse = await axios.post("http://localhost:4000/api/payment/order", {
        amount: totalAmount,
        currency: "INR",
      });
      const order = orderResponse.data.data;
      if (!order || !order.id) {
        setToastMessage("Failed to create Razorpay order.");
        setShowToast(true);
        return;
      }
      const options = {
        key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        currency: "INR",
        name: "Woohoo Cart Checkout",
        description: `Order for ${cart.length} item(s)`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            setIsProcessing(true);
            const verifyResponse = await axios.post("http://localhost:4000/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyResponse.data.success) {
              const pendingRefnos: string[] = [];
              const successfulOrders: OrderCard[] = [];
              let totalOrderIndex = 0;
              for (const item of cart) {
                for (let i = 0; i < item.quantity; i++) {
                  try {
                    // Get firstName and lastName directly from user data
                    let firstName = storedUser.firstName || 'User';
                    let lastName = storedUser.lastName || 'Customer';
                    
                    // Ensure we have valid names
                    if (!firstName.trim()) firstName = 'User';
                    if (!lastName.trim()) lastName = 'Customer';
                    
                    console.log('Sending order with name:', { firstName, lastName, userData: storedUser });
                    
                    const result = await axios.post("http://localhost:4000/api/order/place-order", {
                      sku: item.sku,
                      price: item.denomination,
                      quantity: 1,
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      firstName: firstName,
                      lastName: lastName,
                      email: storedUser.email,
                      phone: storedUser.phone,
                      orderIndex: totalOrderIndex,
                      productName: item.name
                    });
                    
                    console.log('Order placement response:', result.data);
                    
                    const orderData = result.data?.data;
                    if (orderData?.cards && orderData.cards.length > 0) {
                      for (const card of orderData.cards) {
                        try {
                          const statusResponse = await axios.get(`http://localhost:4000/api/order/status/${card.refno}`);
                          if (statusResponse.data.success) {
                            const statusData = statusResponse.data.data;
                            if (statusData.status === 'COMPLETE' || statusData.localStatus === 'completed') {
                              const detailsResponse = await axios.get(`http://localhost:4000/api/order/details/${card.refno}`);
                              if (detailsResponse.data.success) {
                                const orderDetails = detailsResponse.data.data;
                                if (orderDetails.cardNumber && orderDetails.cardPin) {
                                  const newOrder: OrderCard = {
                                    amount: orderDetails.amount,
                                    cardNumber: orderDetails.cardNumber,
                                    cardPin: orderDetails.cardPin,
                                    sku: orderDetails.sku,
                                    validity: orderDetails.validity,
                                    issuanceDate: orderDetails.issuanceDate,
                                    status: 'completed',
                                    refno: card.refno
                                  };
                                  successfulOrders.push(newOrder);
                                  completedOrders.current.add(card.refno);
                                  localStorage.setItem('completedOrders', JSON.stringify(Array.from(completedOrders.current)));
                                  totalOrderIndex++;
                                } else {
                                  // Card is completed but missing details, add to pending for retry
                                  console.log('Card completed but missing details, adding to pending:', card.refno);
                                  pendingRefnos.push(card.refno);
                                }
                              } else {
                                // Details fetch failed, add to pending
                                console.log('Details fetch failed, adding to pending:', card.refno);
                                pendingRefnos.push(card.refno);
                              }
                            } else if (statusData.status === 'pending' || statusData.status === 'PENDING') {
                              if (!completedOrders.current.has(card.refno)) {
                                console.log('Order still pending, adding to pending:', card.refno);
                                pendingRefnos.push(card.refno);
                              }
                            } else {
                              // Other status, add to pending for retry
                              console.log('Order has other status, adding to pending:', card.refno);
                              pendingRefnos.push(card.refno);
                            }
                          } else {
                            // Status check failed, add to pending
                            console.log('Status check failed, adding to pending:', card.refno);
                            pendingRefnos.push(card.refno);
                          }
                        } catch (statusError) {
                          console.error('Status check error for refno:', card.refno, statusError);
                          if (!completedOrders.current.has(card.refno)) {
                            pendingRefnos.push(card.refno);
                          }
                        }
                      }
                    } else if (orderData?.refno) {
                      // If no cards in response but we have a refno, add it to pending
                      console.log('Adding refno to pending:', orderData.refno);
                      pendingRefnos.push(orderData.refno);
                    } else {
                      // No refno in response, this is an error
                      console.error('No refno in order response:', orderData);
                    }
                  } catch (orderError: any) {
                    console.error("Order failed for item:", item, orderError);
                    console.error("Error response:", orderError.response?.data);
                    // Don't add to pending if the order creation itself failed
                  }
                }
              }
              successfulOrders.sort((a, b) => (a.refno || '').localeCompare(b.refno || ''));
              if (pendingRefnos.length > 0) {
                const existingPendingRefnos = JSON.parse(localStorage.getItem('pendingOrderRefnos') || '[]');
                const updatedPendingRefnos = [...new Set([...existingPendingRefnos, ...pendingRefnos])];
                localStorage.setItem('pendingOrderRefnos', JSON.stringify(updatedPendingRefnos));
              }
              
              console.log('Final successful orders:', successfulOrders);
              console.log('Final pending refnos:', pendingRefnos);
              
              if (successfulOrders.length > 0) {
                setOrderDataList(successfulOrders);
                setIsProcessing(false);
                setShowSuccessModal(true);
                modalShown.current = true;
              }
              
              if (pendingRefnos.length > 0) {
                setNotificationMessage("Some orders are pending. They will be processed automatically when possible.");
              } else {
                setNotificationMessage("All orders have been processed successfully!");
              }
              setShowNotification(true);
              setTimeout(() => {
                setShowNotification(false);
              }, 5000);
              localStorage.removeItem("cart");
              setCart([]);
            } else {
              setToastMessage("Payment verification failed. Please contact support.");
              setShowToast(true);
            }
          } catch (err) {
            setToastMessage("Something went wrong during order placement. Please contact support.");
            setShowToast(true);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: storedUser.name,
          email: storedUser.email,
          contact: `+91${storedUser.phone}`,
        },
        theme: {
          color: "#F37254",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setToastMessage("Checkout failed. Please try again.");
      setShowToast(true);
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    modalShown.current = false;
  };

  // Function to clear all old refnos (for debugging)
  const clearAllOldRefnos = () => {
    localStorage.removeItem('pendingOrderRefnos');
    localStorage.removeItem('completedOrders');
    completedOrders.current.clear();
    console.log('Cleared all old refnos');
  };

  // Function to manually trigger recovery (for debugging)
  const triggerManualRecovery = () => {
    const pendingRefnos = JSON.parse(localStorage.getItem('pendingOrderRefnos') || '[]');
    console.log('Manually triggering recovery for:', pendingRefnos);
    if (pendingRefnos.length > 0) {
      recoverOrders(pendingRefnos);
    } else {
      console.log('No pending refnos to recover');
    }
  };

  // Also, auto-hide cart limit error toast after a short delay
  useEffect(() => {
    if (cartLimitError) {
      const timeout = setTimeout(() => setCartLimitError(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [cartLimitError]);

  return (
    <>
      <Nav />
      {isProcessing && !showSuccessModal && !showNetworkModal && <ProcessingOrderModal open={isProcessing} />}
      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 max-w-md"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notificationMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <CartToastNotification message={toastMessage} onClose={() => setShowToast(false)} />
        )}
      </AnimatePresence>
      {/* Network Status Modal */}
      <AnimatePresence>
        {showNetworkModal && !showSuccessModal && (
          <CartNetworkStatusModal
            isReconnecting={isReconnecting}
            onReconnectComplete={() => {
              setIsReconnecting(false);
              setShowNetworkModal(false);
            }}
          />
        )}
      </AnimatePresence>
      <div className="p-2 sm:p-4 md:p-6 max-w-4xl mx-auto mt-8">
        <div className="text-gray-500 text-xs sm:text-sm mb-4">
          <span
            className="text-orange-500 cursor-pointer"
            onClick={() => navigate("/products/121")}
          >
            Products
          </span>{" "}
          / <span className="font-semibold">Cart</span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Your Cart</h1>
        
        {cart.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <div>
            {/* Desktop/Table View */}
            <div className="hidden sm:block overflow-x-auto rounded">
              <table className="w-full min-w-[600px] mb-6 border border-gray-200 rounded text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left whitespace-nowrap">Product</th>
                    <th className="p-2 text-center whitespace-nowrap">Qty</th>
                    <th className="p-2 text-right whitespace-nowrap">Price</th>
                    <th className="p-2 text-right whitespace-nowrap">Subtotal</th>
                    <th className="p-2 text-center whitespace-nowrap">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={`${item.sku}-${item.denomination}`}>
                      <td className="p-2 flex items-center gap-2 min-w-[140px]">
                        <img src={item.image} alt={item.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded" />
                        <div>
                          <p className="font-semibold text-xs sm:text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            Denomination: {item.currency.symbol}
                            {item.denomination}
                          </p>
                        </div>
                      </td>
                      <td className="p-2 text-center min-w-[60px]">
                        <div className="flex justify-center">
                          <div className="inline-flex bg-white shadow-sm border rounded-full overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.sku, item.denomination, -1)}
                              className="px-2 sm:px-3 py-1 bg-gray-100 hover:bg-red-200 transition text-red-600 font-semibold text-base focus:outline-none"
                            >
                              −
                            </button>
                            <span className="px-2 sm:px-3 py-1 text-center font-medium bg-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.sku, item.denomination, 1)}
                              disabled={getTotalQuantity() >= 3}
                              className={`px-2 sm:px-3 py-1 bg-gray-100 ${getTotalQuantity() >= 3 ? 'cursor-not-allowed opacity-50' : 'hover:bg-green-200'} transition text-green-600 font-semibold text-base focus:outline-none`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-right min-w-[70px]">
                        {item.currency.symbol}
                        {item.denomination}
                      </td>
                      <td className="p-2 text-right min-w-[80px]">
                        {item.currency.symbol}
                        {Number(item.denomination) * item.quantity}
                      </td>
                      <td className="p-2 text-center min-w-[60px]">
                        <button
                          onClick={() => removeItem(item.sku, item.denomination)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove Item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold border-t border-gray-300">
                    <td colSpan={3} className="p-2 text-right">
                      Total:
                    </td>
                    <td className="p-2 text-right" colSpan={2}>
                      {cart[0]?.currency.symbol}
                      {totalAmount}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {/* Mobile Card View */}
            <div className="sm:hidden flex flex-col gap-4">
              {cart.map((item) => (
                <div key={`${item.sku}-${item.denomination}`} className="bg-white rounded-lg shadow p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded" />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-gray-600">
                        Denomination: {item.currency.symbol}
                        {item.denomination}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-2">
                    <span>Qty:</span>
                    <div className="inline-flex bg-white shadow-sm border rounded-full overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.sku, item.denomination, -1)}
                        className="px-2 py-1 bg-gray-100 hover:bg-red-200 transition text-red-600 font-semibold text-base focus:outline-none"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 text-center font-medium bg-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.sku, item.denomination, 1)}
                        disabled={getTotalQuantity() >= 3}
                        className={`px-2 py-1 bg-gray-100 ${getTotalQuantity() >= 3 ? 'cursor-not-allowed opacity-50' : 'hover:bg-green-200'} transition text-green-600 font-semibold text-base focus:outline-none`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Price:</span>
                    <span>
                      {item.currency.symbol}
                      {item.denomination}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Subtotal:</span>
                    <span>
                      {item.currency.symbol}
                      {Number(item.denomination) * item.quantity}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeItem(item.sku, item.denomination)}
                      className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                      title="Remove Item"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              ))}
              {/* Total for mobile */}
              <div className="bg-gray-100 rounded-lg p-3 text-right font-bold">
                Total: {cart[0]?.currency.symbol}
                {totalAmount}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4">
           <Link
            to="/products/121"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded shadow-md transition w-full sm:w-auto text-center"
          >
            Continue Shopping
          </Link>
          <button
            onClick={handleCheckout}
            disabled={isProcessing || cart.length === 0}
            className={`${
              isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            } text-white px-4 sm:px-6 py-2 sm:py-3 rounded shadow-md transition w-full sm:w-auto`}
          >
            {isProcessing ? "Processing..." : "Checkout"}
          </button>
        </div>
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CartGiftCardDisplay
                orderDataList={orderDataList}
                onClose={handleCloseModal}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default CartPage;