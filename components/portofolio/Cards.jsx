import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  GraduationCap,
  Calendar,
  Briefcase,
  Link as LinkIcon,
  Award,
  Code,
  Star,
  ExternalLink,
  Github
} from "lucide-react";



/* DATE FORMATTER */
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : null;

/* RESPONSIVE, CLEAN, HIGH-CONTRAST BASE CARD */
export function BaseCard({
  icon,
  title,
  subtitle,
  tag,
  children,
  footer,
  className = "",
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className={`
        relative rounded-3xl p-6 backdrop-blur-xl
        bg-blur
        border shadow-[0_8px_30px_rgba(0,0,0,0.08)]
        dark:bg-slate-900/40 dark:border-slate-700
        ${className}
      `}
    >
      {/* HEADER */}
      <div className="flex items-start gap-5">
        <div
          className="
            w-14 h-14 rounded-2xl flex items-center justify-center
            bg-[#00ADB5] text-white shadow-md 
          "
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3
              className="
                text-xl font-serif font-bold tracking-tight 
                text-[#00ADB5] truncate
              "
            >
              {title}
            </h3>

            {tag && (
              <span
                className="
                  ml-auto text-xs px-3 py-1 rounded-full 
                  bg-white/90 dark:bg-white/10 
                  text-slate-700 dark:text-slate-300 
                  font-semibold
                "
              >
                {tag}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-xs mt-1 text-slate-600 dark:text-slate-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className="mt-5 text-sm text-slate-800 dark:text-slate-300 leading-relaxed">
          {children}
        </div>
      )}

      {/* FOOTER */}
      {footer && <div className="mt-6">{footer}</div>}
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */
/* PROJECT CARD – AUTO DATE RANGE BASED ON JSON */
/* -------------------------------------------------------------------------- */

export function ProjectCard({ project }) {
  const [open, setOpen] = useState(false);

  const desc = project.description || "";
  const TRUNC = 160;
  const short = desc.slice(0, TRUNC) + (desc.length > TRUNC ? "..." : "");

  /* Auto-generate date subtitle ONLY if startDate exists */
  const start = project.startDate ? formatDate(project.startDate) : null;
  const end =
    project.startDate
      ? project.endDate
        ? formatDate(project.endDate)
        : "Present"
      : "";

  const finalSubtitle = start ? `${start} — ${end}` : "";

  /* Tech parsing */
  const tech = Array.isArray(project.technologies)
    ? project.technologies
    : (project.technologies || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

  const footer = (
    <div className="flex flex-wrap gap-3">
      {project.link && (
        <a
          href={project.link}
          target="_blank"
          className="px-4 py-2 rounded-xl bg-[#00ADB5] text-white text-sm font-semibold hover:bg-transparent hover:border-[#00ADB5] hover:border hover:text-[#00ADB5]"
        >
          Live Demo
        </a>
      )}

      {project.github && (
        <a
          href={project.github}
          target="_blank"
          className="
            px-4 py-2 rounded-xl bg-white border text-slate-700 
            text-sm font-semibold 
            dark:bg-slate-800 dark:border-slate-700 dark:text-white
            hover:bg-[#00ADB5] align-center
          "
        >
         <Github className="inline w-4 h-4"/> GitHub
        </a>
      )}
    </div>
  );

  return (
    <BaseCard
      icon={<Code className="w-6 h-6" />}
      title={project.name}
      subtitle={finalSubtitle}
      footer={footer}
    >
      <div>
        <AnimatePresence initial={false}>
          <motion.p
            key={open ? "open" : "closed"}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {open ? desc : short}
          </motion.p>
        </AnimatePresence>

        {desc.length > TRUNC && (
          <button
            onClick={() => setOpen(!open)}
            className="
              mt-3 text-[#00ADB5] 
              font-semibold text-sm hover:underline
            "
          >
            {open ? "Show less" : "Read more"}
          </button>
        )}

        {tech.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tech.map((t, i) => (
              <span
                key={i}
                className="
                  text-xs px-3 py-1 rounded-full 
                  bg-blur border text-white hover:bg-[#00ADB5]                "
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </BaseCard>
  );
}


/* -------------------------------------------------------------------------- */
/* SKILLS CARD – PARSE skills STRING INTO ARRAY */
/* -------------------------------------------------------------------------- */

export function SkillsCard({
  title,
  skills = [],
  Icon = Star,
  maxVisible = 8,     // You can configure how many to show initially
}) {
  const [expanded, setExpanded] = useState(false);

  const skillArray = Array.isArray(skills)
    ? skills
    : skills.split(",").map(x => x.trim()).filter(Boolean);

  const visibleSkills = expanded
    ? skillArray
    : skillArray.slice(0, maxVisible);

  const hasMore = skillArray.length > maxVisible;

  return (
    <BaseCard
      icon={<Icon className="w-6 h-6" />}
      title={title}
      subtitle={`${skillArray.length} skills`}
      accent="rose"
      className="
        min-h-[260px]   /* Control card height */
        max-h-[320px]   /* Ensure consistent grid layout */
        overflow-hidden
      "
    >
      <div className="flex flex-wrap gap-2">
        {visibleSkills.map((s, i) => (
          <span
            key={i}
            className="
              px-3 py-1 rounded-full 
              bg-blur border 
              hover:bg-[#00ADB5] 
              text-white text-xs
            "
          >
            {s}
          </span>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="
            mt-3 text-xs font-semibold 
            text-[#00ADB5] hover:text-white
          "
        >
          {expanded ? "Show less" : `Show more`}
        </button>
      )}
    </BaseCard>
  );
}



export function EducationCard({ education }) {
  const [open, setOpen] = useState(false);
  const long = education?.description?.length > 160;

  const start = formatDate(education.startDate);
  const end = education.endDate ? formatDate(education.endDate) : "Present";

  return (
    <BaseCard
      icon={<GraduationCap className="w-6 h-6" />}
      title={education.institution}
      subtitle={`${education.degree} • ${education.fieldOfStudy}`}
      accent="indigo"
    >
      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span>
          {start} — {end}
        </span>
      </div>

      <div className="mt-3">
        <AnimatePresence initial={false}>
          <motion.p
            key={open ? "open" : "closed"}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed"
          >
            {open
              ? education.description
              : (education.description?.slice(0, 160) || "") +
                (long ? "..." : "")}
          </motion.p>
        </AnimatePresence>

        {long && (
          <button
            onClick={() => setOpen(!open)}
            className="
              mt-3 inline-flex items-center gap-2 
              text-sm text-[#00ADB5] font-semibold
            "
          >
            {open ? (
              <>
                <ChevronUp className="w-4 h-4" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Read more
              </>
            )}
          </button>
        )}
      </div>
    </BaseCard>
  );
}

export function ExperienceCard({ experience }) {
  const [open, setOpen] = useState(false);

  const start = formatDate(experience.startDate);
  const end = experience.endDate ? formatDate(experience.endDate) : "Present";

  const tech =
    typeof experience.technologies === "string"
      ? experience.technologies.split(",").map((x) => x.trim())
      : experience.technologies || [];
  
  const desc = experience.description || "";
   const TRUNC = 160;
  const short = desc.slice(0, TRUNC) + (desc.length > TRUNC ? "..." : "");

  return (
    <BaseCard
      icon={<Briefcase className="w-6 h-6" />}
      title={experience.position}
      subtitle={`${experience.company} • ${start} — ${end}`}
      accent="teal"
    >
       <AnimatePresence initial={false}>
          <motion.p
            key={open ? "open" : "closed"}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {open ? desc : short}
          </motion.p>
        </AnimatePresence>
       {desc.length > TRUNC && (
          <button
            onClick={() => setOpen(!open)}
            className="
              mt-3 text-[#00ADB5] 
              font-semibold text-sm hover:underline
            "
          >
            {open ? "Show less" : "Read more"}
          </button>
        )}

      {tech.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tech.map((t, i) => (
            <span
              key={i}
              className="
                px-3 py-1 rounded-full text-xs 
                bg-blur border text-white    hover:bg-[#00ADB5]"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </BaseCard>
  );
}

export function HeaderTag({ icon, title, subtitle }) {
  return (
    <div className="text-center mb-12">
      <div
        className="
          inline-flex items-center gap-1 px-5 py-2.5 rounded-xl 
          bg-blur hover:bg-[#393E46] shadow-sm hover:text-[#00ADB5] text-white
        "
      >
        {icon}
        <span className="text-sm font-semibold tracking-wide">
          {subtitle}
        </span>
      </div>

      <h2
        className="
          mt-5 text-4xl md:text-5xl font-serif font-bold 
          tracking-tight text-white hover:text-[#00ADB5]
        "
      >
        {title}
      </h2>
    </div>
  );
}
