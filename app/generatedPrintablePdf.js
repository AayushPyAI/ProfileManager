export const generatePrintableHTML = (profile) => {
  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (e) {
      return 'Present';
    }
  };

  const parseCommaSeparated = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    return str.split(',').map(s => s.trim()).filter(s => s);
  };

  // ============ GENERATE HTML WITH INLINE CSS ============
  const generateHTML = () => {
    const personal = profile.personal || {};
    const education = profile.education || [];
    const experience = profile.experience || [];
    const projects = profile.projects || [];
    const skills = profile.skills || [];
    const certification = profile.certification || [];
    const customSections = profile.customSections || [];
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Function to safely render skills
    const renderSkills = (skillList) => {
      if (!skillList || skillList.length === 0) return '';
      const limitedList = skillList.slice(0, 15);
      
      return limitedList.map(skill => 
        `<span class="skill-tag">${escapeHtml(skill)}</span>`
      ).join('');
    };

    // Function to render custom sections
    const renderCustomSections = (sections) => {
      if (!sections || sections.length === 0) return '';
      
      return sections.map(section => {
        const sectionName = escapeHtml(section.label || section.name || '');
        
        const itemsHtml = (section.items || []).map(item => {
          const fields = item.fields || {};
          const fieldsHtml = Object.entries(fields).map(([key, value]) => {
            const label = escapeHtml(key.replace(/_/g, ' '));
            let valueHtml = '';
            
            if (typeof value === 'string' && value.startsWith('http')) {
              valueHtml = `<a href="${escapeHtml(value)}" target="_blank" class="custom-url">${escapeHtml(value)}</a>`;
            } else if (Array.isArray(value) || (typeof value === 'string' && value.includes(','))) {
              const list = Array.isArray(value) ? value : value.split(',').map(i => i.trim()).filter(Boolean);
              valueHtml = `<ul class="custom-list">${list.map(li => `<li>${escapeHtml(li)}</li>`).join('')}</ul>`;
            } else if (typeof value === 'string' && value.includes('\n')) {
              valueHtml = `<p style="white-space: pre-line;">${escapeHtml(value)}</p>`;
            } else {
              valueHtml = `<span>${escapeHtml(String(value))}</span>`;
            }
            
            return `
              <div class="custom-field">
                <span class="custom-label">${label}</span>
                <div class="custom-value">${valueHtml}</div>
              </div>
            `;
          }).join('');
          
          return `
            <div class="custom-item theme-generic">
              <div class="custom-grid">${fieldsHtml}</div>
            </div>
          `;
        }).join('');
        
        return `
          <section class="custom-section">
            <h2 class="custom-title">${sectionName}</h2>
            <div style="margin-top: 48px;">${itemsHtml}</div>
          </section>
        `;
      }).join('');
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(personal.name || 'Portfolio')} - PDF Ready</title>
    <style>
    
/* Correct colors only during PDF export capture */
body.export-mode {
  background-color: #222831 !important;
}

body.export-mode #printable-container {
  background-color: #222831 !important;
}

body.export-mode .card,
body.export-mode .experience-card,
body.export-mode .certification-card,
body.export-mode .custom-item {
  background-color: #263041 !important; /* solid dark instead of rgba */
}

body.export-mode .badge,
body.export-mode .tag,
body.export-mode .skill-tag {
  background-color: rgba(0, 173, 181, 0.2) !important;
  color: #00ADB5 !important;
  border: 1px solid #00ADB5 !important;
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }

  html, body {
    width: 210mm;
    height: auto;
    margin: 0 !important;
    padding: 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    background: #222831 !important;
    overflow: visible !important;
  }

  #printable-container,
  .container {
    width: 100% !important;
    min-height: 100vh !important;
    background: #222831 !important;
    margin: 0 !important;
    padding: 20px !important;
  }

  /* Prevent breaks inside cards and sections */
  section,
  .card,
  .experience-card,
  .certification-card,
  .custom-item,
  .contact-item,
  .profile-header {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Allow breaks between sections */
  section {
    page-break-after: auto !important;
  }

  .cards-grid {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 20px !important;
  }

  a {
    text-decoration: none !important;
    color: inherit !important;
  }

  button,
  .no-print,
  #pdf-generate-btn,
  .pdf-loading,
  #contact {
    display: none !important;
  }
}

/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: #222831;
  color: #ffffff;
  line-height: 1.6;
  width: 210mm;
  margin: 0 auto;
}

.container {
  width: 210mm;
  margin: 0 auto;
  padding: 20px;
}

section {
  padding: 30px 0;
  page-break-inside: avoid;
}

/* Section Header */
.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 173, 181, 0.1);
  border: 1px solid rgba(0, 173, 181, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 10px;
}

.section-tag-text {
  font-size: 0.875rem;
  color: #ffffff;
  font-weight: 600;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  margin: 10px 0;
}

/* Profile Header */
.profile-header {
  display: flex;
  align-items: center;
  page-break-after: avoid;
}

.profile-text {
  flex: 1;
}

.profile-name {
  font-size: 3rem;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 10px;
}

.profile-designation {
  font-size: 1.5rem;
  font-weight: 700;
  color: #00ADB5;
  margin-bottom: 20px;
  display: block;
}

.contact-container {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin: 20px 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #00ADB5;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9rem;
}

.contact-icon {
  width: 20px;
  height: 20px;
}

.social-section {
  margin-top: 20px;
}

.social-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.social-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.profile-image-container {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 4px solid #00ADB5;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-section {
    padding: 60px 20px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
}

.about-wrapper {
    display: flex;
    flex-direction: row-reverse;
    gap: 40px;
    align-content:center;
    width: 100%;
    max-width: 1200px;
}

.about-images {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
}

.doodle-bg,
.person-img-wrapper {
    position: absolute;
    display: flex;
    justify-content: center;
    width: 100%;
}

.doodle-img {
    width: 70%;
    max-width: 450px;
    object-fit: contain;
}

.person-img {
    width: 55%;
    max-width: 350px;
    object-fit: contain;
    z-index: 2;
}

/* RIGHT TEXT SECTION */
.about-content {
    width: 100%;
}

.about-title {
    font-size: 2.4rem;
    font-weight: bold;
    margin-bottom: 15px;
}

.about-text {
    font-size: 1.1rem;
    line-height: 1.7;
    color: #cccccc;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 30px;
}

.card, .experience-card, .certification-card {
  background-color: rgba(15, 23, 42, 0.4);
  border: 0.5px solid #e5e7eb;
  border-radius: 20px;
  padding: 20px;
  page-break-inside: avoid;
  break-inside: avoid;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: #00ADB5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.card-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #ffffff;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #00ADB5;
}

.card-header p {
  margin: 2px 0 0 0;
  font-size: 0.9rem;
}

.card-content {
  color: #ffffff;
  font-size: 0.9rem;
  line-height: 1.6;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.skill-tag {
  padding: 4px 10px;
  background: rgba(0, 173, 181, 0.1);
  color: #00ADB5;
  border: 1px solid rgba(0, 173, 181, 0.3);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.project-links {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
}

.project-btn {
  padding: 6px 14px;
  background: #00ADB5;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 2px solid #00ADB5;
}

.project-btn.github {
  background: transparent;
  color: #00ADB5;
}

/* Certification Card */
.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.cert-issuer {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  background: rgba(0, 173, 181, 0.1);
  border: 1px solid rgba(0, 173, 181, 0.2);
  color: #00ADB5;
  border-radius: 12px;
}

.cert-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #00ADB5;
  margin-bottom: 10px;
}

.cert-date {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 10px;
}

.cert-verify-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: #00ADB5;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  margin-top: 15px;
}

/* Custom Sections */
.custom-section {
  margin-bottom: 40px;
  page-break-inside: avoid;
}

.custom-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 30px;
}

.custom-item {
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  margin-bottom: 30px;
  background: rgba(15, 23, 42, 0.4);
  page-break-inside: avoid;
}

.custom-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.custom-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.custom-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

.custom-value {
  font-weight: 500;
  line-height: 1.6;
  color: #ffffff;
}

.custom-url {
  color: #00ADB5;
  text-decoration: underline;
  word-break: break-all;
}

.custom-list {
  list-style-type: disc;
  padding-left: 20px;
  margin-top: 4px;
}

/* Contact Section - Hidden for PDF */
#contact {
  display: none;
}

    </style>
</head>
<body>
    <div class="container" id="printable-container">
    
    <!-- PROFILE HEADER -->
    <section>
        <div class="profile-header">
            <div class="profile-text">
                <h1 class="profile-name">${escapeHtml(personal.name || 'Your Name')}</h1>
                <span class="profile-designation">${escapeHtml(personal.designation || 'Your Designation')}</span>
                
                <div class="contact-container">
                    ${personal.email ? `
                        <div class="contact-item">
                            <svg class="contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
                                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                            </svg>
                            <span>${escapeHtml(personal.email)}</span>
                        </div>
                    ` : ''}
                    
                    ${personal.location ? `
                        <div class="contact-item">
                            <svg class="contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>${escapeHtml(personal.location)}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${(personal.website || personal.linkedin || personal.github) ? `
                    <div class="social-section">
                        <p class="social-title">Connect with me</p>
                        <div class="social-grid">
                            ${personal.website ? `
                                <a href="${escapeHtml(personal.website)}" class="contact-item">
                                    <svg class="contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M15 3h6v6"></path>
                                        <path d="M10 14 21 3"></path>
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    </svg>
                                    <span>Website</span>
                                </a>
                            ` : ''}
                            
                            ${personal.linkedin ? `
                                <a href="${escapeHtml(personal.linkedin)}" class="contact-item">
                                    <svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px; color: #0A66C2;">
                                        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                                    </svg>
                                    <span>LinkedIn</span>
                                </a>
                            ` : ''}
                            
                            ${personal.github ? `
                                <a href="${escapeHtml(personal.github)}" class="contact-item">
                                    <svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px; color: #171717;">
                                        <path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"></path>
                                    </svg>
                                    <span>GitHub</span>
                                </a>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            ${personal.avatar?.url ? `
                <div class="profile-image-container">
                    <img src="${escapeHtml(personal.avatar.url)}" alt="${escapeHtml(personal.name || 'Profile')}" class="profile-image" />
                </div>
            ` : ''}
        </div>
    </section>

${personal.bio ? `
<section class="about-section">
    
    <div class="about-wrapper">

        <!-- LEFT IMAGE SECTION -->
        <div class="about-images">
            <div class="doodle-bg">
                <img 
                    src="https://res.cloudinary.com/dhahajyth/image/upload/v1764913887/doodle_items_osbpjl.png" 
                    alt="Background doodle"
                    class="doodle-img"
                >
            </div>

            <div class="person-img-wrapper">
                <img 
                    src="https://res.cloudinary.com/dhahajyth/image/upload/v1764913887/Group_62_nmkytv.png" 
                    alt="Person"
                    class="person-img"
                >
            </div>
        </div>

        <!-- RIGHT BIO TEXT SECTION -->
        <div class="about-content">
            <h2 class="about-title">About <span style="color: #00ADB5;">Me</span></h2>
            <p class="about-text">${escapeHtml(personal.bio)}</p>
        </div>

    </div>

</section>
` : ''}

    
    <!-- EXPERIENCE SECTION -->
    ${experience.length > 0 ? `
    <section>
        <div class="section-header">
            <div class="section-tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m16 18 6-6-6-6"></path>
                    <path d="m8 6-6 6 6 6"></path>
                </svg>
                <span class="section-tag-text">Professional Journey</span>
            </div>
            <h2 class="section-title">Experience</h2>
        </div>
        
        <div class="cards-grid">
            ${experience.map(exp => {
                const start = formatDate(exp.startDate);
                const end = formatDate(exp.endDate);
                const tech = typeof exp.technologies === "string" 
                    ? exp.technologies.split(",").map(x => x.trim()).filter(Boolean)
                    : exp.technologies || [];
                const description = exp.description || 'No description provided.';
                const truncatedDescription = description.length > 300 ? description.substring(0, 300) + '...' : description;
                
                return `
                    <div class="experience-card">
                        <div class="card-header">
                            <div class="card-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                    <rect width="20" height="14" x="2" y="6" rx="2"></rect>
                                </svg>
                            </div>
                            <div>
                                <h3>${escapeHtml(exp.position || 'Position')}</h3>
                                <p>${escapeHtml(exp.company || 'Company')} • ${start} — ${end}</p>
                            </div>
                        </div>
                        <div class="card-content">
                            <p>${escapeHtml(truncatedDescription)}</p>
                            ${tech.length > 0 ? `
                                <div class="skills-container">
                                    ${tech.map(t => `<span class="skill-tag">${escapeHtml(t)}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    </section>
    ` : ''}
    
    <!-- EDUCATION SECTION -->
    ${education.length > 0 ? `
    <section>
        <div class="section-header">
            <div class="section-tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"></path>
                </svg>
                <span class="section-tag-text">Educational Journey</span>
            </div>
            <h2 class="section-title">Education</h2>
        </div>
        
        <div class="cards-grid">
            ${education.map(edu => `
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                                <path d="M22 10v6"></path>
                                <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="card-title">${escapeHtml(edu.institution || 'Institution')}</h3>
                            <p>${escapeHtml(edu.degree || 'Degree')} • ${escapeHtml(edu.fieldOfStudy || 'Field')}</p>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="cert-date">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M8 2v4"></path>
                                <path d="M16 2v4"></path>
                                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                <path d="M3 10h18"></path>
                            </svg>
                            <span>${formatDate(edu.startDate)} — ${formatDate(edu.endDate)}</span>
                        </div>
                        ${edu.description ? `<p style="margin-top: 10px;">${escapeHtml(edu.description)}</p>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </section>
    ` : ''}
    
    <!-- PROJECTS SECTION -->
    ${projects.length > 0 ? `
    <section>
        <div class="section-header">
            <div class="section-tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m16 18 6-6-6-6"></path>
                    <path d="m8 6-6 6 6 6"></path>
                </svg>
                <span class="section-tag-text">Project Portfolio</span>
            </div>
            <h2 class="section-title">Projects</h2>
        </div>
        
        <div class="cards-grid">
            ${projects.map(project => `
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m16 18 6-6-6-6"></path>
                                <path d="m8 6-6 6 6 6"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="card-title">${escapeHtml(project.name || 'Project')}</h3>
                            <p class="card-subtitle">${formatDate(project.startDate)} — ${formatDate(project.endDate)}</p>
                        </div>
                    </div>
                    <div class="card-content">
                        <p>${escapeHtml((project.description || 'No description').substring(0, 200))}${project.description && project.description.length > 200 ? '...' : ''}</p>
                        ${project.technologies ? `
                            <div class="skills-container">
                                ${parseCommaSeparated(project.technologies).map(tech => `
                                    <span class="skill-tag">${escapeHtml(tech)}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="project-links">
                            ${project.link ? `<a href="${escapeHtml(project.link)}" class="project-btn">Live Demo</a>` : ''}
                            ${project.github ? `<a href="${escapeHtml(project.github)}" class="project-btn github">GitHub</a>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </section>
    ` : ''}
    
    <!-- SKILLS SECTION -->
    ${skills.length > 0 ? `
    <section>
        <div class="section-header">
            <div class="section-tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                </svg>
                <span class="section-tag-text">Skills Archive</span>
            </div>
            <h2 class="section-title">Skills</h2>
        </div>
        
        <div class="cards-grid">
            ${skills.map(skillGroup => {
                const skillList = parseCommaSeparated(skillGroup.skills);
                return `
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="card-title">${escapeHtml(skillGroup.header || 'Skills')}</h3>
                                <p class="card-subtitle">${skillList.length} skills</p>
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="skills-container">
                                ${renderSkills(skillList)}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    </section>
    ` : ''}
    
    <!-- CERTIFICATION SECTION -->
    ${certification.length > 0 ? `
    <section>
        <div class="section-header">
            <div class="section-tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
                    <circle cx="12" cy="8" r="6"></circle>
                </svg>
                <span class="section-tag-text">Verified Credentials</span>
            </div>
            <h2 class="section-title">Certifications</h2>
        </div>
        
        <div class="cards-grid">
            ${certification.map(cert => `
                <div class="certification-card">
                    <div class="cert-header">
                        <div class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
                                <circle cx="12" cy="8" r="6"></circle>
                            </svg>
                        </div>
                        <span class="cert-issuer">${escapeHtml(cert.issuer || 'Issuer')}</span>
                    </div>
                    <div>
                        <h3 class="cert-title">${escapeHtml(cert.name || 'Certification')}</h3>
                        <div class="cert-date">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M8 2v4"></path>
                                <path d="M16 2v4"></path>
                                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                <path d="M3 10h18"></path>
                            </svg>
                            <span>Issued ${formatDate(cert.issueDate)}</span>
                        </div>
                    </div>
                    ${cert.link ? `
                        <a href="${escapeHtml(cert.link)}" class="cert-verify-btn">
                            Verify Certificate
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M7 7h10v10"></path>
                                <path d="M7 17 17 7"></path>
                            </svg>
                        </a>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </section>
    ` : ''}
    
    <!-- CUSTOM SECTIONS -->
    ${renderCustomSections(customSections)}
      </div>
</body>
<script>
window.addEventListener("load", () => {
  window.print();
  setTimeout(() => window.close(), 1000);
});
</script>



</html>
`;
  };

  return generateHTML();
};