import { connectToDatabase } from './Database.js';
import User from '@/modals/user.js';
import bcrypt from 'bcryptjs';
import Profile from '@/modals/profile.js';
import { v2 as cloudinary } from 'cloudinary';
import { createUploadthing } from "uploadthing/next";
import streamifier, { createReadStream } from 'streamifier';
import sharp from 'sharp';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function optimizeAvatarBuffer(buffer) {
  return sharp(buffer)
    .resize(300, 300, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();
}

async function uploadAvatarToCloudinary(fileBuffer) {
  const optimizedBuffer = await optimizeAvatarBuffer(fileBuffer);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        resource_type: 'auto',
        transformation: [{ width: 250, height: 250, crop: 'thumb', gravity: 'face' }],
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
     createReadStream(optimizedBuffer).pipe(stream);
  });
}

async function deleteOldAvatar(avatarData) {
  if (!avatarData?.publicId) return;
  try {
    await cloudinary.uploader.destroy(avatarData.publicId, {
      resource_type: avatarData.resourceType || 'image',
    });
  } catch (err) {
    console.warn('Failed to delete old Cloudinary avatar:', err);
  }
}


// ----------------- User Functions -----------------
export async function registerUser(data) {
  await connectToDatabase();

  const existing = await User.findOne({ email: data.email });
  if (existing) throw new Error('User with this email already exists');

  let avatarData = null;
  if (data.avatarBuffer) {
    try {
      const result = await uploadAvatarToCloudinary(data.avatarBuffer, data.avatarFileName);
      avatarData = {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: 'image',
      };
    } catch (err) {
      console.error('Avatar upload failed:', err);
      throw new Error('Failed to upload avatar to Cloudinary');
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    avatar: avatarData,
  });

  return user;
}

export async function loginUser(email, password) {
  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid email or password');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid email or password');
  await user.save();

  return user;
}

export async function getUserById(userId) {
  await connectToDatabase();
  return await User.findById(userId).select('-password');
}

export async function updateUser(userId, data) {
  await connectToDatabase();
  
  let avatarData = null;
   if (data.avatarBuffer) {
    try {
      // Delete old avatar first
      const user = await User.findById(userId);
      if (user?.avatar) {
        await deleteOldAvatar(user.avatar);
      }

      // Upload new avatar
      const result = await uploadAvatarToCloudinary(data.avatarBuffer, data.avatarFileName);
      avatarData = {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: 'image',
      };
    } catch (err) {
      console.error('Avatar upload failed:', err);
      throw new Error('Failed to upload avatar to Cloudinary');
    }
  }
  
  const updatedData = {
    ...data,
    ...(avatarData ? { avatar: avatarData } : {}),
  };

  return await User.findByIdAndUpdate(userId, updatedData, { new: true }).select('-password');
}

export async function deleteUser(userId) {
  await connectToDatabase();

  // Optional: delete avatar from Cloudinary if exists
  const user = await User.findById(userId);
  if (user?.avatar) {
    await deleteOldAvatar(user.avatar);
  }
  await User.findByIdAndDelete(userId);
  await Profile.deleteMany({ user: userId });

  return { success: true };
}