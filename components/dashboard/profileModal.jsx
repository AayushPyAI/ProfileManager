// 'use client';

// import Image from 'next/image';
// import { X, Save, Loader2, AlertTriangle, Camera, Trash2, UserIcon, Mail } from 'lucide-react';

// const getNameInitials = (name = '') => {
//     if (!name) return 'U';
//     const parts = name.trim().split(/\s+/);
//     return parts.length === 1
//         ? parts[0].slice(0, 2).toUpperCase()
//         : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
// };

// const getAvatarColor = (name = '') => {
//     const colors = [
//         'bg-blue-500',
//         'bg-purple-500',
//         'bg-emerald-500',
//         'bg-orange-500',
//         'bg-pink-500',
//     ];
//     const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
//     return colors[hash % colors.length];
// };

// const handleChange = (field, value) => {
//     setProfileData((prev) => ({ ...prev, [field]: value }));
// };


// export default function ProfileModal({
//     isOpen,
//     onClose,
//     user,
//     profileData,
//     setProfileData,
//     isUpdating,
//     onSave,
//     error,
//     success,
// }) {
//     if (!isOpen) return null;

//     return (
//         <div className="modal modal-open">
//             <div className="modal-box relative bg-[#FDCFFA] border border-gray-300 rounded-xl p-0 overflow-hidden w-[95vw] max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto text-gray-900">
//                 <div className="sticky top-0 z-10 bg-[#4E56C0] to-purple-50 border-b border-gray-300 p-4 sm:p-6">
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4E56C0] rounded-lg flex items-center justify-center shadow-md">
//                                 <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//                             </div>
//                             <div>
//                                 <h3 className="font-bold text-lg text-white">Edit Profile</h3>
//                                 <p className="text-sm text-white/80">Update your personal info</p>
//                             </div>
//                         </div>
//                         <button
//                             className="btn btn-sm btn-circle  border-0 btn-ghost hover:bg-transparent text-white"
//                             onClick={onClose}
//                         >
//                             <X className="w-6 h-6" />
//                         </button>
//                     </div>
//                 </div>

//                 {/* Content */}
//                 <div className="p-4 sm:p-6">
//                     <div className="space-y-4">
//                         {/* Avatar Section */}
//                         <div className="bg-gray-50 border border-gray-300 p-4 rounded-xl">
//                             <div className="text-center">
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     id="avatarInput"
//                                     className="hidden"
//                                     onChange={(e) => {
//                                         const file = e.target.files?.[0];
//                                         if (!file) return;
//                                         handleChange('avatarFile', file);
//                                         handleChange('avatar', URL.createObjectURL(file));
//                                     }}

//                                 />

//                                 {/* Clickable Avatar */}
//                                 <div className="relative inline-block">
//                                     <div
//                                         className="cursor-pointer"
//                                         onClick={() => document.getElementById("avatarInput").click()}
//                                     >
//                                         {profileData?.avatar ? (
//                                             <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full shadow-md overflow-hidden mb-3 border-4 border-white">
//                                                 <Image
//                                                     src={typeof profileData.avatar === 'string' ? profileData.avatar : profileData.avatar.url}
//                                                     alt="Profile Avatar"
//                                                     width={120}
//                                                     height={120}
//                                                     className="object-cover w-full h-full"
//                                                 />
//                                             </div>
//                                         ) : (
//                                             <div
//                                                 className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center 
//             text-white text-2xl font-bold mx-auto mb-3 shadow-md 
//             ${getAvatarColor(profileData.name || user.name)}`}
//                                             >
//                                                 {getNameInitials(profileData.name || user.name)}
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Delete Avatar Button */}
//                                     {profileData?.avatar && (
//                                         <button
//                                             type="button"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();

//                                                 setProfileData((prev) => ({
//                                                     ...prev,
//                                                     avatar: "",
//                                                     avatarFile: null,
//                                                     removeAvatar: true,
//                                                 }));
//                                             }}
//                                             className="absolute top-0 right-0 sm:right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
//                                             title="Remove avatar"
//                                         >
//                                             <Trash2 className="w-4 h-4" />
//                                         </button>

//                                     )}
//                                 </div>

//                                 {/* Hint */}
//                                 <div className="text-gray-600 text-sm flex justify-center items-center gap-2">
//                                     <Camera className="w-4 h-4" />
//                                     <span>Click avatar to upload</span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Form Section */}
//                         <div className="bg-gray-50 border border-gray-300 p-4 rounded-xl">
//                             <div className="space-y-4">
//                                 <div className="form-control">
//                                     <label className="label text-sm font-semibold text-gray-900">
//                                         <UserIcon className="w-4 h-4 inline mr-2" /> Full Name
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="input input-bordered w-full bg-white border-gray-400 text-gray-900 placeholder-gray-500"
//                                         value={profileData.name}
//                                         onChange={(e) =>
//                                             setProfileData((prev) => ({
//                                                 ...prev,
//                                                 name: e.target.value,
//                                             }))
//                                         }
//                                         placeholder="Enter your full name"
//                                     />
//                                 </div>

//                                 <div className="form-control">
//                                     <label className="label text-sm font-semibold text-gray-900">
//                                         <Mail className="w-4 h-4 inline mr-2" /> Email
//                                     </label>
//                                     <input
//                                         type="email"
//                                         className="input input-bordered w-full bg-white border-gray-400 text-gray-900 placeholder-gray-500"
//                                         value={profileData.email}
//                                         readOnly
//                                         placeholder="Enter your email"
//                                     />
//                                 </div>

//                                 {error && (
//                                     <div className="alert bg-red-50 border border-red-300 rounded-lg p-3">
//                                         <AlertTriangle className="w-4 h-4 text-red-600" />
//                                         <span className="text-red-800 text-sm">{error}</span>
//                                     </div>
//                                 )}
//                                 {success && (
//                                     <div className="alert bg-green-50 border border-green-300 rounded-lg p-3">
//                                         <Save className="w-4 h-4 text-green-600" />
//                                         <span className="text-green-800 text-sm">{success}</span>
//                                     </div>
//                                 )}

//                                 <div className="flex flex-col sm:flex-row gap-3 pt-3">
//                                     <button
//                                         className="btn bg-white border-gray-400 rounded-lg hover:bg-[#4E56C0] hover:text-white text-[#4E56C0] flex-1 font-medium"
//                                         onClick={onClose}
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button
//                                         className="btn bg-[#4E56C0] rounded-lg text-white border  hover:bg-white hover:border-[#FDCFFA]  hover:text-[#4E56C0] flex-1 gap-2 shadow-md hover:shadow-lg font-medium"
//                                         // onClick={handleProfileUpdate}
//                                         // disabled={isUpdatingProfile}
//                                         onClick={onSave}
//                                         disabled={isUpdating}
//                                     >
//                                         {isUpdating ? (
//                                             <Loader2 className="w-4 h-4 animate-spin" />
//                                         ) : (
//                                             <Save className="w-4 h-4" />
//                                         )}
//                                         Update Profile
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className="modal-backdrop bg-black/50" onClick={onClose} />
//         </div>
//     );
// }


'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  Save,
  Loader2,
  AlertTriangle,
  Camera,
  Trash2,
  User as UserIcon,
  Mail,
} from 'lucide-react';

const getNameInitials = (name = '') => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name = '') => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-pink-500',
  ];
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  profileData,
  setProfileData,
  isUpdating,
  onSave,
  error,
  success,
}) {
  const objectUrlRef = useRef(null);

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleAvatarChange = (file) => {
    if (!file) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;

    setProfileData((prev) => ({
      ...prev,
      avatarFile: file,
      avatar: previewUrl,
      removeAvatar: false,
    }));
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box relative bg-[#FDCFFA] border border-gray-300 rounded-xl p-0 overflow-hidden w-[95vw] max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto text-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#4E56C0] border-b border-gray-300 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4E56C0] rounded-lg flex items-center justify-center shadow-md">
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Edit Profile</h3>
                <p className="text-sm text-white/80">Update your personal info</p>
              </div>
            </div>
            <button
              className="btn btn-sm btn-circle border-0 btn-ghost hover:bg-transparent text-white"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Avatar */}
          <div className="bg-gray-50 border border-gray-300 p-4 rounded-xl text-center">
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleAvatarChange(e.target.files?.[0])}
            />

            <div
              className="relative inline-block cursor-pointer"
              onClick={() => document.getElementById('avatarInput')?.click()}
            >
              {profileData?.avatar ? (
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md mb-3">
                  <Image
                    src={profileData.avatar}
                    alt="Profile Avatar"
                    width={120}
                    height={120}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-md ${getAvatarColor(
                    profileData.name || user.name
                  )}`}
                >
                  {getNameInitials(profileData.name || user.name)}
                </div>
              )}

              {profileData?.avatar && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileData((prev) => ({
                      ...prev,
                      avatar: '',
                      avatarFile: null,
                      removeAvatar: true,
                    }));
                  }}
                  className="absolute top-0 right-0 sm:right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-gray-600 text-sm flex justify-center items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>Click avatar to upload</span>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-50 border border-gray-300 p-4 rounded-xl space-y-4">
            <div>
              <label className="label text-sm font-semibold text-gray-900">
                <UserIcon className="w-4 h-4 inline mr-2" /> Full Name
              </label>
              <input
                type="text"
                className="input input-bordered w-full bg-white border-gray-400"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="label text-sm font-semibold text-gray-900">
                <Mail className="w-4 h-4 inline mr-2" /> Email
              </label>
              <input
                type="email"
                className="input input-bordered w-full bg-white border-gray-400"
                value={profileData.email}
                readOnly
              />
            </div>

            {error && (
              <div className="alert bg-red-50 border border-red-300 p-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="alert bg-green-50 border border-green-300 p-3">
                <Save className="w-4 h-4 text-green-600" />
                <span className="text-green-800 text-sm">{success}</span>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button
                className="btn bg-white border-gray-400 flex-1"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="btn bg-[#4E56C0] text-white flex-1 gap-2"
                onClick={onSave}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop bg-black/50" onClick={onClose} />
    </div>
  );
}

ProfileModal.displayName = 'ProfileModal';

