'use client';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, X, Sparkles } from 'lucide-react';
import Image from 'next/image';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import ProjectsSection from './ProjectSection';
import SkillsSection from './SkillsSection';
import CertificationsSection from './CertificationSection';
import ProfileHeader from './profileHeader';
import CustomSection from './CustomSection';
import BackgroundImage from '@/public/Projects Page.png';
import ContactPage from './contactPage';
import { getCachedProfile, saveCachedProfile, isCacheAvailable } from '@/lib/profileCache';

export default function PortfolioClient({ profile: initialProfile }) {
  /* --------------------
     STATE + REFS
  -------------------- */
  const [localProfile, setLocalProfile] = useState(initialProfile);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isLoadingCache, setIsLoadingCache] = useState(false);
  const loadMoreRef = useRef(null);
  const scrollHandlerRef = useRef(null);
  const observerRef = useRef(null);

  /* --------------------
     PURE HELPERS (Memoized)
  -------------------- */
  const normalize = useCallback((key) => {
    if (key === 'customFields') return 'customSections';
    if (key === 'certifications') return 'certification';
    return key;
  }, []);

  /* --------------------
     CACHE HANDLING
  -------------------- */
  // Load from cache only if initial profile is empty
  useEffect(() => {
    if (initialProfile?._id || !isCacheAvailable) return;

    let mounted = true;
    setIsLoadingCache(true);

    const loadFromCache = async () => {
      try {
        // Get from URL params or localStorage for profileId
        const params = new URLSearchParams(window.location.search);
        const profileId = params.get('id') || 
                         localStorage.getItem('lastViewedProfile');
        
        if (!profileId) {
          setIsLoadingCache(false);
          return;
        }

        const cached = await getCachedProfile(profileId);
        if (cached && mounted) {
          setLocalProfile(cached);
        }
      } catch (error) {
        console.warn('Cache load failed:', error);
      } finally {
        if (mounted) {
          setIsLoadingCache(false);
        }
      }
    };

    loadFromCache();

    return () => {
      mounted = false;
    };
  }, [initialProfile?._id]);

  // Save to cache when profile changes
  useEffect(() => {
    if (!localProfile?._id || !isCacheAvailable) return;

    const saveToCache = async () => {
      try {
        // Add timestamp to profile for cache invalidation
        const profileWithTimestamp = {
          ...localProfile,
          cachedAt: Date.now(),
          source: 'cache'
        };
        
        await saveCachedProfile(localProfile._id, profileWithTimestamp);
        
        // Also store in localStorage as fallback
        localStorage.setItem('lastViewedProfile', localProfile._id);
      } catch (error) {
        console.warn('Cache save failed:', error);
      }
    };

    saveToCache();
  }, [localProfile?._id, JSON.stringify(localProfile)]); // Deep compare

  /* --------------------
     SCROLL HANDLING (Optimized)
  -------------------- */
  useEffect(() => {
    scrollHandlerRef.current = () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      
      // Throttle updates
      if (height > 0) {
        setScrollProgress((top / height) * 100);
      }
    };

    // Throttled scroll handler
    const handleScroll = () => {
      if (scrollHandlerRef.current) {
        scrollHandlerRef.current();
      }
    };

    // Use passive scroll listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      scrollHandlerRef.current = null;
    };
  }, []);

  /* --------------------
     INTERSECTION OBSERVER (Optimized)
  -------------------- */
  useEffect(() => {
    if (!loadMoreRef.current || !localProfile) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < rawSections.length) {
          // Load 2 sections at a time for better UX
          setVisibleCount(prev => Math.min(prev + 2, rawSections.length));
        }
      },
      { 
        rootMargin: '300px',
        threshold: 0.1 
      }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [localProfile, visibleCount]); // Only recreate when these change

  /* --------------------
     DERIVED DATA (Memoized)
  -------------------- */
  const orderedSections = useMemo(() => {
    if (!localProfile) return [];
    
    const order = localProfile.sectionOrder ?? [];
    const normalized = order.map(normalize);

    const allKeys = [
      'personal',
      'education',
      'experience',
      'projects',
      'skills',
      'certification',
      'customSections',
    ];

    const leftovers = allKeys.filter(
      (key) => !normalized.includes(key)
    );

    return [...normalized, ...leftovers];
  }, [localProfile, normalize]);

  const has = useMemo(() => ({
    personal: Boolean(localProfile?.personal),
    education: (localProfile?.education?.length ?? 0) > 0,
    experience: (localProfile?.experience?.length ?? 0) > 0,
    projects: (localProfile?.projects?.length ?? 0) > 0,
    skills: (localProfile?.skills?.length ?? 0) > 0,
    certification: (localProfile?.certification?.length ?? 0) > 0,
    customSections: (localProfile?.customSections?.length ?? 0) > 0,
  }), [localProfile]);

  const sectionMap = useMemo(() => ({
    personal: has.personal && (
      <ProfileHeader profile={localProfile.personal} />
    ),
    education: has.education && (
      <EducationSection education={localProfile.education} />
    ),
    experience: has.experience && (
      <ExperienceSection experiences={localProfile.experience} />
    ),
    projects: has.projects && (
      <ProjectsSection projects={localProfile.projects} />
    ),
    skills: has.skills && (
      <SkillsSection skills={localProfile.skills} />
    ),
    certification: has.certification && (
      <CertificationsSection
        certifications={localProfile.certification}
      />
    ),
    customSections: has.customSections && (
      <div className="space-y-12">
        {localProfile.customSections.map((sec) => (
          <CustomSection key={sec._id || sec.title} section={sec} />
        ))}
      </div>
    ),
  }), [localProfile, has]);

  const rawSections = useMemo(() => 
    orderedSections
      .map((key) => sectionMap[key])
      .filter(Boolean),
    [orderedSections, sectionMap]
  );

  const visibleSections = useMemo(() => 
    rawSections.slice(0, visibleCount),
    [rawSections, visibleCount]
  );

  /* --------------------
     RENDER LOGIC
  -------------------- */
  const renderSection = useCallback((section, index) => {
    const showBg = index % 2 === 1;

    return (
      <motion.div
        key={`section-${index}`}
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative py-10 overflow-hidden"
      >
        {showBg && (
          <div className="absolute inset-0 w-full h-full -z-10 group">
            <div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 animate-fade-in"
              style={{
                animation: 'gradient-shift 8s ease infinite'
              }}
            />
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-full h-full"
            >
              <Image
                src={BackgroundImage}
                alt="section background"
                fill
                loading={index > 1 ? "lazy" : "eager"}
                sizes="100vw"
                quality={index > 2 ? 60 : 80} // Lower quality for later sections
                placeholder="blur"
                className="object-cover"
                priority={index <= 1}
              />
            </motion.div>
          </div>
        )}

        {section}
      </motion.div>
    );
  }, []);

  /* --------------------
     LOADING STATE
  -------------------- */
  if (isLoadingCache) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ADB5]"></div>
          <p className="mt-4">Loading cached profile...</p>
        </div>
      </div>
    );
  }

  if (!localProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg">Profile not found</p>
          <p className="text-sm text-gray-400 mt-2">
            {isCacheAvailable ? 'Trying cache...' : 'Cache not available'}
          </p>
        </div>
      </div>
    );
  }

  /* --------------------
     MAIN RENDER
  -------------------- */
  return (
    <div className="relative min-h-screen bg-[#222831]">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-[#00ADB5] to-[#393E46]"
          style={{ width: `${scrollProgress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <main className="relative z-10">
        <div className="relative overflow-hidden">
          {visibleSections.map((section, index) => 
            renderSection(section, index)
          )}

          {/* Load More Trigger */}
          {visibleCount < rawSections.length && (
            <div 
              ref={loadMoreRef} 
              className="h-20 flex items-center justify-center"
            >
              <div className="animate-pulse text-gray-400 flex items-center gap-2">
                <ChevronDown className="w-4 h-4" />
                <span>Scroll for more</span>
              </div>
            </div>
          )}

          {/* Contact Page - Only show when all sections loaded */}
          {visibleCount >= rawSections.length && (
            <ContactPage profile={localProfile} />
          )}
        </div>
      </main>

      {/* Scroll to Top Button */}
      {scrollProgress > 10 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="no-print fixed bottom-8 right-8 w-12 h-12 bg-[#00ADB5] text-white rounded-2xl shadow-xl flex items-center justify-center z-50 hover:bg-[#00c4cc] transition-colors duration-200"
          aria-label="Scroll to top"
        >
          <ChevronDown className="w-5 h-5 rotate-180" />
        </motion.button>
      )}
    </div>
  );
}