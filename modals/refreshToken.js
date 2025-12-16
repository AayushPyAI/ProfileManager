import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  token: { type: String, index: true },
  expiresAt: { type: Date, index: true },
});

export default mongoose.models.RefreshToken || mongoose.model('RefreshToken', RefreshTokenSchema);
