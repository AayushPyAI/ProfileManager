import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    avatar: {
        url: String,
        originalName: String,
        mimetype: String,
        publicId: String,
        resourceType: String
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

UserSchema.index({ email: 1 }, { unique: true });
const User = models.User || model('User', UserSchema);

// module.exports = User;
export default User;