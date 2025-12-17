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
  const pdfGeneratedRef = useRef(false);

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

  useEffect(() => {
    if (!loadMoreRef.current || !localProfile) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < rawSections.length) {
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
  }, [localProfile, visibleCount, rawSections.length]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldDownloadPDF = urlParams.get('downloadPDF') === 'true';
    
    if (!shouldDownloadPDF || !localProfile || pdfGeneratedRef.current) {
      return;
    }
    
    if (rawSections.length === 0) {
      return;
    }
    
    pdfGeneratedRef.current = true;
    
    const generatePDF = async () => {
      const loadingIndicator = document.createElement('div');
      loadingIndicator.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#222831;color:#00ADB5;padding:20px;border-radius:10px;z-index:9999;border:2px solid #00ADB5;';
      loadingIndicator.innerHTML = '<div style="text-align:center;"><div style="border:3px solid #00ADB5;border-top:3px solid transparent;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 10px;"></div><p>Generating PDF...</p></div>';
      document.body.appendChild(loadingIndicator);
      
      const style = document.createElement('style');
      style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
      document.head.appendChild(style);
      
      setVisibleCount(rawSections.length);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const checkImagesLoaded = () => {
        const images = document.querySelectorAll('img');
        if (images.length === 0) return true;
        return Array.from(images).every(img => img.complete || img.naturalWidth > 0);
      };

      let attempts = 0;
      while (!checkImagesLoaded() && attempts < 15) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      const elementsToHide = document.querySelectorAll(
        '.no-print, button, [class*="scroll"], [class*="fixed"], [class*="animate-pulse"]'
      );
      const hiddenElements = [];
      elementsToHide.forEach(el => {
        if (el.style.display !== 'none') {
          hiddenElements.push(el);
          el.style.display = 'none';
        }
      });

      const scrollProgressBar = document.querySelector('[class*="fixed top-0"]');
      let progressBarHidden = false;
      if (scrollProgressBar && scrollProgressBar.style.display !== 'none') {
        scrollProgressBar.style.display = 'none';
        progressBarHidden = true;
      }

      const mainContent = document.querySelector('main') || document.body;

      if (!mainContent) {
        hiddenElements.forEach(el => {
          el.style.display = '';
        });
        if (progressBarHidden && scrollProgressBar) {
          scrollProgressBar.style.display = '';
        }
        if (loadingIndicator.parentNode) {
          loadingIndicator.parentNode.removeChild(loadingIndicator);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
        throw new Error('Main content not found');
      }
      
      const convertAllOklchColors = () => {
        const allElements = mainContent.querySelectorAll('*');
        const bodyElement = mainContent;
        
            const convertColor = (colorValue) => {
          if (!colorValue || (!colorValue.includes('oklch') && !colorValue.includes('color('))) {
            return colorValue;
          }
          try {
            const temp = document.createElement('div');
            temp.style.color = colorValue;
            temp.style.position = 'absolute';
            temp.style.visibility = 'hidden';
            temp.style.width = '1px';
            temp.style.height = '1px';
            document.body.appendChild(temp);
            const rgb = window.getComputedStyle(temp).color;
            document.body.removeChild(temp);
            if (rgb && !rgb.includes('oklch') && !rgb.includes('color(') && rgb !== 'rgba(0, 0, 0, 0)') {
              return rgb;
            }
          } catch (e) {
          }
          return '#ffffff';
        };
        
        const convertGradient = (gradientValue) => {
          if (!gradientValue || (!gradientValue.includes('oklch') && !gradientValue.includes('color('))) {
            return gradientValue;
          }
          try {
            return gradientValue.replace(/oklch\([^)]+\)/g, 'rgb(34, 40, 49)').replace(/color\([^)]+\)/g, 'rgb(34, 40, 49)');
          } catch (e) {
            return 'none';
          }
        };
        
        const convertElement = (el) => {
          try {
            const computed = window.getComputedStyle(el);
            const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor'];
            
            colorProps.forEach(prop => {
              const value = computed[prop] || computed.getPropertyValue(prop);
              if (value && (value.includes('oklch') || value.includes('color('))) {
                const rgb = convertColor(value);
                if (rgb) {
                  el.style.setProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), rgb, 'important');
                }
              }
            });
            
            const bgImage = computed.backgroundImage;
            if (bgImage && bgImage !== 'none' && (bgImage.includes('oklch') || bgImage.includes('color('))) {
              try {
                const converted = bgImage.replace(/oklch\([^)]+\)/g, (match) => {
                  const temp = document.createElement('div');
                  temp.style.backgroundColor = match;
                  temp.style.position = 'absolute';
                  temp.style.visibility = 'hidden';
                  document.body.appendChild(temp);
                  const rgb = window.getComputedStyle(temp).backgroundColor;
                  document.body.removeChild(temp);
                  return rgb && !rgb.includes('oklch') ? rgb : 'rgb(34, 40, 49)';
                }).replace(/color\([^)]+\)/g, 'rgb(34, 40, 49)');
                if (converted && converted !== bgImage) {
                  el.style.setProperty('background-image', converted, 'important');
                }
              } catch (e) {
                if (bgImage.includes('oklch') || bgImage.includes('color(')) {
                  el.style.setProperty('background-image', 'none', 'important');
                  el.style.setProperty('background-color', 'rgb(34, 40, 49)', 'important');
                }
              }
            }
          } catch (e) {
          }
        };
        
        convertElement(bodyElement);
        allElements.forEach(convertElement);
      };

      convertAllOklchColors();
      
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const originalOverflow = document.body.style.overflow || '';
      const originalHeight = document.body.style.height || '';
      const originalMainMinHeight = mainContent.style.minHeight || '';
      const originalMainHeight = mainContent.style.height || '';
      
      document.body.style.overflow = 'visible';
      document.body.style.height = 'auto';
      mainContent.style.minHeight = 'auto';
      mainContent.style.height = 'auto';

      const colorFixStyle = document.createElement('style');
      colorFixStyle.id = 'pdf-color-fix';
      colorFixStyle.textContent = `
        [style*="oklch"] {
          color: rgb(255, 255, 255) !important;
        }
        [style*="oklch"][style*="background"] {
          background-color: rgb(34, 40, 49) !important;
        }
      `;
      document.head.appendChild(colorFixStyle);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const processStylesheets = () => {
        try {
          const styleSheets = document.styleSheets;
          for (let i = 0; i < styleSheets.length; i++) {
            try {
              const sheet = styleSheets[i];
              if (sheet.cssRules) {
                for (let j = 0; j < sheet.cssRules.length; j++) {
                  const rule = sheet.cssRules[j];
                  if (rule.style) {
                    const colorProps = ['color', 'backgroundColor', 'background-color', 'borderColor', 'border-color', 'borderTopColor', 'border-top-color', 'borderRightColor', 'border-right-color', 'borderBottomColor', 'border-bottom-color', 'borderLeftColor', 'border-left-color'];
                    
                    colorProps.forEach(prop => {
                      try {
                        const value = rule.style.getPropertyValue(prop) || rule.style[prop];
                        if (value && (value.includes('oklch') || value.includes('color('))) {
                          const temp = document.createElement('div');
                          temp.style.setProperty(prop, value);
                          temp.style.position = 'absolute';
                          temp.style.visibility = 'hidden';
                          document.body.appendChild(temp);
                          const rgb = window.getComputedStyle(temp).getPropertyValue(prop) || window.getComputedStyle(temp)[prop];
                          document.body.removeChild(temp);
                          if (rgb && !rgb.includes('oklch') && !rgb.includes('color(')) {
                            rule.style.setProperty(prop, rgb, 'important');
                          } else {
                            rule.style.setProperty(prop, prop.includes('color') && !prop.includes('background') ? 'rgb(255, 255, 255)' : 'rgb(34, 40, 49)', 'important');
                          }
                        }
                      } catch (e) {
                      }
                    });
                    
                    const bgImage = rule.style.getPropertyValue('background-image') || rule.style.backgroundImage;
                    if (bgImage && bgImage !== 'none' && (bgImage.includes('oklch') || bgImage.includes('color('))) {
                      const converted = bgImage.replace(/oklch\([^)]+\)/g, 'rgb(34, 40, 49)').replace(/color\([^)]+\)/g, 'rgb(34, 40, 49)');
                      if (converted.includes('oklch') || converted.includes('color(')) {
                        rule.style.setProperty('background-image', 'none', 'important');
                        rule.style.setProperty('background-color', 'rgb(34, 40, 49)', 'important');
                      } else {
                        rule.style.setProperty('background-image', converted, 'important');
                      }
                    }
                  }
                }
              }
            } catch (e) {
            }
          }
        } catch (e) {
        }
      };
      
      processStylesheets();
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        
        const pdfPromise = html2pdf().set({
          margin: [5, 5, 5, 5],
          filename: `${localProfile?.personal?.name || 'profile'}_portfolio.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
            backgroundColor: '#222831',
            windowWidth: mainContent.scrollWidth || window.innerWidth,
            windowHeight: mainContent.scrollHeight || window.innerHeight,
            scrollX: 0,
            scrollY: 0,
            allowTaint: false,
            removeContainer: false,
            imageTimeout: 15000,
            onclone: (clonedDoc) => {
              try {
                const allElements = clonedDoc.querySelectorAll('*');
                allElements.forEach(clonedEl => {
                  try {
                    const style = clonedEl.style;
                    if (style.color && (style.color.includes('oklch') || style.color.includes('color('))) {
                      style.color = 'rgb(255, 255, 255)';
                    }
                    if (style.backgroundColor && (style.backgroundColor.includes('oklch') || style.backgroundColor.includes('color('))) {
                      style.backgroundColor = 'rgb(34, 40, 49)';
                    }
                    if (style.borderColor && (style.borderColor.includes('oklch') || style.borderColor.includes('color('))) {
                      style.borderColor = 'rgb(229, 231, 235)';
                    }
                    if (style.backgroundImage && (style.backgroundImage.includes('oklch') || style.backgroundImage.includes('color('))) {
                      const converted = style.backgroundImage.replace(/oklch\([^)]+\)/g, 'rgb(34, 40, 49)').replace(/color\([^)]+\)/g, 'rgb(34, 40, 49)');
                      if (converted.includes('oklch') || converted.includes('color(')) {
                        style.backgroundImage = 'none';
                        style.backgroundColor = 'rgb(34, 40, 49)';
                      } else {
                        style.backgroundImage = converted;
                      }
                    }
                  } catch (e) {
                  }
                });
                
                const styleSheets = clonedDoc.styleSheets;
                for (let i = 0; i < styleSheets.length; i++) {
                  try {
                    const sheet = styleSheets[i];
                    if (sheet.cssRules) {
                      for (let j = 0; j < sheet.cssRules.length; j++) {
                        const rule = sheet.cssRules[j];
                        if (rule.style) {
                          if (rule.style.color && (rule.style.color.includes('oklch') || rule.style.color.includes('color('))) {
                            rule.style.color = 'rgb(255, 255, 255)';
                          }
                          if (rule.style.backgroundColor && (rule.style.backgroundColor.includes('oklch') || rule.style.backgroundColor.includes('color('))) {
                            rule.style.backgroundColor = 'rgb(34, 40, 49)';
                          }
                          if (rule.style.backgroundImage && (rule.style.backgroundImage.includes('oklch') || rule.style.backgroundImage.includes('color('))) {
                            const converted = rule.style.backgroundImage.replace(/oklch\([^)]+\)/g, 'rgb(34, 40, 49)').replace(/color\([^)]+\)/g, 'rgb(34, 40, 49)');
                            if (converted.includes('oklch') || converted.includes('color(')) {
                              rule.style.backgroundImage = 'none';
                              rule.style.backgroundColor = 'rgb(34, 40, 49)';
                            } else {
                              rule.style.backgroundImage = converted;
                            }
                          }
                        }
                      }
                    }
                  } catch (e) {
                  }
                }
              } catch (e) {
              }
            }
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          },
          pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'],
            avoid: ['section', '[class*="card"]', '[class*="Section"]']
          }
        }).from(mainContent);
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('PDF generation timeout after 60 seconds')), 60000);
        });
        
        await Promise.race([pdfPromise.save(), timeoutPromise]);
        
        window.history.replaceState({}, '', window.location.pathname);
      } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF. Please check the console for details.');
        pdfGeneratedRef.current = false;
      } finally {
        if (originalOverflow) {
          document.body.style.overflow = originalOverflow;
        } else {
          document.body.style.removeProperty('overflow');
        }
        if (originalHeight) {
          document.body.style.height = originalHeight;
        } else {
          document.body.style.removeProperty('height');
        }
        if (originalMainMinHeight) {
          mainContent.style.minHeight = originalMainMinHeight;
        } else {
          mainContent.style.removeProperty('min-height');
        }
        if (originalMainHeight) {
          mainContent.style.height = originalMainHeight;
        } else {
          mainContent.style.removeProperty('height');
        }
        
        hiddenElements.forEach(el => {
          el.style.display = '';
        });
        
        if (progressBarHidden && scrollProgressBar) {
          scrollProgressBar.style.display = '';
        }
        
        const colorFix = document.getElementById('pdf-color-fix');
        if (colorFix && colorFix.parentNode) {
          colorFix.parentNode.removeChild(colorFix);
        }
        
        if (loadingIndicator.parentNode) {
          loadingIndicator.parentNode.removeChild(loadingIndicator);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }
    };

    generatePDF();
  }, [localProfile, rawSections]);

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