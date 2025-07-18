// controllers/customerController.js
import { User } from "../models/User.js";

// Fetch customer details
export const getCustomerDetails = async (req, res) => {
  try {
    const customers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
    });

    if (!customers.length) {
      return res.status(404).json({ success: false, message: "No customers found" });
    }

    return res.status(200).json({ success: true, data: customers });
  } catch (error) {
    console.error("Error fetching customer details:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
