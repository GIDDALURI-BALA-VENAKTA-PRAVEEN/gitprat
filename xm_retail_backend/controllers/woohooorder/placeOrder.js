import { signature } from "../../Woohooservice/signature.js";
import axios from "axios";
import WoohooOrder from "../../models/cardorders.js";
import { getActiveToken, generateNewToken } from '../../services/woohooTokenService.js';
import { encrypt, generateReferenceNumber } from './utils.js';
import { Op } from 'sequelize';

const woohooOrderUrl = `https://sandbox.woohoo.in/rest/v3/orders`;

/**
 * Places a new order with Woohoo API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const placeOrder = async (req, res) => {
  try {
    console.log('Starting placeOrder with request body:', req.body);
    
    const { 
      sku, 
      price, 
      razorpay_order_id, 
      razorpay_payment_id,
      razorpay_signature,
      firstName,
      lastName, 
      email, 
      phone, 
      quantity,
      uniqueRef, // Get uniqueRef from request
      orderIndex, // Get orderIndex from request
      productName
    } = req.body;

    console.log('Received productName:', productName);

    // Validate user info
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters",
        details: !firstName
          ? "firstName is required"
          : !lastName
          ? "lastName is required"
          : !email
          ? "email is required"
          : "phone is required",
      });
    }

    // Validate SKU, price, order ID, quantity
    if (!sku || !price || !razorpay_order_id || !quantity) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters",
        details: !sku
          ? "sku is required"
          : !price
          ? "price is required"
          : !razorpay_order_id
          ? "razorpay_order_id is required"
          : "quantity is required",
      });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid price",
        details: "Price should be a number greater than 0",
      });
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid quantity",
        details: "Quantity should be a positive integer",
      });
    }

    // Use uniqueRef as refno if provided, otherwise generate one
    const refno = uniqueRef || await generateReferenceNumber();
    console.log('Using refno:', refno);

    // Check if order already exists with this refno
    const existingOrder = await WoohooOrder.findOne({
      where: {
        refno: refno,
        status: {
          [Op.in]: ['completed', 'processing']
        }
      }
    });

    if (existingOrder) {
      console.log('Found existing order:', existingOrder.refno);
      return res.status(200).json({
        success: true,
        data: {
          refno: existingOrder.refno,
          status: existingOrder.status,
          message: 'Order already exists'
        }
      });
    }

    try {
      // Create initial order record with payment details
      const order = await WoohooOrder.create({
        firstName,
        lastName,
        email,
        phone,
        refno: refno,
        sku,
        productName: productName || "Gift Card",
        amount: parsedPrice,
        recipientName: firstName,
        recipientEmail: email,
        recipientPhone: phone,
        status: 'pending',
        paymentStatus: 'completed',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentAmount: parsedPrice,
        paymentCurrency: 'INR',
        paymentDate: new Date(),
        retryCount: 0,
        errorMessage: null,
        lastRetryAt: new Date(),
        orderIndex: orderIndex || 0 // Use provided orderIndex or default to 0
      });

      console.log(`Created new order with refno: ${refno}, productName: ${order.productName}`);

      // Get active token from database
      const token = await getActiveToken();
      console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
      
      if (!token || !token.accessToken) {
        // Store order as pending for later processing
        await order.update({
          status: 'pending',
          errorMessage: 'No valid Woohoo API token available'
        });

        return res.status(200).json({
          success: true,
          data: {
            refno: order.refno,
            status: 'pending',
            message: 'Order stored for later processing',
            cards: [{
              refno: order.refno,
              status: order.status,
              orderIndex: order.orderIndex
            }]
          }
        });
      }

      // Prepare payload for Woohoo API
      const payload = {
        address: {
          salutation: "Mr.",
          firstname: firstName,
          lastname: lastName,
          email: email,
          telephone: `+91${phone}`,
          line1: "123 Main Street",
          city: "Bangalore",
          region: "Karnataka",
          country: "IN",
          postcode: "560001",
          billToThis: true,
        },
        payments: [
          {
            code: "svc",
            amount: parsedPrice,
            poNumber: order.refno,
          },
        ],
        products: [
          {
            sku,
            price: parsedPrice,
            qty: 1,
            currency: 356,
            giftMessage: "Enjoy your gift!",
          },
        ],
        refno: order.refno,
        remarks: "Synchronous digital gift card order",
        deliveryMode: "API",
        syncOnly: true,
      };

      // Update order status to processing
      await order.update({ 
        status: 'processing',
        lastRetryAt: new Date()
      });
      console.log('Order status updated to processing for refno:', order.refno);

      let placed;
      let cardList = [];
      let lastError;
      let currentToken = token;
      let currentSignature;
      let currentDateAtClient;

      for (let attempt = 0; attempt < 2; attempt++) {
        // Regenerate signature for each attempt (in case payload or token changes)
        const { signature: generatedSignature, dateAtClient } = signature(
          "POST",
          woohooOrderUrl,
          payload
        );
        currentSignature = generatedSignature;
        currentDateAtClient = dateAtClient;
        try {
          const response = await axios.post(woohooOrderUrl, payload, {
            headers: {
              Authorization: `Bearer ${currentToken.accessToken}`,
              Signature: currentSignature,
              DateAtClient: currentDateAtClient,
              'Content-Type': 'application/json',
              Accept: '*/*'
            },
            timeout: 30000 // 30 second timeout
          });
          placed = response.data;
          cardList = Array.isArray(placed.cards) ? placed.cards : [];
          break; // Success, exit loop
        } catch (woohooError) {
          lastError = woohooError;
          // Enhanced error logging
          if (woohooError.response) {
            console.error('Woohoo API error:', {
              status: woohooError.response.status,
              data: woohooError.response.data,
              headers: woohooError.response.headers
            });

            // Check for token_rejected or 401 in any form
            if (
              woohooError.response.status === 401 ||
              (woohooError.response.data?.message?.includes("token_rejected") ||
                woohooError.response.data?.error === "oauth_problem=token_rejected" ||
                (typeof woohooError.response.data?.error === 'string' && woohooError.response.data?.error.includes("token_rejected")))
            ) {
              // Generate new token and retry
              const newToken = await generateNewToken();
              currentToken = newToken;
              continue;
            } else {
              // For ANY other Woohoo error, return the error code and message to frontend
              await order.update({
                status: 'failed',
                errorMessage: `Woohoo: ${woohooError.response.data?.message || 'Order failed'}`
              });
              return res.status(woohooError.response.status || 500).json({
                success: false,
                error: woohooError.response.data?.message || 'Order failed',
                code: woohooError.response.data?.code,
                details: (woohooError.response.data?.message || 'Order failed') + "\nIf money was deducted, please contact support for a refund.",
                refno: order.refno
              });
            }
          } else {
            console.error('Woohoo API error:', woohooError.message);
            break; // Exit loop on non-response error
          }
        }
      }

      if (Array.isArray(cardList) && cardList.length > 0) {
        // Update order with Woohoo response and card details
        await order.update({
          orderId: placed.orderId,
          cardNumber: cardList[0]?.cardNumber ? encrypt(cardList[0].cardNumber) : "",
          cardPin: cardList[0]?.cardPin ? encrypt(cardList[0].cardPin) : "",
          validity: cardList[0]?.validity,
          issuanceDate: cardList[0]?.issuanceDate ? new Date(cardList[0].issuanceDate) : null,
          balance: placed.payments?.[0]?.balance || null,
          status: 'completed',
          woohooResponse: placed,
          errorMessage: null
        });

        return res.status(200).json({
          success: true,
          data: {
            refno: order.refno,
            status: 'completed',
            message: 'Order completed successfully',
            cards: [{
              refno: order.refno,
              status: 'completed',
              orderIndex: order.orderIndex
            }]
          }
        });
      } else {
        // No cards in response, mark as pending
        await order.update({
          status: 'pending',
          errorMessage: 'No cards received from Woohoo API',
          retryCount: order.retryCount + 1
        });

        return res.status(200).json({
          success: true,
          data: {
            refno: order.refno,
            status: 'pending',
            message: 'Order stored for later processing',
            cards: [{
              refno: order.refno,
              status: 'pending',
              orderIndex: order.orderIndex
            }]
          }
        });
      }
    } catch (error) {
      console.error('Error processing order:', error);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error in placeOrder:', error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error.message
    });
  }
};