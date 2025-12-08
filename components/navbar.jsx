'use client';

import {useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  LogOut, 
  X, 
  Mail, 
  User as UserIcon,
  Camera,
  Trash2,
  Save,
  Loader2,
  Shield,
  AlertTriangle,
  Edit3,
  Key,
  Star,
  Menu,
} from 'lucide-react';
import LoginForm from './login';
// import RegisterModal from './register';
import { useUser } from '@/contexts/UserContext';

// Utility function to get initials from name
const getNameInitials = (name) => {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Utility function to get color based on name
const getAvatarColor = (name) => {
  const colors = [
    'bg-linear-to-br from-blue-500 to-cyan-500',
    'bg-linear-to-br from-purple-500 to-pink-500',
    'bg-linear-to-br from-emerald-500 to-teal-500',
    'bg-linear-to-br from-orange-500 to-red-500',
    'bg-linear-to-br from-violet-500 to-purple-500',
    'bg-linear-to-br from-amber-500 to-orange-500',
    'bg-linear-to-br from-green-500 to-emerald-500',
    'bg-linear-to-br from-rose-500 to-pink-500',
    'bg-linear-to-br from-indigo-500 to-blue-500',
    'bg-linear-to-br from-sky-500 to-blue-500',
  ];

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const UserAvatar = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
  };
  const initials = getNameInitials(user.name);
  const color = getAvatarColor(user.name);

  return user.avatar ? (
    <Image
      src={user?.avatar?.url ? user?.avatar?.url : user?.avatar}
      alt="avatar"
      width={40}
      height={40}
      className={`${sizeClasses[size]} rounded-full object-cover border-2 border-slate-300`}
    />
  ) : (
    <div
      className={`rounded-full ${sizeClasses[size]} bg-linear-to-br ${color} flex items-center justify-center text-white font-bold border-2 border-white shadow-sm`}
    >
      {initials}
    </div>
  );
};

// -----------------------------
// Navbar component
// -----------------------------
const Navbar = () => {
  const router = useRouter();
  const { user, login, logout, authenticatedFetch, setUser } = useUser();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Profile modal states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Settings modal states
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleLogout = useCallback(() => {
    logout();
    setShowLogoutModal(false);
    router.push('/');
  }, [logout, router]);

  const handleLoginSuccess = useCallback((userData) => {
    login(userData);
    setShowLoginModal(false);
  }, [login]);

  const handleRegisterSuccess = useCallback((userData) => {
    login(userData);
    setShowRegisterModal(false);
  }, [login]);

  const openRegisterFromLogin = useCallback(() => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  }, []);

  const openLoginFromRegister = useCallback(() => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  }, []);

  // Profile Modal Functions
  const openProfileModal = useCallback(() => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowProfileModal(true);
    setProfileError('');
    setProfileSuccess('');
  }, [user]);

  const handleProfileUpdate = useCallback(async () => {
    if (!user) return;    
    setIsUpdatingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    const fd = new FormData();
    fd.append("name", profileData.name);
    fd.append("email", profileData.email);

    if (profileData.avatarFile) {
      fd.append("avatar", profileData.avatarFile);
    }
    
    try {
      const response = await authenticatedFetch('/api/user/update', {
        method: 'PATCH',
        body: fd,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }
      
      const data = await response.json();
      const updatedUser = data.user;
      
      // Update user in context (but keep tokens)
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileSuccess('Profile updated successfully!');
      
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  }, [user, profileData, authenticatedFetch, setUser]);

  const handleProfileChange = useCallback((field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Settings Modal Functions
  const openSettingsModal = useCallback(() => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowSettingsModal(true);
    setDeleteConfirm('');
    setProfileError('');
  }, [user]);

  const handleDeleteAccount = useCallback(async () => {
    if (!user) return;
    
    if (deleteConfirm !== 'DELETE') {
      setProfileError('Please type "DELETE" to confirm account deletion');
      return;
    }

    setIsDeleting(true);
    setProfileError('');
    
    try {
      const response = await authenticatedFetch(`/api/user/${user._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }
      
      handleLogout();
    } catch (error) {
      setProfileError(error? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  }, [user, deleteConfirm, handleLogout, authenticatedFetch]);

  const closeModals = useCallback(() => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowProfileModal(false);
    setShowSettingsModal(false);
    setProfileError('');
    setProfileSuccess('');
    setDeleteConfirm('');
  }, []);

  return (
    <>
      <nav className="bg-linear-to-r from-[#9B5DE0] via-[#D78FEE] to-[#FDCFFA] backdrop-blur-md border-b border-[#FDCFFA] px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
            onClick={() => router.push('/')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4E56C0] rounded-lg sm:rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold bg-linear-to-r text-white bg-clip-text">
                ProfileManager
              </h1>
              <p className="text-xs text-[#FDCFFA] hidden sm:block">
                Professional Profile Management
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-lg border border-[#D78FEE] transition bg-white hover:text-[#4E56C0]"
              onClick={() => setMobileMenu((p) => !p)}
            >
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="flex items-center gap-2 sm:gap-3 p-2 rounded-xl bg-white hover:bg-[#D78FEE] border border-slate-300  hover:border-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <UserAvatar user={user} size="md" />
                    <div className="hidden sm:block text-left">
                      <div className="font-semi text-sm">{user.name}</div>
                      <div className="text-xs">View Profile</div>
                    </div>
                  </div>

                  <ul
                    tabIndex={-1}
                    className="dropdown-content menu bg-blur rounded-xl z-50 mt-2 w-64 sm:w-72 p-2 shadow-xl border border-slate-300"
                  >
                    <li className="p-3 bg-linear-to-r from-[#4E56C0] via-[#D78FEE] to-[#FDCFFA] rounded-lg border border-[#FDCFFA] mb-2">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="lg" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate text-sm uppercase">{user.name}</h3>
                          <p className="text-xs text-white/90 truncate">{user.email}</p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <a
                        onClick={() => setShowProfileModal(true)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Edit3 className="w-4 h-4 text-blue-700" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">Edit Profile</div>
                          <div className="text-xs text-gray-600">
                            Update personal information
                          </div>
                        </div>
                      </a>
                    </li>
                    {/* <li>
                      <a
                        onClick={() => setShowSettingsModal(true)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Settings className="w-4 h-4 text-amber-700" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">Account Settings</div>
                          <div className="text-xs text-gray-600">Manage preferences</div>
                        </div>
                      </a>
                    </li> */}
                    <li className="border-t border-gray-300 mt-2 pt-2">
                      <a
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center gap-3 p-2 rounded-lg text-red-700 hover:bg-red-50 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <LogOut className="w-4 h-4 text-red-700" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Logout</div>
                          <div className="text-xs text-red-600">Sign out of account</div>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-linear-to-r from-[#4E56C0] to-[#FDCFFA] hover:bg-[#4E56C0] text-white font-semibold py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
                >
                  <Key className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-300 shadow-inner p-4 space-y-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <UserAvatar user={user} />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-700 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-900 border border-gray-200"
              >
                <Edit3 className="w-4 h-4 text-blue-600" /> 
                <span className="text-sm font-medium">Edit Profile</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-900 border border-gray-200"
              >
                <Settings className="w-4 h-4 text-amber-600" /> 
                <span className="text-sm font-medium">Account Settings</span>
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-red-700 hover:bg-red-50 border border-red-200"
              >
                <LogOut className="w-4 h-4" /> 
                <span className="text-sm font-medium">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
            >
              <Key className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && user && (
        <div className="modal modal-open">
          <div className="modal-box relative bg-[#FDCFFA] border border-gray-300 rounded-xl p-0 overflow-hidden w-[95vw] max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto text-gray-900">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#4E56C0] to-purple-50 border-b border-gray-300 p-4 sm:p-6">
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
                  className="btn btn-sm btn-circle  border-0 btn-ghost hover:bg-transparent text-white"
                  onClick={() => setShowProfileModal(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Avatar Section */}
                <div className="bg-gray-50 border border-gray-300 p-4 rounded-xl">
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      id="avatarInput"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        handleProfileChange("avatarFile", file);

                        const previewUrl = URL.createObjectURL(file);
                        handleProfileChange("avatar", previewUrl);
                      }}

                    />

                    {/* Clickable Avatar */}
                    <div className="relative inline-block">
                      <div
                        className="cursor-pointer"
                        onClick={() => document.getElementById("avatarInput").click()}
                      >
                        {profileData?.avatar ? (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full shadow-md overflow-hidden mb-3 border-4 border-white">
                            <Image
                              src={typeof profileData.avatar === 'string' ? profileData.avatar : profileData.avatar.url}
                              alt="Profile Avatar"
                              width={120}
                              height={120}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center 
            text-white text-2xl font-bold mx-auto mb-3 shadow-md 
            ${getAvatarColor(profileData.name || user.name)}`}
                          >
                            {getNameInitials(profileData.name || user.name)}
                          </div>
                        )}
                      </div>

                      {/* Delete Avatar Button */}
                      {profileData?.avatar && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProfileChange("avatar", "");
                            handleProfileChange("avatarFile", null);
                            handleProfileChange("removeAvatar", true);
                          }}
                          className="absolute top-0 right-0 sm:right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                          title="Remove avatar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Hint */}
                    <div className="text-gray-600 text-sm flex justify-center items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span>Click avatar to upload</span>
                    </div>
                  </div>
                </div>
                
                {/* Form Section */}
                <div className="bg-gray-50 border border-gray-300 p-4 rounded-xl">
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label text-sm font-semibold text-gray-900">
                        <UserIcon className="w-4 h-4 inline mr-2" /> Full Name
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full bg-white border-gray-400 text-gray-900 placeholder-gray-500"
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label text-sm font-semibold text-gray-900">
                        <Mail className="w-4 h-4 inline mr-2" /> Email
                      </label>
                      <input
                        type="email"
                        className="input input-bordered w-full bg-white border-gray-400 text-gray-900 placeholder-gray-500"
                        value={profileData.email}
                        readOnly
                        placeholder="Enter your email"
                      />
                    </div>

                    {profileError && (
                      <div className="alert bg-red-50 border border-red-300 rounded-lg p-3">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-red-800 text-sm">{profileError}</span>
                      </div>
                    )}
                    {profileSuccess && (
                      <div className="alert bg-green-50 border border-green-300 rounded-lg p-3">
                        <Save className="w-4 h-4 text-green-600" />
                        <span className="text-green-800 text-sm">{profileSuccess}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-3">
                      <button
                        className="btn bg-white border-gray-400 rounded-lg hover:bg-[#4E56C0] hover:text-white text-[#4E56C0] flex-1 font-medium"
                        onClick={() => setShowProfileModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn bg-[#4E56C0] rounded-lg text-white border  hover:bg-white hover:border-[#FDCFFA]  hover:text-[#4E56C0] flex-1 gap-2 shadow-md hover:shadow-lg font-medium"
                        onClick={handleProfileUpdate}
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? (
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
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setShowProfileModal(false)} />
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white border border-gray-300 rounded-xl w-[90vw] max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Logout Confirmation</h3>
            </div>
            <p className="text-gray-700 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button
                className="btn bg-white border-gray-400 hover:bg-gray-100 text-gray-900 flex-1 font-medium"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn bg-linear-to-r from-amber-500 to-orange-500 text-white flex-1 font-medium gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setShowLogoutModal(false)} />
        </dialog>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <dialog className="modal modal-open">
          <div className="modal-box relative bg-white border border-gray-300 rounded-xl w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 hover:bg-gray-200 text-gray-700"
              onClick={() => setShowLoginModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-4 sm:p-6 text-gray-900">
              <LoginForm
                onSuccess={handleLoginSuccess}
                onClose={() => setShowLoginModal(false)}
              />
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setShowLoginModal(false)} />
        </dialog>
      )}

      {/* Register Modal */}
      {/* {showRegisterModal && (
        <dialog className="modal modal-open">
          <div className="modal-box relative bg-white border border-gray-300 rounded-xl w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 hover:bg-gray-200 text-gray-700"
              onClick={() => setShowRegisterModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-4 sm:p-6 text-gray-900">
              <RegisterModal
                onSwitchToLogin={openLoginFromRegister}
                onSuccess={handleRegisterSuccess}
              />
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setShowRegisterModal(false)} />
        </dialog>
      )} */}

      {/* Settings Modal */}
      {/* {showSettingsModal && user && (
        <dialog className="modal modal-open">
          <div className="modal-box relative bg-white border border-gray-300 rounded-xl w-[95vw] max-w-md max-h-[90vh] overflow-y-auto text-gray-900">
            <button
              className="btn btn-sm btn-circle btn-ghost  border-0 absolute right-3 top-3 hover:bg-transparent text-gray-700"
              onClick={() => setShowSettingsModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Account Settings</h3>
                  <p className="text-gray-700 text-sm">Manage your account preferences</p>
                </div>
              </div>

              <div className="border-2 border-red-300 bg-red-50 rounded-xl p-4 space-y-4">
                <div>
                  <h5 className="font-semibold text-red-800 flex items-center gap-2 text-sm mb-2">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </h5>
                  <p className="text-red-700 text-xs mb-3">
                    This action permanently removes your data. Type DELETE to confirm.
                  </p>
                  <input
                    type="text"
                    className="input input-bordered border-red-400 w-full bg-white text-gray-900 placeholder-red-400 text-sm"
                    placeholder='Type "DELETE" to confirm'
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                  />
                </div>
                {profileError && (
                  <div className="alert bg-red-50 border border-red-300 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-red-800 text-sm">{profileError}</span>
                  </div>
                )}
                <button
                  className="btn bg-linear-to-r from-red-600 to-pink-600 text-white w-full gap-2 rounded-lg disabled:opacity-50 font-medium text-sm"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirm !== 'DELETE'}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Account Permanently
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setShowSettingsModal(false)} />
        </dialog>
      )} */}
    </>
  );
};

export default Navbar;