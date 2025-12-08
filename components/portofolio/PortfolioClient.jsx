'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, X, Sparkles} from 'lucide-react';
import Image from 'next/image';

import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import ProjectsSection from './ProjectSection';
import SkillsSection from './SkillsSection';
import CertificationsSection from './CertificationSection';
import ProfileHeader from './ProfileHeader';
import CustomSection from './CustomSection';

import BackgroundImage from '@/public/Projects Page.png';
import ContactPage from './contactPage';
export default function PortfolioClient({ profile }) {
  // const [profile, setProfile] = useState(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  /* -----------------------------
     FETCH PROFILE
  ------------------------------*/
  // const loadProfile = useCallback(async () => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);

  //     const res = await fetch(`/api/profile/get`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ profileId }),
  //       cache: 'no-store',
  //     });

  //     if (!res.ok) throw new Error('Failed to load profile');
  //     const data = await res.json();

  //     await new Promise((resolve) => setTimeout(resolve, 120));

  //     setProfile(data?.profile || null);
  //   } catch (err) {
  //     setError(err.message || 'Error loading profile');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [profileId]);

  // useEffect(() => {
  //   loadProfile();
  // }, [loadProfile]);

  /* -----------------------------
     SCROLL PROGRESS
  ------------------------------*/
  useEffect(() => {
    const handleScroll = () => {
      const top = window.scrollY;
      const height =
        document.documentElement.scrollHeight - window.innerHeight;

      setScrollProgress(height > 0 ? (top / height) * 100 : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* -----------------------------
     NORMALIZE KEYS
  ------------------------------*/
  const normalize = (key) => {
    if (key === 'customFields') return 'customSections';
    if (key === 'certifications') return 'certification';
    return key;
  };

  const getOrderedSections = () => {
    const order = profile.sectionOrder ?? [];
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

    const leftovers = allKeys.filter((key) => !normalized.includes(key));
    return [...normalized, ...leftovers];
  };

  /* -----------------------------
     LOADING UI
  ------------------------------*/
  // if (isLoading)
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
  //       <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-full animate-pulse flex items-center justify-center">
  //         <Sparkles className="w-7 h-7 text-white animate-spin" />
  //       </div>
  //     </div>
  //   );

  // if (!profile || error)
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
  //       <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mb-4">
  //         <X className="w-8 h-8 text-white" />
  //       </div>
  //       <h1 className="text-2xl font-bold mb-2">Portfolio Unavailable</h1>
  //       <p className="text-gray-600">{error || 'Profile not found'}</p>
  //     </div>
  //   );

  const orderedSections = getOrderedSections();

  /* -----------------------------
     SECTION VISIBILITY CHECK
  ------------------------------*/
  const has = {
    personal: Boolean(profile.personal),
    education: profile.education?.length > 0,
    experience: profile.experience?.length > 0,
    projects: profile.projects?.length > 0,
    skills: profile.skills?.length > 0,
    certification: profile.certification?.length > 0,
    customSections: profile.customSections?.length > 0,
  };

  const sectionMap = {
    personal: has.personal ? (
      <ProfileHeader profile={profile.personal} />
    ) : null,

    education: has.education ? (
      <EducationSection education={profile.education} />
    ) : null,

    experience: has.experience ? (
      <ExperienceSection experiences={profile.experience} />
    ) : null,

    projects: has.projects ? (
      <ProjectsSection projects={profile.projects} />
    ) : null,

    skills: has.skills ? (
      <SkillsSection skills={profile.skills} />
    ) : null,

    certification: has.certification ? (
      <CertificationsSection certifications={profile.certification} />
    ) : null,

    customSections: has.customSections ? (
      <div className="space-y-12">
        {profile.customSections.map((sec) => (
          <CustomSection key={sec._id} section={sec} />
        ))}
      </div>
    ) : null,
  };

  const rawSections = orderedSections.map((key) => sectionMap[key]).filter(Boolean);

  /* -----------------------------
     ANIMATION + BACKGROUND LOGIC
     Alternate backgrounds starting from section 1 (index 1)
  ------------------------------*/
const renderSection = (section, index) => {
  const showBg = index % 2 === 1;

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative py-10 overflow-hidden"
    >
      {showBg && (
        <div className="absolute inset-0 w-full h-full -z-10 group">
          {/* Animated gradient overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 animate-fade-in"
            style={{
              animation: 'gradient-shift 8s ease infinite'
            }}
          ></div>
          
          {/* Background image with animations */}
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
              priority
              placeholder="empty"
              quality={100}
              className="object-cover object-center"
              style={{
                animation: 'subtle-zoom 20s ease-in-out infinite alternate'
              }}
            />
          </motion.div>

          {/* Animated overlay particles */}
          <div 
            className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full blur-sm"
            style={{
              animation: 'float-particle 6s ease-in-out infinite'
            }}
          ></div>
          <div 
            className="absolute top-1/3 right-20 w-3 h-3 bg-white/15 rounded-full blur-sm"
            style={{
              animation: 'float-particle 7s ease-in-out infinite 1s'
            }}
          ></div>
          <div 
            className="absolute bottom-20 left-1/4 w-2 h-2 bg-white/20 rounded-full blur-sm"
            style={{
              animation: 'float-particle 8s ease-in-out infinite 2s'
            }}
          ></div>

          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
            style={{
              animation: 'shimmer 6s ease-in-out infinite'
            }}
          ></div>
        </div>
      )}

      {section}
    </motion.div>
  );
};


  return (
    <div className="relative min-h-screen bg-[#222831]">

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-40">
        <div
          className="h-full bg-linear-to-r from-[#00ADB5] via-purple-500 to-pink-500 transition-all"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* MAIN CONTENT */}
      <main className="relative z-10">
        <div className="relative  overflow-hidden">

          {rawSections.map((section, index) => renderSection(section, index))}
           <ContactPage profile={profile}/>

        </div>
      </main>

      {/* Scroll to Top */}
      {scrollProgress > 10 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="no-print fixed bottom-8 right-8 w-12 h-12 bg-[#00ADB5] text-white rounded-2xl shadow-xl flex items-center justify-center z-50"
        >
          <ChevronDown className="w-5 h-5 rotate-180" />
        </button>
      )}
    </div>
  );
}
