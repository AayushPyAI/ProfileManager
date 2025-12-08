import React, { useState } from 'react';
import { 
  Feather,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EducationCard, HeaderTag } from "./Cards";

export default function EducationSection({ education = [] }) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        <HeaderTag
          title="Education"
          icon={<Feather />}
          subtitle="My Educational Journey"
        />

        <div className="relative">
          {/* {education.length > 2 && (
            <>
              <button
                onClick={scrollLeft}
                className="hidden lg:flex absolute -left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 group"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
              </button>
              
              <button
                onClick={scrollRight}
                className="hidden lg:flex absolute -right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 group"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
              </button>
            </>
          )} */}
          {/* <div className="lg:hidden flex justify-center gap-2 mb-6">
            {education.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  Math.floor(scrollPosition / 300) === idx 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div> */}
          {/* <div 
            ref={containerRef}
            className="flex gap-6 md:gap-8 overflow-x-auto pb-8 md:pb-12 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-4"
            onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
          >
            {education.map((edu, i) => (
              <div 
                key={i}
                className="shrink-0 w-[85vw] md:w-[45vw] lg:w-[38vw] xl:w-[32vw] snap-center"
              >
                <EducationCard
                  education={edu}
                  index={i}
                />
              </div>
            ))}
          </div> */}
      <div className="mt-16 w-full flex justify-center px-4">
        <div className="max-w-7xl w-full">
          <div className="flex flex-wrap justify-center gap-8">
            {education.map((edu, i) => (
              <div 
                key={i}
                className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)] max-w-sm space-y-10"
              >
                <EducationCard education={edu} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>

        </div>
      </div>
    </section>
  );
}
