import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const FIXED_USER = { username: 'alumno', password: '123456' };

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username !== FIXED_USER.username || password !== FIXED_USER.password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ token, user: { username } });
});

export default router;