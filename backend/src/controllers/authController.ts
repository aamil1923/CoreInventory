import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '../config/database';
import { signToken } from '../utils/jwt';
import { generateOtp, getOtpExpiry, isOtpExpired } from '../utils/otp';
import { AppError } from '../middleware/errorMiddleware';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['MANAGER', 'WAREHOUSE']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const requestResetSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
});

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = signupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email already registered', 409);

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        role: data.role ?? 'WAREHOUSE',
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function requestReset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = requestResetSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({ success: true, message: 'If that email exists, an OTP has been sent' });
      return;
    }

    const otp = generateOtp();
    const expiry = getOtpExpiry();

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpiry: expiry },
    });

    // In production: send OTP via email (SendGrid, Resend, etc.)
    // For development/hackathon, we return it in the response
    const responseData: Record<string, unknown> = { message: 'OTP generated' };
    if (process.env.NODE_ENV !== 'production') {
      responseData.otp = otp; // Remove in production
    }

    res.json({ success: true, message: 'If that email exists, an OTP has been sent', data: responseData });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, otp, newPassword } = verifyOtpSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.otpCode || !user.otpExpiry) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    if (user.otpCode !== otp) throw new AppError('Invalid OTP', 400);
    if (isOtpExpired(user.otpExpiry)) throw new AppError('OTP has expired', 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, otpCode: null, otpExpiry: null },
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
}
