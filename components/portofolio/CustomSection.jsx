import { HeaderTag } from "./Cards";

export default function CustomSection({ section, className = "", compact = false }) {
  
  if (!section || !section.items || !section.items.length) return null;

  const isUrl = (v) => typeof v === "string" && v.startsWith("http");
  const isMultiline = (v) =>
    typeof v === "string" && v.trim().includes("\n");
  const isList = (v) =>
    Array.isArray(v) || (typeof v === "string" && v.includes(","));
  const toList = (v) =>
    Array.isArray(v)
      ? v
      : v
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean);

  const normalize = (v) => {
    if (v == null) return "";
    if (Array.isArray(v)) return v;
    if (typeof v === "object") return v;
    return String(v);
  };

  const formatKey = (k) =>
    String(k)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (s) => s.toUpperCase());

  /* ---------------------------
     THEME DETECTOR ENGINE
  ----------------------------*/
  const detectTheme = (item) => {
    const fields = Object.keys(item.fields || {});
    const values = Object.values(item.fields || {})
      .map((v) => (typeof v === "string" ? v : ""))
      .join(" ");
    const str = (fields.join(" ") + " " + values).toLowerCase();

    if (
      str.includes("start") ||
      str.includes("end") ||
      str.includes("company") ||
      str.includes("role") ||
      str.includes("position") ||
      str.includes("title")
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

    if (
      Object.values(item.fields || {}).some((v) => isMultiline(typeof v === "object" ? "" : v))
    ) {
      return "about";
    }

    return "generic";
  };


  const outerPadding = compact ? "px-4 py-6" : "px-8 py-10";
  
  return (
    <section className={`w-full mb-20 ${className}`}>
      {/* <h2 className={`text-center ${titleSize} font-extrabold tracking-tight text-gray-900 mb-8`}>
        {section.label}
      </h2> */}
      <HeaderTag title={section.label} subtitle="" icon=""/> 

      <div className="space-y-6 text-white">
        {section.items
          ?.sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((item, idx) => {
            const theme = detectTheme(item);
            const keyBase = item.id || item._id || `item-${idx}`;

            return (
              <div
                key={keyBase}
                className={`
                  rounded-2xl border mx-10 transition ${outerPadding}
                `}
              >
                <div>
                  {Object.entries(item.fields || {}).length === 0 && (
                    <div className="col-span-1 text-sm text-gray-500 italic">
                      No fields available
                    </div>
                  )}

                  {Object.entries(item.fields || {}).map(([key, rawValue]) => {
                    const value = normalize(rawValue);

                    // If nested object, render its entries
                    if (value && typeof value === "object" && !Array.isArray(value)) {
                      return (
                        <div key={`${keyBase}-${key}`} className="col-span-1 flex flex-col gap-2">
                          <div className={`font-medium leading-relaxed`}>
                            {Object.entries(value).map(([k2, v2]) => {
                              const nv = normalize(v2);
                              if (Array.isArray(nv)) {
                                return (
                                  <div key={k2} className="mb-2">
                                    <div className="text-sm font-semibold">{formatKey(k2)}</div>
                                    <ul className="list-disc pl-5 space-y-1">
                                      {nv.map((li, i) => (
                                        <li key={i}>{String(li)}</li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              }

                              if (isUrl(nv)) {
                                return (
                                  <div key={k2}>
                                    <a href={nv} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                                      {nv}
                                    </a>
                                  </div>
                                );
                              }

                              if (isMultiline(nv)) {
                                return <p key={k2} className="whitespace-pre-line">{String(nv)}</p>;
                              }

                              return (
                                <div key={k2} className="text-sm">
                                  <span className="font-semibold">{formatKey(k2)}: </span>
                                  <span>{String(nv)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    // Array handling
                    if (Array.isArray(value)) {
                      // arrays of primitives
                      const isObjects = value.some((v) => typeof v === "object");
                      if (isObjects) {
                        return (
                          <div key={`${keyBase}-${key}`} className="col-span-1 flex flex-col gap-2">
                            <div className={`font-medium leading-relaxed`}>
                              {value.map((v, i) => (
                                <div key={i} className="mb-3 p-3 rounded-lg bg-white/50 border">
                                  {Object.entries(v).map(([k2, v2]) => (
                                    <div key={k2} className="text-sm">
                                      <span className="font-semibold">{formatKey(k2)}: </span>
                                      <span>{String(v2)}</span>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={`${keyBase}-${key}`} className="col-span-1 flex flex-col gap-2">
                          <div className={`font-medium leading-relaxed`}>
                            <ul className="list-disc pl-5 space-y-1">
                              {value.map((li, i) => (
                                <li key={i}>{String(li)}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    }

                    // Primitives: string/number/boolean
                    const v = value;
                    return (
                      <div key={`${keyBase}-${key}`} className="col-span-1 flex flex-col gap-2">
                        <div className={`font-medium leading-relaxed`}>
                          {isUrl(v) && (
                            <a href={v} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                              {v}
                            </a>
                          )}

                          {!isUrl(v) && isList(v) && (
                            <ul className="list-disc pl-5 space-y-1">
                              {toList(v).map((li, i) => (
                                <li key={i}>{li}</li>
                              ))}
                            </ul>
                          )}

                          {!isUrl(v) && !isList(v) && isMultiline(v) && (
                            <p className="whitespace-pre-line">{v}</p>
                          )}

                          {!isUrl(v) && !isList(v) && !isMultiline(v) && <span>{String(v)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
