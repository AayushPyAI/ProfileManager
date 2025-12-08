"use client";

import { Award, Calendar, ExternalLink, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HeaderTag } from "./Cards";

export default function CertificationsSection({ certifications }) {
  const scrollRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false);

  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Check if scrolling is needed
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const isScrollable = el.scrollWidth > el.clientWidth;
    setShowArrows(isScrollable);

    const handleResize = () => {
      setShowArrows(el.scrollWidth > el.clientWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [certifications]);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
  };

  return (
    <section className="w-full">
      <div className="px-6">

        {/* HEADER */}
        {/* <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white shadow-sm border rounded-xl">
            <Award className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-700">
              Verified Credentials
            </span>
          </div>

          <h2 className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Certifications
          </h2>
        </div> */}
        <HeaderTag icon={<Award className="w-5 h-5"/>}
               title="Certifications"
              subtitle="Verified Credentials"/>

        {/* NAVIGATION BUTTONS */}
        {showArrows && (
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={scrollRight}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}

        {/* SCROLLABLE CARDS */}
        <div
          ref={scrollRef}
          className="
            flex gap-6 overflow-x-auto scrollbar-none
            snap-x snap-mandatory pb-4 justify-center
          "
        >
          {certifications.map((cert) => (
            <div key={cert._id} className="snap-center w-[300px] flex-shrink-0">
              <CertificationCard cert={cert} formatDate={formatDate} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}


function CertificationCard({ cert, formatDate }) {
  return (
    <div
      className="
        bg-blur
        dark:bg-slate-900/40 dark:border-slate-700
        rounded-2xl
        p-8
        border-[0.5px]
        transition-all
        flex flex-col
        h-full
        min-h-[340px] 
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div
          className="
            w-14 h-14 rounded-xl
            bg-[#00ADB5]
            flex items-center justify-center text-white shadow-md
            shrink-0
          "
        >
          <Award className="w-7 h-7" />
        </div>

        <span
          className="
            text-xs font-semibold px-3 py-1 rounded-full
            bg-indigo-50 border border-indigo-200 text-[#00ADB5]
            max-w-[120px]
            truncate
          "
        >
          {cert.issuer}
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex-1">
        {/* TITLE with clamp */}
        <h3
          className="
            text-xl font-bold text-[#00ADB5] leading-snug mb-3
            line-clamp-2
            min-h-12 
          "
        >
          {cert.name}
        </h3>

        {/* DETAILS */}
        <div className="space-y-2 text-sm text-white">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white" />
            <span>Issued {formatDate(cert.issueDate)}</span>
          </div>
        </div>
      </div>

      {/* FOOTER (always fixed position) */}
      <div className="mt-6 pt-4 border-t border-[#e2ddd0]">
        {cert.link ? (
          <a
            href={cert.link}
            target="_blank"
            className="
              flex justify-center items-center gap-2
              px-4 py-2 rounded-xl
              bg-[#00ADB5] text-white font-semibold text-sm
              hover:bg-[#393E46]  hover:text-[#00ADB5] hover:border-[#00ADB5] hover:border transition
              text-center
              w-full
            "
          >
            Verify Certificate
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : (
          <p className="text-center text-white text-sm">
            Verified Credential
          </p>
        )}
      </div>
    </div>
  );
}