"use client";

import { Code } from "lucide-react";
import { HeaderTag, ProjectCard } from "./Cards";

export default function ProjectsSection({ projects = [] }) {
  return (
    <section className="relative px-6">
      <div className="mx-auto">
        <HeaderTag title="Projects" subtitle="Project Portfolio" icon={<Code className="w-4 h-4 text-emerald-600" />}/> 

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 pb-4">
          {projects.map((p, i) => (
            <div key={i} className="w-full">
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// function ProjectCard({ project }) {
//   const formatDate = (d) =>
//     d
//       ? new Date(d).toLocaleDateString("en-US", {
//           month: "short",
//           year: "numeric",
//         })
//       : "—";

//   // Parse technologies string into array
//   const parseTechnologies = (techString) => {
//     if (!techString) return [];
//     if (Array.isArray(techString)) return techString;
//     return techString.split(',').map(t => t.trim()).filter(t => t);
//   };

//   const technologies = parseTechnologies(project.technologies);

//   return (
//     <div
//       className="
//         bg-white border border-gray-200 rounded-2xl shadow-sm
//         hover:shadow-xl hover:-translate-y-1 transition-all
//         p-6 flex flex-col h-full w-[300px]   /* FIXED SIZE */
//       "
//     >
//       {/* TITLE ROW */}
//       <div className="flex justify-between items-start mb-4">
//         <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
//           {project.name}
//         </h3>

//         <span
//           className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap
//             ${
//               project.endDate
//                 ? "bg-green-100 text-green-700 border border-green-200"
//                 : "bg-orange-50 text-orange-700 border border-orange-200"
//             }
//           `}
//         >
//           {project.endDate ? "Completed" : "Active"}
//         </span>
//       </div>

//       {/* DATES */}
//       <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
//         <Calendar className="w-4 h-4" />

//         {project.endDate
//           ? `${formatDate(project.startDate)} - ${formatDate(project.endDate)}`
//           : `Started ${formatDate(project.startDate)}`}
//       </div>

//       {/* DESCRIPTION */}
//       <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4">
//         {project.description}
//       </p>

//       {/* TECH STACK */}
//       {technologies.length > 0 && (
//         <div className="flex flex-wrap gap-2 mb-5">
//           {technologies.slice(0, 5).map((tech, i) => (
//             <span
//               key={i}
//               className="px-3 py-1 text-xs rounded-lg bg-gray-100 border text-gray-700 font-medium"
//             >
//               {tech}
//             </span>
//           ))}

//           {technologies.length > 5 && (
//             <span className="px-3 py-1 text-xs rounded-lg bg-gray-50 border text-gray-500">
//               +{technologies.length - 5}
//             </span>
//           )}
//         </div>
//       )}

//       {/* ACTION BUTTONS */}
//       <div className="flex gap-3 mt-auto pt-4 border-t">
//         {project.link && (
//           <a
//             href={project.link}
//             target="_blank"
//             className="
//               flex-1 flex items-center justify-center gap-2 px-4 py-2
//               bg-emerald-500 text-white rounded-xl text-sm font-semibold
//               hover:bg-emerald-600 transition-all
//             "
//           >
//             <Play className="w-4 h-4" />
//             Live 
//           </a>
//         )}

//         {project.github && (
//           <a
//             href={project.github}
//             target="_blank"
//             className="
//               px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black
//               flex items-center justify-center transition-all
//             "
//           >
//             <Github className="w-4 h-4" />
//           </a>
//         )}
//       </div>
//     </div>
//   );
// }
