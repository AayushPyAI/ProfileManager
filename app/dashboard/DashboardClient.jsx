'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    FileText,
    TrendingUp,
    Plus,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import ProfileList from '@/components/dashboard/ProfileList';
import SearchBar from '@/components/dashboard/Searchbar';
import ProfileFormModal from '@/components/dashboard/ProfileFormModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
const DashboardClient = () => {
    const fetchControllerRef = useRef(null);
    const searchParams = useSearchParams();
    const pageParam = Number(searchParams.get('page') || 1);
    const limitParam = Number(searchParams.get('limit') || 5);

    const router = useRouter();
    const { user, authenticatedFetch } = useUser();
    const [profiles, setProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [isListLoading, setIsListLoading] = useState(false);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    //   const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProfiles, setTotalProfiles] = useState(0);
    const [limit, setLimit] = useState(5);

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [stats, setStats] = useState({
        totalProfiles: 0,
        recentProfiles: 0,
    });

    // Check authentication with proper loading state
    // useEffect(() => {
    //   if (user === null) {
    //     setIsCheckingAuth(true);
    //   } else if (user === undefined || !user._id) {
    //     router.push('/');
    //   } else {
    //     setIsCheckingAuth(false);
    //   }
    // }, [user, router]);
    const fetchProfiles = useCallback(async (page = pageParam) => {
        if (!user?._id) return;
        fetchControllerRef.current?.abort();
        const controller = new AbortController();
        fetchControllerRef.current = controller;

        try {
            setIsListLoading(true);

            const response = await authenticatedFetch(
                `/api/user/profiles?page=${page}&limit=${limitParam}`,
                { signal: controller.signal }
            );

            if (!response.ok) throw new Error('Fetch failed');

            const data = await response.json();
            const userProfiles = data.profiles || [];

            setProfiles(userProfiles);
            setFilteredProfiles(userProfiles);
            setCurrentPage(data.page || page);
            setTotalPages(data.pages || 1);
            setTotalProfiles(data.total || 0);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err);
            }
        } finally {
            setIsListLoading(false);
        }
    }, [user, authenticatedFetch, pageParam, limitParam]);


    useEffect(() => {
        if (user) {
            fetchProfiles(pageParam);
        }
    }, [fetchProfiles, user]);

    const handleSearch = useCallback(
        async (query) => {
            const q = query.trim();

            // Reset to default list
            if (!q) {
                setFilteredProfiles(profiles);
                return;
            }

            try {
                setIsSearchLoading(true);

                const res = await fetch(
                    `/api/profile/search?name=${encodeURIComponent(q)}&email=${encodeURIComponent(q)}&limit=20`
                );

                if (!res.ok) throw new Error("Search failed");

                const data = await res.json();
                setFilteredProfiles(data.results ?? data);

            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearchLoading(false);
            }
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

    //   useEffect(() => {
    //     if (!isFormModalOpen) return;

    //     const handleBeforeUnload = (e) => {
    //       e.preventDefault();
    //       e.returnValue = ""; 
    //     };
    //           const handlePopState = () => {
    //       const confirmed = confirm("You have unsaved changes. Do you really want to leave?");
    //       if (!confirmed) {
    //         // push user back to same page
    //         window.history.pushState(null, "", window.location.href);
    //       }
    //     };

    //     // 3. Prevent Next.js route changes (App Router)
    //     const handleRouteChange = () => {
    //       const confirmed = confirm("You have unsaved changes. Do you really want to leave?");
    //       if (!confirmed) {
    //         throw "Navigation aborted";
    //       }
    //     };

    //     // Bind listeners
    //     window.addEventListener("beforeunload", handleBeforeUnload);
    //     window.addEventListener("popstate", handlePopState);
    //     router.events?.on("routeChangeStart", handleRouteChange);
    //     window.history.pushState(null, "", window.location.href);

    //     return () => {
    //       window.removeEventListener("beforeunload", handleBeforeUnload);
    //       window.removeEventListener("popstate", handlePopState);
    //       router.events?.off("routeChangeStart", handleRouteChange);
    //     };
    //   }, [isFormModalOpen, router]);

    useEffect(() => {
        if (!isFormModalOpen) return;

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = ""; // required for Chrome
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isFormModalOpen]);

    return (
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
                        title="Recent Profiles"
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
                        {isListLoading ? (
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
                                isListLoading={false}
                            />
                        )}

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-blue-200">
                                <div className="text-sm font-semibold text-gray-700 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-200">
                                    Showing {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalProfiles)} of {totalProfiles} profiles
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => fetchProfiles(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="btn bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 btn-sm gap-2 shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:hover:from-gray-400 disabled:hover:to-gray-500 transform hover:-translate-y-1 transition-all duration-200"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1 flex-wrap justify-center">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => fetchProfiles(pageNum)}
                                                    className={`btn btn-sm min-w-10 font-bold ${currentPage === pageNum
                                                            ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg'
                                                            : 'bg-linear-to-r from-blue-100 to-purple-100 text-gray-700 border border-blue-200 hover:from-blue-200 hover:to-purple-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => fetchProfiles(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="btn bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 btn-sm gap-2 shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:hover:from-gray-400 disabled:hover:to-gray-500 transform hover:-translate-y-1 transition-all duration-200"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
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
    )
}

export default DashboardClient

