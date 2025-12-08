import { connectToDatabase } from './Database.js';
import Profile from '@/modals/profile.js';
import { Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function uploadAvatarBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "profile_avatars",
        resource_type: "image",
        transformation: [
          { width: 300, height: 300, crop: "thumb", gravity: "face" },
        ],
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
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

  // Check for duplicate by personal.name if provided
  if (data.personal?.name) {
    const duplicate = await Profile.findOne({ 
      user: userId, 
      'personal.name': data.personal.name 
    });
    if (duplicate) throw new Error('A profile with this name already exists.');
  }
  
    let avatarData = null;

  if (data.avatarBuffer) {
    const result = await uploadAvatarBuffer(data.avatarBuffer);

    avatarData = {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: data.avatarFileName || "",
      mimetype: "image/jpeg",
      resourceType: "image",
    };

    if (!data.personal) data.personal = {};
    data.personal.avatar = avatarData;
  }

   delete data.avatarBuffer;
  delete data.avatarFileName;

  const profile = new Profile({
    ...data,
    user: new Types.ObjectId(userId),
  });

  await profile.save();
  return profile;
}

export async function getProfile(profileId) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(profileId)) throw new Error('Invalid profile ID');

  return Profile.findById(profileId);
}

export async function getProfilesByUser(userId) {
  await connectToDatabase();
  return Profile.find({ user: userId }).sort({ updatedAt: -1 });
}

export async function updateProfile(profileId, updates, userId) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(profileId))
    throw new Error("Invalid profile ID");

  const query = { _id: new Types.ObjectId(profileId) };
  if (userId) query.user = new Types.ObjectId(userId);

  const profile = await Profile.findOne(query);
  if (!profile) throw new Error("Profile not found or unauthorized");

  // -----------------------------------------------------
  // AVATAR UPLOAD PROCESS (same as user.js)
  // -----------------------------------------------------
  if (updates.avatarBuffer) {
    
    // If user requested avatar removal
if (updates.removeAvatar === true) {

  const oldAvatar = profile.personal?.avatar;
  if (oldAvatar?.publicId) {
    await deleteOldAvatar(oldAvatar.publicId);
  }

  updates.personal = {
    ...(profile.personal || {}),
    ...(updates.personal || {}),
    avatar: null,
  };
  
  delete updates.removeAvatar;
}

    // 1. Delete previous avatar if exists
    const oldAvatar = profile.personal?.avatar;
    if (oldAvatar?.publicId) {
      await deleteOldAvatar(oldAvatar.publicId);
    }

    // 2. Upload new avatar to Cloudinary
    const result = await uploadAvatarBuffer(updates.avatarBuffer);

    const avatarData = {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: updates.avatarFileName || "",
      mimetype: "image/jpeg",
      resourceType: "image",
    };
    
   
   console.log(updates);
    // 3. Merge correctly into personal object
    updates.personal = {
      ...(updates.personal || {}),
      avatar: avatarData,
    };
  }

  // Cleanup raw buffer data
  delete updates.avatarBuffer;
  delete updates.avatarFileName;

  // -----------------------------------------------------
  // REGULAR UPDATE EXECUTION
  // -----------------------------------------------------
const updated = await Profile.findOneAndUpdate(
  query,
  { $set: updates },
  {
    new: true,
    runValidators: true,
  }
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
  location,
  skill,
  email,
  customFieldKey,
  customFieldValue,
  page = 1,
  limit = 10,
  sortBy = 'updatedAt',
  order = 'desc'
}) {
  await connectToDatabase();

  const query = {};

  if (name) query['personal.name'] = { $regex: name, $options: 'i' };
  if (location) query['personal.location'] = { $regex: location, $options: 'i' };
  if (email) query['personal.email'] = { $regex: email, $options: 'i' };

  if (skill)
    query['skills.skills'] = { $regex: skill, $options: 'i' };

  if (customFieldKey && customFieldValue) {
    query[`customSections.items.fields.${customFieldKey}`] = {
      $regex: customFieldValue,
      $options: 'i'
    };
  }

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
