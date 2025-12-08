// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { ExperienceCard, HeaderTag } from "./Cards";

// export default function ExperienceSection({ experiences = [] }) {
//   const scrollRef = useRef(null);
//   const [showArrows, setShowArrows] = useState(false);
//     const [atStart, setAtStart] = useState(true);
//     const [atEnd, setAtEnd] = useState(false);
  
//     const CARD_WIDTH = 300 + 24;
//   const checkOverflow = () => {
//     const el = scrollRef.current;
//     if (!el) return;

//     const hasOverflow = el.scrollWidth > el.clientWidth;
//     setShowArrows(hasOverflow);

//     setAtStart(el.scrollLeft <= 0);
//     setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
//   };

//   useEffect(() => {
//     const frame = requestAnimationFrame(() => {
//       checkOverflow();
//     });

//     window.addEventListener("resize", checkOverflow);

//     return () => {
//       cancelAnimationFrame(frame);
//       window.removeEventListener("resize", checkOverflow);
//     };
//   }, [experiences]);

//   /* ----------------------- SCROLL HANDLERS ----------------------- */
//   const scrollLeft = () => {
//     scrollRef.current?.scrollBy({ left: -CARD_WIDTH, behavior: "smooth" });
//   };

//   const scrollRight = () => {
//     scrollRef.current?.scrollBy({ left: CARD_WIDTH, behavior: "smooth" });
//   };


//   return (
//     <section className="relative w-full overflow-hidden">
//       <div className="mx-auto">
//         <HeaderTag title="Experience" subtitle="Professional Journey" icon={<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />} />

//         {showArrows && (
//           <div className="flex justify-end gap-3 mb-4">
//             {/* LEFT BUTTON */}
//             <button
//               disabled={atStart}
//               onClick={scrollLeft}
//               className={`
//                 p-2 rounded-full transition
//                 ${atStart ? "bg-gray-200 opacity-40" : "bg-gray-200 hover:bg-gray-300"}
//               `}
//             >
//               <ChevronLeft className="w-5 h-5 text-gray-700" />
//             </button>

//             {/* RIGHT BUTTON */}
//             <button
//               disabled={atEnd}
//               onClick={scrollRight}
//               className={`
//                 p-2 rounded-full transition
//                 ${atEnd ? "bg-gray-200 opacity-40" : "bg-gray-200 hover:bg-gray-300"}
//               `}
//             >
//               <ChevronRight className="w-5 h-5 text-gray-700" />
//             </button>
//           </div>
//         )}

//         <div
//           ref={scrollRef}
//           className="
//             flex gap-6 overflow-x-auto
//             snap-x snap-mandatory scrollbar-none pb-4 justify-start
//           "
//         >
//           {experiences.map((exp, i) => {
//             return (
//                 <div
//     key={i}
//     className="snap-center shrink-0 w-72 sm:w-80 md:w-96"
//   >
//               <ExperienceCard
//                 key={i}
//                 experience={exp}
//                 index={i}
//               />
//               </div>
//             );
//           })}
//         </div>

//       </div>
//     </section>
//   );
// }"use client";

import React from "react";
import { ExperienceCard, HeaderTag } from "./Cards";

export default function ExperienceSection({ experiences = [] }) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        <HeaderTag
          title="Experience"
          subtitle="Professional Journey"
          icon={<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
        />

        <div className="mt-16 w-full flex justify-center px-4">
          <div className="max-w-7xl w-full">
            <div className="flex flex-wrap justify-center gap-8">
              {experiences.map((exp, i) => (
                <div
                  key={i}
                  className="
                    w-full
                    sm:w-[calc(50%-1rem)]
                    lg:w-[calc(33.333%-1.334rem)]
                    max-w-sm space-y-10
                  "
                >
                  <ExperienceCard
                    experience={exp}
                    index={i}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}



