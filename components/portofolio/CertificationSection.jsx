"use client";

import { Award, Calendar, ExternalLink, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { HeaderTag } from "./Cards";

export default function CertificationsSection({ certifications }) {
  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="w-full">
      <div className="px-6">
        <HeaderTag icon={<Award className="w-5 h-5"/>}
               title="Certifications"
              subtitle="Verified Credentials"/>

       <div className="mt-16 w-full flex justify-center px-4">
        <div className="max-w-7xl w-full">
        <div className="flex flex-wrap justify-center gap-8">
          {certifications.map((cert) => (
            <div key={cert._id}    className="
                    w-full
                    sm:w-[calc(50%-1rem)]
                    lg:w-[calc(33.333%-1.334rem)]
                    max-w-sm space-y-10
                  ">
              <CertificationCard cert={cert} formatDate={formatDate} />
            </div>
          ))}
        </div>
        </div>
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
            text-xs font-semibold px-3 py-2 rounded-full
            bg-indigo-50  text-[#00ADB5]
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