import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (user) => {
  const payload = {
    id: user.employee_id,
    email: user.email,
    role: {
      role_id: user.role.role_id,
      role_name: user.role.role_name,
    },
    designation: {
      designation_id: user.designation.designation_id,
      designation_name: user.designation.designation_name,
    },
    team_id: user.team_id,
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};