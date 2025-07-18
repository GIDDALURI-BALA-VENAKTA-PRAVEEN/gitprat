import React from "react";
import { motion } from "framer-motion";

// Add type prop to interface
interface ToastNotificationProps {
  message: string;
  onClose: () => void;
  type?: "success" | "error";
}

/**
 * ToastNotification Component
 * Displays a temporary notification message with animation
 * @param message - The message to display
 * @param onClose - Function to call when the toast should close
 */
const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  onClose,
  type = "success",
}) => {
  // Remove internal auto-close timer, parent handles it now

  return (
    <motion.div
      className="fixed top-4 right-4 z-50"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      <div
        className={`px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 text-white ${
          type === "error" ? "bg-red-500" : "bg-green-500"
        }`}
      >
        {type === "error" ? (
          // Error icon
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Success icon
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        <span style={{ whiteSpace: "pre-line" }}>{message}</span>
      </div>
    </motion.div>
  );
};

export default ToastNotification;