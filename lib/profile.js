import { connectToDatabase } from './Database.js';
import Profile from '@/modals/profile.js';
import { Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
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

export async function uploadAvatarBuffer(buffer) {
  const optimizedBuffer = await optimizeAvatarBuffer(buffer);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "profile_avatars",
        resource_type: "image",
        transformation: [{ width: 300, height: 300, crop: "thumb" }],
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    streamifier.createReadStream(optimizedBuffer).pipe(stream);
  });
}

export async function deleteOldAvatar(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn("Failed to delete old Cloudinary avatar:", err);
  }
}

export async function createProfile(userId, data) {
  await connectToDatabase();
  if (!data.personal?.name) throw new Error('Profile name is required');
    const duplicate = await Profile.findOne({ 
    user: userId, 
    'personal.name': data.personal.name 
  });
  if (duplicate) throw new Error('Profile with this name already exists');

  const profileData = {
    user: new Types.ObjectId(userId),
    personal: {
      name: data.personal.name,
      email: data.personal.email || '',
      avatar: null
    },
    sectionOrder: [
      'personal',
      'education', 
      'experience',
      'projects',
      'skills',
      'certification',
      'customSections'
    ]
  };

  // Handle avatar upload if present
  if (data.avatarBuffer) {
    const result = await uploadAvatarBuffer(data.avatarBuffer);
    profileData.personal.avatar = {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: data.avatarFileName || '',
      mimetype: 'image/jpeg',
      resourceType: 'image'
    };
  }

  const optionalFields = ['education', 'experience', 'projects', 'skills', 'certification', 'customSections'];
  optionalFields.forEach(field => {
    if (data[field]?.length > 0) {
      profileData[field] = data[field];
    }
  });
  const profile = new Profile(profileData);
  await profile.save();
  return profile;
}

export async function getProfile(profileId) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(profileId)) throw new Error('Invalid profile ID');

  return Profile.findById(profileId).lean();
}

export async function getProfilesByUser(userId, page, limit) {
  await connectToDatabase();
  const skip = (page - 1) * limit;
  const profiles = await Profile.find({ user: userId })
    .select('_id personal.name personal.email personal.avatar experience.position education.degree updatedAt')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);
    
  return profiles.map(profile => ({
    ...profile.toObject(),
    experienceTitle: profile.experience?.[0]?.position || null
  }));
}

export async function countUserProfiles(userId) {
  await connectToDatabase();
  return Profile.countDocuments({ user: userId });
}

export async function countRecentProfiles(userId, days = 7) {
  await connectToDatabase();
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return Profile.countDocuments({ 
    user: userId,
    updatedAt: { $gte: dateThreshold }
  });
}

export async function updateProfile(profileId, updates, userId) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(profileId)) throw new Error('Invalid profile ID');

  const query = { _id: new Types.ObjectId(profileId) };
  if (userId) query.user = new Types.ObjectId(userId);

  const profile = await Profile.findOne(query);
  if (!profile) throw new Error('Profile not found');

  // AVATAR HANDLING
  if (updates.removeAvatar) {
    const oldAvatar = profile.personal?.avatar;
    if (oldAvatar?.publicId) {
      await deleteOldAvatar(oldAvatar.publicId);
    }
    updates.personal = updates.personal || {};
    updates.personal.avatar = null;
    delete updates.removeAvatar;
  }

  if (updates.avatarBuffer) {
    const oldAvatar = profile.personal?.avatar;
    if (oldAvatar?.publicId) {
      await deleteOldAvatar(oldAvatar.publicId);
    }

    const result = await uploadAvatarBuffer(updates.avatarBuffer);
    updates.personal = updates.personal || {};
    updates.personal.avatar = {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: updates.avatarFileName || '',
      mimetype: 'image/jpeg',
      resourceType: 'image'
    };
  }

  // Clean up temporary fields
  delete updates.avatarBuffer;
  delete updates.avatarFileName;

  // PARTIAL UPDATE LOGIC
  const updateObj = {};
  
  // Handle personal object updates
  if (updates.personal) {
    Object.keys(updates.personal).forEach(key => {
      updateObj[`personal.${key}`] = updates.personal[key];
    });
  }

  // Handle array field updates (replace entire array or use array operators)
  const arrayFields = ['education', 'experience', 'projects', 'skills', 'certification', 'customSections'];
  arrayFields.forEach(field => {
    if (updates[field] !== undefined) {
      updateObj[field] = updates[field];
    }
  });

  // Handle sectionOrder if provided
  if (updates.sectionOrder) {
    updateObj.sectionOrder = updates.sectionOrder;
  }

  // Only update if there are actual changes
  if (Object.keys(updateObj).length === 0) {
    return profile;
  }

  const updated = await Profile.findOneAndUpdate(
    query,
    { $set: updateObj },
    { new: true, runValidators: true }
  );

  return updated;
}

export async function deleteProfile(profileId, userId) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(profileId))
    throw new Error("Invalid profile ID");

  const query = { _id: new Types.ObjectId(profileId) };
  if (userId) query.user = new Types.ObjectId(userId);

  const profile = await Profile.findOne(query);
  if (!profile) return false;

  const avatar = profile.personal?.avatar;
  if (avatar?.publicId) {
    await deleteOldAvatar(avatar.publicId);
  }

  // Delete profile document
  const result = await Profile.deleteOne(query);
  return result.deletedCount > 0;
}

export async function deleteProfileField(profileId, field, itemIdOrValue) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(profileId))
    throw new Error("Invalid profile ID");

  const profile = await Profile.findById(profileId);
  if (!profile) throw new Error("Profile not found");
  if (field === "personal.avatar") {
    const avatar = profile.personal?.avatar;

    if (avatar?.publicId) {
      await deleteOldAvatar(avatar.publicId);
    }

    profile.personal.avatar = null;
    await profile.save();
    return profile;
  }

  if (field.startsWith("customSections")) {
    const [_, sectionId] = field.split(".");

    return Profile.findByIdAndUpdate(
      profileId,
      {
        $pull: {
          "customSections.$[section].items": {
            _id: new Types.ObjectId(itemIdOrValue),
          },
        },
      },
      {
        new: true,
        arrayFilters: [{ "section._id": new Types.ObjectId(sectionId) }],
      }
    );
  }

  const pullQuery = {
    $pull: {
      [field]: { _id: new Types.ObjectId(itemIdOrValue) },
    },
  };

  return Profile.findByIdAndUpdate(profileId, pullQuery, { new: true });
}

export async function searchProfiles({
  name,
  email,
  page = 1,
  limit = 10,
  sortBy = 'updatedAt',
  order = 'desc'
}) {
  await connectToDatabase();

  const query = {};

  if (name) query['personal.name'] = { $regex: name, $options: 'i' };
  if (email) query['personal.email'] = { $regex: email, $options: 'i' };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const [results, total] = await Promise.all([
    Profile.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    Profile.countDocuments(query),
  ]);

  return {
    results,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
}
