import jwt from "jsonwebtoken";

const SECRET_KEY = "your_secret_key"; // Use environment variable in production

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export const adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
    
    console.log("✅ Admin Logged In - Token:", token);
    res.status(200).json({ 
      message: "Login successful", 
      token 
    });
  } else {
    console.warn("❌ Admin Login Failed: Invalid credentials");
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// Add logout endpoint
export const adminLogout = (req, res) => {
  // In a real app, you might want to blacklist the token
  res.status(200).json({ message: "Logout successful" });
};