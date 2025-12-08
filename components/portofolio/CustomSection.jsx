export default function CustomSection({ section }) {
  if (!section) return null;

  const isUrl = (v) => typeof v === "string" && v.startsWith("http");
  const isMultiline = (v) => typeof v === "string" && v.includes("\n");
  const isList = (v) =>
    Array.isArray(v) || (typeof v === "string" && v.includes(","));
  const toList = (v) =>
    Array.isArray(v)
      ? v
      : v.split(",").map((i) => i.trim()).filter(Boolean);

  /* ---------------------------
     THEME DETECTOR ENGINE
  ----------------------------*/
  const detectTheme = (item) => {
    const fields = Object.keys(item.fields || {});
    const str = fields.join(" ").toLowerCase();

    if (
      str.includes("start") ||
      str.includes("end") ||
      str.includes("company") ||
      str.includes("role") ||
      str.includes("position")
    ) {
      return "experience";
    }

    if (
      str.includes("issuer") ||
      str.includes("certificate") ||
      str.includes("credential") ||
      str.includes("verification")
    ) {
      return "certification";
    }

    if (
      str.includes("skills") ||
      str.includes("tools") ||
      str.includes("stack") ||
      str.includes("technology")
    ) {
      return "skills";
    }

    if (Object.values(item.fields || {}).some((v) => isMultiline(v))) {
      return "about";
    }

    return "generic";
  };

  /* ---------------------------
     THEME CLASSES
  ----------------------------*/
  const themeClasses = {
    experience: {
      card:
        "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-blue-100",
      label: "text-blue-700",
      value: "text-blue-900",
    },
    certification: {
      card:
        "bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-300 shadow-amber-100",
      label: "text-amber-700",
      value: "text-gray-900",
    },
    skills: {
      card:
        "bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-300 shadow-purple-100",
      label: "text-purple-700",
      value: "text-gray-900",
    },
    about: {
      card:
        "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-gray-100",
      label: "text-gray-600",
      value: "text-gray-800",
    },
    generic: {
      card:
        "bg-white border-gray-200 shadow-sm",
      label: "text-gray-500",
      value: "text-gray-900",
    },
  };

  return (
    <section className="w-full mb-20">
      {/* Section Title */}
      <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-12">
        {section.label}
      </h2>

      <div className="space-y-12">
        {section.items
          ?.sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((item, idx) => {
            const theme = detectTheme(item);

            return (
              <div
                key={idx}
                className={`
                  rounded-3xl px-8 py-10 border transition
                  ${themeClasses[theme].card}
                `}
              >
                {/* Field Container */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {Object.entries(item.fields || {}).map(([key, value]) => (
                    <div key={key} className="col-span-1 flex flex-col gap-2">
                      <span
                        className={`text-sm font-semibold uppercase tracking-wide ${themeClasses[theme].label}`}
                      >
                        {key.replace(/_/g, " ")}
                      </span>

                      <div
                        className={`font-medium leading-relaxed ${themeClasses[theme].value}`}
                      >
                        {/* URL */}
                        {isUrl(value) && (
                          <a
                            href={value}
                            target="_blank"
                            className="text-blue-600 underline break-all"
                          >
                            {value}
                          </a>
                        )}

                        {/* List */}
                        {isList(value) && !isUrl(value) && (
                          <ul className="list-disc pl-5 space-y-1">
                            {toList(value).map((li, i) => (
                              <li key={i}>{li}</li>
                            ))}
                          </ul>
                        )}

                        {/* Multiline */}
                        {isMultiline(value) && (
                          <p className="whitespace-pre-line">{value}</p>
                        )}

                        {/* Default */}
                        {!isUrl(value) &&
                          !isList(value) &&
                          !isMultiline(value) && <span>{value}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
