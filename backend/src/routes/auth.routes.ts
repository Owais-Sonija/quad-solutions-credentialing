import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { registerUser, loginUser, loginAdmin } from '../controllers/auth.controller';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Validation middleware
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ],
  validate,
  registerUser
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginUser
);

router.post(
  '/admin/login',
  [
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginAdmin
);

export default router;
