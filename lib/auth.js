import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { connectToDatabase } from './Database';
import RefreshToken from '@/modals/refreshToken';
import User from '@/modals/user';

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets are not configured');
}
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY

export function generateAccessToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

export function generateRefreshToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
}

/* -------------------- HASHING -------------------- */

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/* -------------------- USER FROM ACCESS TOKEN -------------------- */

export async function getUserFromToken(token) {
  const decoded = verifyAccessToken(token);
  if (!decoded?.sub) return null;

  await connectToDatabase();
  return User.findById(decoded.sub)
    .select('_id name email avatar')
    .lean();
}

/* -------------------- REFRESH TOKEN STORAGE -------------------- */

export async function saveRefreshToken(userId, refreshToken) {
  const hashed = hashToken(refreshToken);

  await connectToDatabase();

  return RefreshToken.create({
    userId,
    token: hashed,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

export async function removeRefreshToken(refreshToken) {
  const hashed = hashToken(refreshToken);
  await connectToDatabase();
  await RefreshToken.deleteOne({ token: hashed });
}

/* -------------------- ROTATING REFRESH TOKENS -------------------- */

export async function verifyAndRotateRefreshToken(refreshToken) {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded?.sub) return null;

  const hashed = hashToken(refreshToken);

  await connectToDatabase();

  const stored = await RefreshToken.findOne({ token: hashed });
  if (!stored) return null;

  // Rotate token
  await stored.deleteOne();

  const newRefreshToken = generateRefreshToken(decoded.sub);
  await saveRefreshToken(decoded.sub, newRefreshToken);

  const user = await User.findById(decoded.sub)
    .select('_id name email avatar')
    .lean();

  return { user, newRefreshToken };
}
