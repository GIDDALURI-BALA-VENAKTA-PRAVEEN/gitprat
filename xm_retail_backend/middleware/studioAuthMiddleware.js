import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'studiosecret';

export const studioAuthMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  try {
    const token = auth.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}; 