import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';
import Nav from '../NavBar/Nav';
import { Product, OrderCard } from './types';
import ProductInfo from './ProductInfo';
import RelatedProducts from './RelatedProducts';
import ToastNotification from './ToastNotification';
import NetworkStatusModal from './NetworkStatusModal';
import GiftCardDisplay from './GiftCardDisplay';
import { handleBuyNow } from './PaymentHandler';
import { recoverOrder } from './OrderRecovery';
// import ProcessingOrderModal from '../Cart/ProcessingOrderModal';

/**
 * ProductDetailsPage Component
 * Main component for displaying product details and handling purchases
 */
const ProductDetailsPage: React.FC = () => {
  // URL parameters and navigation
  const { productSku } = useParams<{ productSku: string }>();
  const navigate = useNavigate();

  // State management
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDenomination, setSelectedDenomination] = useState<string>("");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [orderData, setOrderData] = useState<OrderCard | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // State to manage network modal visibility and content
  const [networkModalState, setNetworkModalState] = useState<'hidden' | 'offline' | 'reconnecting'>('hidden');
  const [isCardDisplayReady, setIsCardDisplayReady] = useState(false);
  // Track if user was in payment process when network issues occurred
  const [wasInPaymentProcess, setWasInPaymentProcess] = useState(false);

  // Function to check for stable network connection
  const checkStableConnection = useCallback(async () => {
    try {
      // Attempt to fetch a small, cache-busting resource with a timeout
      const response = await Promise.race([
        fetch(`https://www.google.com/favicon.ico?_=${Date.now()}`, { mode: 'no-cors' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection check timed out')), 3000))
      ]);
      // If we get here and the promise didn't reject, the network is likely stable
      console.log('Stable connection detected.');
      return true;
    } catch (error) {
      // Connection check failed or timed out
      console.error('Connection check failed:', error);
      return false;
    }
  }, []);

  // Get user data from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = !!localStorage.getItem("user");

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (productSku) {
          const response = await axios.get(
            `http://localhost:4000/api/woohoo/product/details/${productSku}`
          );
          const data = response.data;
          if (data) {
            setProduct(data);
            if (data.price?.denominations?.length) {
              setSelectedDenomination(data.price.denominations[0]);
            }
          } else {
            setError("Product not found");
          }
        }
      } catch (err) {
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSku]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        if (productSku) {
          const response = await axios.get(
            `http://localhost:4000/api/woohoo/related-products/${productSku}`
          );
          setRelatedProducts(response.data || []);
        }
      } catch (error) {
        setRelatedProducts([]);
      }
    };

    fetchRelatedProducts();
  }, [productSku]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 Online event detected.');
      console.log('📊 Pre-online states - isPaymentProcessing:', isPaymentProcessing, 'showNetworkModal:', showNetworkModal);
      setIsOnline(true);
      setIsReconnecting(true);
      setNetworkModalState('reconnecting');

      // Start checking for stable connection
      let checkInterval: NodeJS.Timeout;
      const attemptRecoveryOrHideModal = async () => {
        const isStable = await checkStableConnection();
        if (isStable) {
          console.log('✅ Connection is stable, preparing to hide network modal.');
          clearInterval(checkInterval);
          setIsReconnecting(false);
          setNetworkModalState('hidden'); // Hide network modal immediately

          // Always show processing modal for a short time after network restore
          setIsPaymentProcessing(true);
          setWasInPaymentProcess(true);

          const pendingOrderRefno = localStorage.getItem('pendingOrderRefno');
          if (pendingOrderRefno) {
            console.log('🔄 Attempting to recover pending order:', pendingOrderRefno);
            recoverOrder(
              pendingOrderRefno,
              {
                name: storedUser.name,
                email: storedUser.email,
                phone: storedUser.phone
              },
              {
                onRecovering: () => setIsRecovering(true),
                onRecovered: (data) => {
                  setOrderData(data);
                  setShowSuccessModal(true);
                  localStorage.removeItem('pendingOrderRefno');
                  setIsRecovering(false);
                  setTimeout(() => {
                    setIsPaymentProcessing(false);
                    setWasInPaymentProcess(false);
                  }, 2000);
                  setRecoveryError(null);
                },
                onError: (error) => {
                  setRecoveryError(error);
                  setIsRecovering(false);
                  setIsPaymentProcessing(false);
                  setWasInPaymentProcess(false);
                  localStorage.removeItem('pendingOrderRefno');
                },
                onCanceled: () => {
                  setRecoveryError('Order was canceled. Please try again.');
                  localStorage.removeItem('pendingOrderRefno');
                  setIsRecovering(false);
                  setIsPaymentProcessing(false);
                  setWasInPaymentProcess(false);
                }
              }
            );
          } else {
            // No pending order: hide processing modal after 2 seconds
            setTimeout(() => {
              setIsPaymentProcessing(false);
              setWasInPaymentProcess(false);
            }, 2000);
          }
        } else {
          console.log('⏳ Connection not yet stable, continuing to check...');
        }
      };

      // Check connection every 500ms until stable
      checkInterval = setInterval(attemptRecoveryOrHideModal, 500);

      return () => {
        console.log('🧹 Cleaning up connection check interval.');
        clearInterval(checkInterval);
      };
    };

    const handleOffline = () => {
      console.log('📡 Offline event detected.');
      console.log('📊 Pre-offline states - isPaymentProcessing:', isPaymentProcessing, 'showNetworkModal:', showNetworkModal);
      console.log('💾 Current pending order refno:', localStorage.getItem('pendingOrderRefno'));
      setIsOnline(false);
      setIsReconnecting(false);
      setNetworkModalState('offline');
      console.log('❌ Network modal set to offline state');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      console.log('Removing network status listeners.');
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [storedUser, checkStableConnection]);

  // Initialize network state on component mount
  useEffect(() => {
    console.log('🚀 Component mounted, checking initial network state...');
    console.log('🌐 navigator.onLine:', navigator.onLine);
    
    if (!navigator.onLine) {
      console.log('🌐 Initial network state: offline - setting modal to show');
      setIsOnline(false);
      setNetworkModalState('offline');
      setShowNetworkModal(true);
    } else {
      console.log('🌐 Initial network state: online - hiding modal');
      setIsOnline(true);
      setNetworkModalState('hidden');
      setShowNetworkModal(false);
    }
  }, []);

  // Handle network modal visibility based on state
  useEffect(() => {
    console.log('🔄 networkModalState changed:', networkModalState);
    console.log('📊 Current states - isPaymentProcessing:', isPaymentProcessing, 'showSuccessModal:', showSuccessModal, 'showNetworkModal:', showNetworkModal);
    console.log('🌐 navigator.onLine:', navigator.onLine);
    
    if (networkModalState !== 'hidden') {
      setShowNetworkModal(true);
      console.log('✅ Network modal set to visible');
    } else {
      setShowNetworkModal(false);
      console.log('❌ Network modal set to hidden');
    }
  }, [networkModalState, isPaymentProcessing, showSuccessModal, showNetworkModal]);

  // Handle denomination change
  const handleDenominationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDenomination(e.target.value);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product || !selectedDenomination) return;

    let cart: any[] = [];
    try {
      const storedCart = localStorage.getItem("cart");
      cart = storedCart ? JSON.parse(storedCart) : [];
    } catch (err) {
      console.error("Invalid cart JSON in localStorage. Resetting cart.", err);
      cart = [];
    }

    const existingItemIndex = cart.findIndex(
      (item) =>
        item.sku === product.sku && item.denomination === selectedDenomination
    );

    let priceValue = product.price.value ?? parseFloat(selectedDenomination);
    if (isNaN(priceValue)) {
      priceValue = parseFloat(selectedDenomination);
    }

    const currencySymbol =
      typeof product.price.currency === "object"
        ? product.price.currency.symbol
        : product.price.currency || "₹";

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        sku: product.sku,
        name: product.name,
        image: product.images.thumbnail || product.images.base,
        denomination: selectedDenomination,
        currency: currencySymbol,
        quantity: 1,
        price: priceValue,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
  };

  // Handle buy now click
  const handleBuyNowClick = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!selectedDenomination) {
      setToastMessage("Please select a denomination");
      setShowToast(true);
      return;
    }

    if (!product) return;

    await handleBuyNow(
      product,
      selectedDenomination,
      {
        email: storedUser.email,
        phone: storedUser.phone,
        firstName: storedUser.firstName || '',
        lastName: storedUser.lastName || ''
      },
      {
        onProcessingStart: () => {
          setIsPaymentProcessing(true);
          setWasInPaymentProcess(true);
          console.log('🚀 Payment processing started, setting wasInPaymentProcess to true');
        },
        onProcessingEnd: () => {
          setIsPaymentProcessing(false);
          // Don't clear wasInPaymentProcess here - it should only be cleared when payment is truly complete
          console.log('🏁 Payment processing ended, keeping wasInPaymentProcess for network recovery');
        },
        onSuccess: async (refno, onPostPaymentComplete) => {
          console.log('💰 Payment success callback triggered with refno:', refno);
          console.log('🌐 Current network status - navigator.onLine:', navigator.onLine);
          
          // Always store the pending order refno for recovery purposes
          console.log('💾 Storing pending order refno in localStorage for recovery:', refno);
          localStorage.setItem('pendingOrderRefno', refno);
          
          // Fetch order details and show success modal
          try {
            console.log('📡 Attempting to fetch order details...');
            const response = await axios.get(`http://localhost:4000/api/order/details/${refno}`);
            if (response.data.success && response.data.data) {
              const orderDetails = response.data.data;
              console.log('📋 Order details fetched successfully:', orderDetails.status);
              
              setOrderData({
                sku: orderDetails.sku,
                amount: orderDetails.amount,
                cardNumber: orderDetails.cardNumber,
                cardPin: orderDetails.cardPin,
                validity: orderDetails.validity,
                issuanceDate: orderDetails.issuanceDate,
                status: orderDetails.status,
                refno: orderDetails.refno,
              });
              
              // Keep processing modal visible until success modal is fully displayed
              console.log('🎯 Setting success modal to true, keeping processing modal visible');
              setShowSuccessModal(true);
              
              // Do NOT set isPaymentProcessing to false here
              // It will be set to false in onCardDisplayReady
            }
          } catch (error) {
            console.log('❌ Error fetching order details, keeping refno for recovery');
            console.log('💾 Keeping pending order refno due to fetch error:', refno);
            // Keep the refno in localStorage for recovery if there's an error
            setToastMessage("Order placed but details couldn't be fetched. Will be processed automatically.");
            setShowToast(true);
            setIsPaymentProcessing(false);
            setWasInPaymentProcess(false);
          }
        },
        onError: (message: string, errorObj?: any) => {
          let displayMsg = message;
          if (errorObj?.code) {
            displayMsg = `Error Code: ${errorObj.code}\n${errorObj.details || errorObj.error || errorObj.message || message}`;
          }
          setToastMessage(displayMsg);
          setShowToast(true);
          setIsPaymentProcessing(false);
          setWasInPaymentProcess(false);

          setTimeout(() => setShowToast(false), 10000);
        }
      }
    );
  };

  // In the processing modal rendering logic
  // {isPaymentProcessing && !showSuccessModal && !showNetworkModal && (
  //   <ProcessingOrderModal open={true} />
  // )}

  return (
    <>
      <Nav />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <ToastNotification
            message={toastMessage}
            onClose={() => setShowToast(false)}
            type="error" // <-- Show error styling for all toasts here
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumb Navigation */}
        <div className="text-gray-500 text-sm mb-4">
          <span
            className="text-orange-500 cursor-pointer"
            onClick={() => navigate("/products/121")}
          >
            Products
          </span>{" "}
          / <span className="font-semibold">ProductDetails</span>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <p className="text-center text-gray-500 text-lg">Loading product details...</p>
        )}
        {error && <p className="text-center text-red-500 text-lg">{error}</p>}

        {/* Product Information */}
        {!loading && !error && product && (
          <>
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
              {product.name}
            </h1>
            
            <ProductInfo
              product={product}
              selectedDenomination={selectedDenomination}
              onDenominationChange={handleDenominationChange}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNowClick}
              isPaymentProcessing={isPaymentProcessing}
            />

            {/* Related Products */}
            <RelatedProducts products={relatedProducts} />
          </>
        )}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <GiftCardDisplay
              orderData={orderData}
              product={product}
              onClose={() => {
                setShowSuccessModal(false);
                setIsCardDisplayReady(false);
                setWasInPaymentProcess(false);
                console.log('🚪 Success modal closed, clearing wasInPaymentProcess');
              }}
              onCardDisplayReady={() => {
                setIsCardDisplayReady(true);
                setIsPaymentProcessing(false);
                setWasInPaymentProcess(false);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Network Status Modal */}
      <AnimatePresence>
        {showNetworkModal && (
          <NetworkStatusModal
            isReconnecting={isReconnecting}
            onReconnectComplete={() => {
              // This callback is no longer needed since NetworkStatusModal doesn't auto-hide
              // The network recovery is handled in the handleOnline function
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductDetailsPage;