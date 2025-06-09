import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.employee_id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};
