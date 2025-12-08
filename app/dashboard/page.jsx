'use client';

import {useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  FileText, 
  TrendingUp, 
  Plus,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import ProfileList from '@/components/dashboard/ProfileList';
import SearchBar from '@/components/dashboard/Searchbar';
import ProfileFormModal from '@/components/dashboard/ProfileFormModal'; 
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const Dashboard = () => {
  const router = useRouter();
  const { user, authenticatedFetch } = useUser();
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [stats, setStats] = useState({
    totalProfiles: 0,
    recentProfiles: 0,
  });

  // Check authentication with proper loading state
  useEffect(() => {
    if (user === null) {
      setIsCheckingAuth(true);
    } else if (user === undefined || !user._id) {
      router.push('/');
    } else {
      setIsCheckingAuth(false);
    }
  }, [user, router]);

  // Fetch user profiles
  const fetchProfiles = useCallback(async () => {
    if (!user || !user._id) return;
    
    try {
      setIsLoading(true);
      const response = await authenticatedFetch(`/api/user/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profiles: ${response.status}`);
      }
      
      const data = await response.json();
      let userProfiles= [];
      
      if (data.profile) {
        userProfiles = Array.isArray(data.profile) ? data.profile : [data.profile];
      } else if (data.profiles) {
        userProfiles = data.profiles;
      } else if (Array.isArray(data)) {
        userProfiles = data;
      }
      
  const completeProfiles = userProfiles.map((profile) => ({
  _id: profile._id,
  personal: profile.personal || {},
  education: profile.education || [],
  experience: profile.experience || [],
  projects: profile.projects || [],
  skills: profile.skills || [],
  certification: profile.certification || [],
  customSections: profile.customSections || [], // Keep as customSections
  sectionOrder: profile.sectionOrder || [],
  updatedAt: profile.updatedAt,
  createdAt: profile.createdAt,
}));     
      setProfiles(completeProfiles);
      setFilteredProfiles(completeProfiles);
      const totalProfiles = completeProfiles.length;
      const recentProfiles = completeProfiles.filter((p) => 
        new Date(p.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;
      setStats({
        totalProfiles,
        recentProfiles,
      });
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setProfiles([]);
      setFilteredProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, authenticatedFetch]);

  useEffect(() => {
    if (!isCheckingAuth && user) {
      fetchProfiles();
    }
  }, [fetchProfiles, isCheckingAuth, user]);

  const handleSearch = useCallback(
    (query) => {
      if (!query.trim()) {
        setFilteredProfiles(profiles);
        return;
      }

      const q = query.toLowerCase();

      const filtered = profiles.filter(
        (p) =>
          p.personal?.name?.toLowerCase().includes(q) ||
          p.personal?.email?.toLowerCase().includes(q) ||
          p.personal?.location?.toLowerCase().includes(q)
      );

      setFilteredProfiles(filtered);
    },
    [profiles]
  );

  const handleCreateProfile = () => {
    console.log('Opening create profile modal');
    setEditingProfile(null);
    setIsFormModalOpen(true);
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setIsFormModalOpen(true);
  };

 const handleSaveProfile = async (profileData) => {
  if (!user) return;

  setIsSaving(true);
  try {
    const formData = new FormData();

    // Extract avatarFile so it does NOT go inside JSON
    const { avatarFile, ...cleanData } = profileData;

    if (editingProfile) {
      formData.append("profileId", editingProfile._id);
      formData.append("updates", JSON.stringify(cleanData));
    } else {
      formData.append("data", JSON.stringify(cleanData));
    }

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const endpoint = editingProfile
      ? "/api/profile/update"
      : "/api/profile/create";

    const response = await authenticatedFetch(endpoint, {
      method: editingProfile ? "PATCH" : "POST",
      body: formData,
      // NO CONTENT-TYPE HEADER HERE!
    });

    if (!response.ok) {
      throw new Error("Failed to save profile");
    }

    await fetchProfiles();
    setIsFormModalOpen(false);
    setEditingProfile(null);

  } catch (error) {
    console.error("Error saving profile:", error);
  } finally {
    setIsSaving(false);
  }
};


const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingProfile(null);

};

  const handleDeleteProfile = async (profileId) => {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) return;

    try {
      const response = await authenticatedFetch(`/api/profile/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete profile: ${response.status}`);
      }

      await fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile. Please try again.');
    }
  };

// Prevent window close, refresh, or navigation while form modal is open
useEffect(() => {
  if (!isFormModalOpen) return;

  // 1. Prevent closing browser/tab refresh
  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = ""; // Chrome requires this
  };

  // 2. Prevent browser back button
  const handlePopState = () => {
    const confirmed = confirm("You have unsaved changes. Do you really want to leave?");
    if (!confirmed) {
      // push user back to same page
      window.history.pushState(null, "", window.location.href);
    }
  };

  // 3. Prevent Next.js route changes (App Router)
  const handleRouteChange = () => {
    const confirmed = confirm("You have unsaved changes. Do you really want to leave?");
    if (!confirmed) {
      throw "Navigation aborted";
    }
  };

  // Bind listeners
  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("popstate", handlePopState);

  // For Next.js router navigation
  router.events?.on("routeChangeStart", handleRouteChange);

  // Push initial history state to trap back button
  window.history.pushState(null, "", window.location.href);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.removeEventListener("popstate", handlePopState);
    router.events?.off("routeChangeStart", handleRouteChange);
  };
}, [isFormModalOpen, router]);




return (
  <ProtectedRoute>
    <Navbar />
  <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">

    {/* Header */}
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="container mx-auto px-4 py-6 sm:py-8">

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left */}
          <div className="flex-1">
            <div className="flex items-start sm:items-center gap-4 mb-2 sm:mb-4 flex-col sm:flex-row">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-tight wrap-break-word">
                  Welcome back, <span className="text-[#4E56C0]">{user?.name}</span>!
                </h1>
                <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-tight">
                  Manage your professional profiles and showcase your skills.
                </p>
              </div>

            </div>
          </div>

          {/* Create Profile Button */}
          <button
            onClick={handleCreateProfile}
            className="w-full sm:w-auto  text-base sm:text-lg 
 bg-[#4E56C0] text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> {profiles.length === 0 ? "Add Your first Profile" : "Add New Profile"}
          </button>
        </div>
      </div>
    </div>

    {/* Main Content */}
<div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
        <StatsCard
          title="Total Profiles"
          value={stats.totalProfiles}
          icon={<FileText className="w-6 h-6" />}
          description="All professional profiles"
          className="bg-white/80 backdrop-blur-sm border border-slate-200/60"
        />

        <StatsCard
          title="Recent Activity"
          value={stats.recentProfiles}
          icon={<TrendingUp className="w-6 h-6" />}
          description="Updated this week"
          className="bg-white/80 backdrop-blur-sm border border-slate-200/60"
        />
      </div>
      
      <div className="space-y-8">


            <div className="w-full sm:w-80 md:w-96">
              <SearchBar
                onSearch={handleSearch}
              />
            </div>
            
        <div className="w-full overflow-hidden">
  {isLoading ? (
    <div className="space-y-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border-none rounded">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <ProfileList
      profiles={filteredProfiles}
      onEdit={handleEditProfile}
      onDelete={handleDeleteProfile}
      isLoading={false}
    />
  )}
</div>
      </div>
    </div>

    <ProfileFormModal
      isOpen={isFormModalOpen}
      onClose={handleCloseModal}
      onSave={handleSaveProfile}
      editingProfile={editingProfile}
      isSaving={isSaving}
    />
  </div>
  <Footer/>
  </ProtectedRoute>
);

};

export default Dashboard;