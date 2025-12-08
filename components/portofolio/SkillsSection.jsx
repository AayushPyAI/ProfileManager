"use client";

import { Settings, Code, Cpu, Database, Cloud, Wrench, Layers, Terminal, Puzzle, Star, StarIcon } from "lucide-react";
import { HeaderTag, SkillsCard } from "./Cards";

export default function SkillsSection({ skills }) {
  const getCategoryIcon = (header) => {
    const normalizedHeader = header?.toLowerCase() || '';
    if (normalizedHeader.includes('frontend')) return Code;
    if (normalizedHeader.includes('backend')) return Cpu;
    if (normalizedHeader.includes('database')) return Database;
    if (normalizedHeader.includes('cloud')) return Cloud;
    if (normalizedHeader.includes('devops')) return Wrench;
    if (normalizedHeader.includes('mobile')) return Layers;
    if (normalizedHeader.includes('programming')) return Terminal;
    if (normalizedHeader.includes('design')) return Puzzle;
    if (normalizedHeader.includes('tools')) return Wrench;
    return Star;
  };

  // Parse skills string into array
  const parseSkills = (skillsString) => {
    if (!skillsString) return [];
    return skillsString.split(',').map(s => s.trim()).filter(s => s);
  };

  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <section className="relative px-6">
      <div className="absolute inset-0"/>
      <div className="relative max-w-7xl mx-auto z-10">

        {/* HEADER */}
        {/* <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white shadow-sm border rounded-xl">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-700">
              Skills Archive
            </span>
          </div>

          <h2 className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Skills
          </h2>
        </div> */}
        <HeaderTag icon={<StarIcon/>}
                    title=" My Skills"
                    subtitle="Skills Archive"/>

        {/* SKILLS GRID - use SkillsCard for each group */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skillGroup, idx) => {
            const Icon = getCategoryIcon(skillGroup.header);
            const skillsList = Array.isArray(skillGroup.skills)
              ? skillGroup.skills
              : parseSkills(skillGroup.skills);

            return (
              <div key={idx}>
                <SkillsCard
                  skills={skillsList}
                  title={skillGroup.header || 'Skills'}
                  subtitle={skillGroup.description}
                  Icon={Icon}
                  accent={skillGroup.accent || 'teal'}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
