import React from 'react';
import { motion } from 'framer-motion';
import { OrderCard } from '../prodetailsorder/types';

interface CartGiftCardDisplayProps {
  orderDataList: OrderCard[];
  onClose: () => void;
}

const CartGiftCardDisplay: React.FC<CartGiftCardDisplayProps> = ({ orderDataList, onClose }) => {
  return (
    <motion.div
      className="bg-white rounded-xl p-4 w-full max-w-2xl shadow-xl relative"
      initial={{ y: "-100vh", rotate: -5 }}
      animate={{ y: 0, rotate: 0, transition: { type: "spring", stiffness: 120, damping: 14 } }}
      exit={{ y: "100vh", rotate: 5 }}
    >
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-amber-600">🎟 Gift Card(s) Details</h2>
        <p className="text-sm text-gray-600">Thank you for your purchase! Here are your gift card details:</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm mb-4 border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">SKU</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Card No</th>
              <th className="p-2 text-left">PIN</th>
              <th className="p-2 text-left">Validity</th>
              <th className="p-2 text-left">Issued On</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orderDataList.map((orderData, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{orderData.sku}</td>
                <td className="p-2">₹{orderData.amount}</td>
                <td className="p-2">{orderData.cardNumber}</td>
                <td className="p-2">{orderData.cardPin}</td>
                <td className="p-2">{orderData.validity}</td>
                <td className="p-2">{orderData.issuanceDate}</td>
                <td className="p-2 text-green-600 font-semibold">{orderData.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center">
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
};

export default CartGiftCardDisplay; 