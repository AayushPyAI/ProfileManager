// ResumePDF.jsx
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";

// -----------------------
// Helpers
// -----------------------
const safeDate = (d) => {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date)) return null;
  return date;
};

const formatDate = (d) => {
  const sd = safeDate(d);
  if (!sd) return "";
  return sd.toLocaleString("default", { month: "short", year: "numeric" });
};

const dateRange = (start, end) => {
  if (!start) return "";
  const s = formatDate(start);
  if (!end) return `${s} – Present`;
  const e = formatDate(end);
  return `${s} – ${e}`;
};

// -----------------------
// Styles
// -----------------------
const styles = StyleSheet.create({
  page: {
    padding: 18,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111",
    lineHeight: 1.14,
  },

  // Header
  name: { fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 4 },
  role: { fontSize: 12, textAlign: "center", marginBottom: 6 },
  contact: { textAlign: "center", fontSize: 10, marginBottom: 14, color: "#333" },

  // Sections
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 },
  rule: { height: 1, backgroundColor: "#000", marginBottom: 8 },

  // Blocks
  block: { marginBottom: 10 },
  blockHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  blockHeaderLeft: { fontSize: 11, fontWeight: 700 },
  blockHeaderRight: { fontSize: 10, color: "#444" },
  blockSub: { fontSize: 10, fontStyle: "italic", marginBottom: 6 },
  bullet: { fontSize: 10, marginLeft: 8, marginBottom: 2 },

  // Skills
  skillRow: { flexDirection: "row", marginBottom: 2, flexWrap: "wrap" },
  skillCat: { fontSize: 10.5, fontWeight: 700, marginRight: 6 },
  skillList: { fontSize: 10, flexShrink: 1 },

  // Misc
  smallLink: { fontSize: 9, color: "#2563eb", marginBottom: 4 },
  muted: { color: "#666", fontSize: 10 },
});

// -----------------------
// Render helpers per section
// -----------------------
const renderExperience = (experience = []) => {
  if (!Array.isArray(experience) || experience.length === 0) return null;

  return (
    <View style={styles.section} key="experience">
      <Text style={styles.sectionTitle}>Experience</Text>
      <View style={styles.rule} />
      {experience.map((exp, i) => {
        const start = exp?.startDate ?? null;
        const end = exp?.endDate ?? null;
        return (
          <View style={styles.block} key={exp._id || i}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockHeaderLeft}>{exp.company || ""}</Text>
              <Text style={styles.blockHeaderRight}>{dateRange(start, end)}</Text>
            </View>

            <Text style={styles.blockSub}>
              {exp.position || ""}{exp.location ? ` — ${exp.location}` : ""}
            </Text>

            {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
              <Text style={styles.skillList}>
                <Text style={{ fontWeight: 700 }}>Tech: </Text>
                {exp.technologies.join(", ")}
              </Text>
            )}

            {Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0 && exp.responsibilities.map((r, idx) => (
              <Text style={styles.bullet} key={idx}>• {r}</Text>
            ))}
          </View>
        );
      })}
    </View>
  );
};

const renderProjects = (projects = []) => {
  if (!Array.isArray(projects) || projects.length === 0) return null;

  return (
    <View style={styles.section} key="projects">
      <Text style={styles.sectionTitle}>Projects</Text>
      <View style={styles.rule} />
      {projects.map((proj, i) => {
        const start = proj?.startDate ?? null;
        const end = proj?.endDate ?? null;
        return (
          <View style={styles.block} key={proj._id || i}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockHeaderLeft}>{proj.name || ""}</Text>
              <Text style={styles.blockHeaderRight}>{dateRange(start, end)}</Text>
            </View>

            {(proj.link || proj.github) && (
              <View style={{ marginBottom: 4 }}>
                {proj.link && <Link style={styles.smallLink} src={proj.link}>Live</Link>}
                {proj.github && <Link style={styles.smallLink} src={proj.github}>GitHub</Link>}
              </View>
            )}

            {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
              <Text style={styles.skillList}>
                <Text style={{ fontWeight: 700 }}>Tech: </Text>
                {proj.technologies.join(", ")}
              </Text>
            )}

            {proj.description && <Text style={{ fontSize: 10, marginTop: 4 }}>{proj.description}</Text>}
          </View>
        );
      })}
    </View>
  );
};

const renderEducation = (education = []) => {
  if (!Array.isArray(education) || education.length === 0) return null;
  return (
    <View style={styles.section} key="education">
      <Text style={styles.sectionTitle}>Education</Text>
      <View style={styles.rule} />
      {education.map((edu, i) => (
        <View style={styles.block} key={edu._id || i}>
          <View style={styles.blockHeader}>
            <Text style={styles.blockHeaderLeft}>{edu.institution || ""}</Text>
            <Text style={styles.blockHeaderRight}>{dateRange(edu.startDate, edu.endDate)}</Text>
          </View>

          <Text style={styles.blockSub}>{(edu.degree ? edu.degree : "")}{edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ""}</Text>

          {edu.grade && <Text style={styles.muted}>Grade: {edu.grade}</Text>}
          {edu.description && <Text style={{ fontSize: 10, marginTop: 6 }}>{edu.description}</Text>}
        </View>
      ))}
    </View>
  );
};

const renderSkills = (skills = []) => {
  if (!Array.isArray(skills) || skills.length === 0) return null;

  const grouped = skills.reduce((acc, s) => {
    const cat = s.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    if (s.name) acc[cat].push(s.name);
    return acc;
  }, {});

  return (
    <View style={styles.section} key="skills">
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.rule} />
      {Object.entries(grouped).map(([cat, list], i) => (
        <View style={styles.skillRow} key={i}>
          <Text style={styles.skillCat}>{cat}:</Text>
          <Text style={styles.skillList}>{list.join(", ")}</Text>
        </View>
      ))}
    </View>
  );
};

const renderCertifications = (certs = []) => {
  if (!Array.isArray(certs) || certs.length === 0) return null;
  return (
    <View style={styles.section} key="certification">
      <Text style={styles.sectionTitle}>Certifications</Text>
      <View style={styles.rule} />
      {certs.map((c, i) => (
        <View key={c._id || i} style={{ marginBottom: 6 }}>
          <Text style={{ fontSize: 10 }}>
            • {c.name || ""}{c.issuer ? ` — ${c.issuer}` : ""}{c.issueDate ? ` (${formatDate(c.issueDate)})` : ""}
          </Text>
          {c.link && <Link style={styles.smallLink} src={c.link}>{c.link}</Link>}
        </View>
      ))}
    </View>
  );
};

const renderCustomSections = (customSections = []) => {
  if (!Array.isArray(customSections) || customSections.length === 0) return null;

  return (
    <View style={styles.section} key="customSections">
      {customSections.map((sec, sIdx) => {
        // Use label if available, otherwise name
        const title = sec.label || sec.name || "Custom Section";
        const items = Array.isArray(sec.items) ? sec.items : [];
        if (items.length === 0) return null;

        return (
          <View key={sec._id || sIdx} style={{ marginBottom: 10 }}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.rule} />
            {items.map((item, idx) => {
              // If fieldsSchema defined, prefer item.fields.value if present
              const value =
                (item.fields && (item.fields.value ?? item.fields.text ?? item.fields.name)) ||
                (typeof item.fields === "string" ? item.fields : null) ||
                JSON.stringify(item.fields || {}, null, 2);

              return <Text key={idx} style={styles.bullet}>• {value}</Text>;
            })}
          </View>
        );
      })}
    </View>
  );
};

// -----------------------
// Section dispatcher (respects sectionOrder)
// -----------------------
const DEFAULT_ORDER = [
  "personal",
  "experience",
  "projects",
  "education",
  "skills",
  "certification",
  "customSections",
];

const renderSectionByKey = (key, profile) => {
  switch (key) {
    case "personal":
      // Personal is rendered by header; skip here
      return null;
    case "experience":
      return renderExperience(profile.experience);
    case "projects":
      return renderProjects(profile.projects);
    case "education":
      return renderEducation(profile.education);
    case "skills":
      return renderSkills(profile.skills);
    case "certification":
    case "certifications":
      return renderCertifications(profile.certification);
    case "customSections":
      return renderCustomSections(profile.customSections);
    default:
      return null;
  }
};

// -----------------------
// Main component
// -----------------------
export default function ResumePDF({ profile }) {
  if (!profile) return null;

  const personal = profile.personal || {};

  // Choose section order from profile or fallback
  const order = Array.isArray(profile.sectionOrder) && profile.sectionOrder.length > 0
    ? profile.sectionOrder.map(k => {
        // normalize old keys
        if (k === "customFields") return "customSections";
        if (k === "certifications") return "certification";
        return k;
      })
    : DEFAULT_ORDER;

  // Determine last role for header: prefer last experience position, else personal.designation
  const lastRole =
    Array.isArray(profile.experience) && profile.experience.length > 0
      ? profile.experience[profile.experience.length - 1]?.position || personal.designation || ""
      : personal.designation || "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <Text style={styles.name}>{personal.name || ""}</Text>
        <Text style={styles.role}>{lastRole}</Text>

        <Text style={styles.contact}>
          {personal.phone ? `${personal.phone} | ` : ""}
          {personal.email ? `${personal.email} | ` : ""}
          {personal.github ? `${personal.github} | ` : ""}
          {personal.linkedin ? personal.linkedin : ""}
        </Text>

        {/* Render sections in the requested order */}
        {/* Personal summary (if present) - ensure it's printed first if included in order */}
        {order.includes("personal") && personal.bio && (
          <View style={styles.section} key="personal">
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.rule} />
            <Text style={{ fontSize: 10 }}>{personal.bio}</Text>
          </View>
        )}

        {/* Loop through order and render relevant sections */}
        {order.map((key) => renderSectionByKey(key, profile))}

        {/* If sectionOrder didn't include some sections, render any missing ones in default order */}
        {DEFAULT_ORDER.filter(k => !order.includes(k)).map((key) => renderSectionByKey(key, profile))}
      </Page>
    </Document>
  );
}
