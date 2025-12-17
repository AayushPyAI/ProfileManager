'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Loader2, Trash2, Plus, ChevronDown, ChevronUp, GripVertical, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

const initialPersonalInfo = {
  name: '',
  bio: '',
  designation: '',
  location: '',
  website: '',
  email: '',
  phone: '',
  github: '',
  linkedin: '',
  twitter: '',
};

const initialFormState = {
  personal: initialPersonalInfo,
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certification: [],
  customSections: [],
};

const initialEducation = {
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  grade: '',
  description: '',
  isCurrent: false,
};

const initialExperience = {
  company: '',
  position: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
  technologies: '',
  isCurrent: false,
};

const initialCertification = {
  name: "",
  issuer: "",
  issueDate: "",
  link: "",
};

const initialProject = {
  name: '',
  description: '',
  link: '',
  github: '',
  technologies: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
};

const initialSkill = {
  header: '',
  skills: '',
};

// Simple custom field structure for frontend
const initialCustomField = {
  fieldName: '',
  fieldType: 'text',
  fieldValue: '',
  fieldOptions: [],
};

const ProfileFormModal = ({
  isOpen,
  onClose,
  editingProfile,
  onSave,
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedSection, setDraggedSection] = useState(null);
  const [sectionOrder, setSectionOrder] = useState([
    'personal',
    'education',
    'experience',
    'projects',
    'skills',
    'certification',
    'customSections',
  ]);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    education: false,
    experience: false,
    projects: false,
    skills: false,
    certification: false,
    customSections: false,
  });
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
const [avatarPreview, setAvatarPreview] = useState(null);
const [avatarFile, setAvatarFile] = useState(null);
const [avatarError, setAvatarError] = useState(null);
const [uploadProgress, setUploadProgress] = useState(0);
const [removeAvatar, setRemoveAvatar] = useState(false);
const [draggedItem, setDraggedItem] = useState({ section: null, index: null });
const [dragOverItem, setDragOverItem] = useState({ section: null, index: null });
const [dragOverIndex, setDragOverIndex] = useState(null);


  const hasChangesRef = useRef(false);

  // Track if form has changes
  useEffect(() => {
    if (isOpen) {
      hasChangesRef.current = true;
    }
  }, [formData, isOpen]);

  // Prevent page navigation/close when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOpen]);

  const handleCloseRequest = useCallback(() => {
    setShowCloseConfirm(true);
  }, []);

  const confirmClose = useCallback(() => {
    setShowCloseConfirm(false);
    hasChangesRef.current = false;
    onClose();
  }, [onClose]);

  // Helper function to convert customSections to simple custom fields for frontend
  const customSectionsToFields = (customSections) => {
    if (!customSections || !Array.isArray(customSections)) return [];

    return customSections.map(section => {
      // Extract the first item's value if it exists
      const firstItem = section.items && section.items[0];
      const fieldValue = firstItem?.fields?.value || '';

      return {
        fieldName: section.name || '',
        fieldType: mapSchemaTypeToFieldType(section.fieldsSchema?.[0]?.type) || 'text',
        fieldValue: fieldValue,
        fieldOptions: [], // You might need to handle this based on your data
      };
    });
  };

  // === Avatar Change Handler (Validation + Preview) ===
const handleAvatarChange = (file) => {
  setAvatarError(null);

  if (!file) return;

  // Validation
  if (!file.type.startsWith("image/")) {
    setAvatarError("Please upload a valid image file.");
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    setAvatarError("Image must be less than 3MB.");
    return;
  }

  // Preview
  const reader = new FileReader();
  reader.onload = () => setAvatarPreview(reader.result);
  reader.readAsDataURL(file);

  setAvatarFile(file);
};

  
  // Helper function to convert simple custom fields to customSections for backend
  const fieldsToCustomSections = (customFields) => {
    if (!customFields || !Array.isArray(customFields)) return [];

    return customFields.map((field, index) => ({
      name: field.fieldName || `Custom Field ${index + 1}`,
      label: field.fieldName || `Custom Field ${index + 1}`,
      order: index,
      fieldsSchema: [{
        name: 'value',
        type: mapFieldTypeToSchemaType(field.fieldType)
      }],
      items: [{
        order: 0,
        fields: {
          value: field.fieldValue || ''
        }
      }]
    }));
  };

  // Type mapping helpers
  const mapFieldTypeToSchemaType = (fieldType) => {
    const typeMap = {
      'text': 'string',
      'textarea': 'string',
      'url': 'string',
      'date': 'date',
      'select': 'string'
    };
    return typeMap[fieldType] || 'string';
  };

  const mapSchemaTypeToFieldType = (schemaType) => {
    const typeMap = {
      'string': 'text',
      'date': 'date'
    };
    return typeMap[schemaType] || 'text';
  };

  // Convert skills from old format (name, level, category) to new format (header, skills)
  const convertSkillsToNewFormat = (skills) => {
    if (!skills || !Array.isArray(skills)) return [];
    
    // Check if skills are already in new format
    const isNewFormat = skills.some(s => s.header !== undefined || s.skills !== undefined);
    
    if (isNewFormat) {
      // Already in new format, just ensure structure is correct
      return skills.map(skill => ({
        header: skill.header || '',
        skills: skill.skills || '',
      }));
    }
    
    // Old format: group skills by category/header
    const grouped = {};
    skills.forEach(skill => {
      if (!skill || typeof skill !== 'object') return;
      
      const header = skill.category || skill.header || 'Other';
      if (!grouped[header]) {
        grouped[header] = [];
      }
      
      if (skill.name) {
        // Old format: add name to the group
        grouped[header].push(skill.name);
      }
    });
    
    // Convert grouped object to array of {header, skills}
    return Object.entries(grouped).map(([header, skillNames]) => ({
      header,
      skills: skillNames.join(', ')
    }));
  };

  // Convert technologies from array to string
  const convertTechnologiesToString = (tech) => {
    if (!tech) return '';
    if (typeof tech === 'string') return tech;
    if (Array.isArray(tech)) return tech.join(', ');
    return '';
  };


const ReorderableList = ({ 
  items, 
  sectionKey, 
  renderItem,
  onReorder,
  disabled = false 
}) => {
  const handleDragStart = (e, index) => {
    if (disabled) return;
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ section: sectionKey, index });
    
    // Visual feedback
    e.currentTarget.classList.add('opacity-50', 'ring-2', 'ring-primary');
  };

  const handleDragOver = (e, index) => {
    if (disabled) return;
    e.preventDefault();
    setDragOverItem({ section: sectionKey, index });
    e.currentTarget.classList.add('bg-base-300/30');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-base-300/30');
  };

  const handleDrop = (e, targetIndex) => {
    if (disabled || !draggedItem.section || draggedItem.section !== sectionKey) return;
    
    e.preventDefault();
    e.currentTarget.classList.remove('bg-base-300/30');
    
    if (draggedItem.index === targetIndex) {
      setDraggedItem({ section: null, index: null });
      setDragOverItem({ section: null, index: null });
      return;
    }

    // Call reorder handler
    onReorder(draggedItem.index, targetIndex);
    
    setDraggedItem({ section: null, index: null });
    setDragOverItem({ section: null, index: null });
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50', 'ring-2', 'ring-primary');
    setDraggedItem({ section: null, index: null });
    setDragOverItem({ section: null, index: null });
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          draggable={!disabled}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`transition-all duration-200 cursor-move ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

  useEffect(() => {
    if (!isOpen) return;

    // Reset avatar preview/file when opening a profile so DB avatar is shown
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarError(null);
    setRemoveAvatar(false);
    setUploadProgress(0);

    const timeout = setTimeout(() => {
      const editingData = editingProfile || {};
      console.log(editingData);

      // ---- 1) Frontend simple-field conversion (existing behavior) ----
      const customFields = customSectionsToFields(editingData.customSections || []);

      let fixedOrder;

if (editingData.sectionOrder && Array.isArray(editingData.sectionOrder)) {
  // edit mode
  fixedOrder = editingData.sectionOrder.map(k =>
    k === 'customFields' ? 'customSections' : k
  );
} else {
  // create mode
  fixedOrder = [
    'personal',
    'education',
    'experience',
    'projects',
    'skills',
    'certification',
    'customSections',
  ];
}

      // Convert old 'customFields' → 'customSections'
      fixedOrder = fixedOrder.map((key) =>
        key === "customFields" ? "customSections" : key
      );

      // Ensure customSections EXISTS
      if (!fixedOrder.includes("customSections")) {
        fixedOrder.push("customSections");
      }

      // Remove duplicates
      fixedOrder = [...new Set(fixedOrder)];

      // // ---- 3) Push fixed state ----
      // setFormData({
      //   ...initialFormState,
      //   ...editingData,
      //   customSections: customFields,
      // });
      
      // Convert skills to new format
      const convertedSkills = convertSkillsToNewFormat(editingData.skills || []);
      
      // Merge personal data properly
      const personalData = {
        ...initialPersonalInfo,
        ...(editingData.personal || {}),
      };
      
      setFormData({
        ...initialFormState,
        personal: personalData,
        education: (editingData.education || []).map(e => ({
          ...e,
          startDate: toInputDate(e.startDate),
          endDate: toInputDate(e.endDate),
          isCurrent: !e.endDate,
        })),
        experience: (editingData.experience || []).map(e => ({
          ...e,
          startDate: toInputDate(e.startDate),
          endDate: toInputDate(e.endDate),
          isCurrent: !e.endDate,
          technologies: convertTechnologiesToString(e.technologies),
          description: e.description || (e.responsibilities && Array.isArray(e.responsibilities) 
            ? e.responsibilities.join('\n• ') 
            : ''),
        })),
        projects: (editingData.projects || []).map(p => ({
          ...p,
          startDate: toInputDate(p.startDate),
          endDate: toInputDate(p.endDate),
          isCurrent: !p.endDate,
          technologies: convertTechnologiesToString(p.technologies),
        })),
        skills: convertedSkills,
        certification: (editingData.certification || []).map(c => ({
          ...c,
          issueDate: toInputDate(c.issueDate),
        })),
        customSections: customFields,
      });


      setSectionOrder(fixedOrder);

      // Reset temp inputs
    }, 0);

    return () => clearTimeout(timeout);
  }, [isOpen, editingProfile]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Ensure technologies are strings (not arrays) for experience and projects
      const processedExperience = (formData.experience || []).map(exp => {
        const { isCurrent, responsibilities, ...rest } = exp;
        return {
          ...rest,
          technologies: convertTechnologiesToString(exp.technologies),
          // Remove responsibilities if it exists (we use description now)
        };
      });

      const processedProjects = (formData.projects || []).map(proj => {
        const { isCurrent, ...rest } = proj;
        return {
          ...rest,
          technologies: convertTechnologiesToString(proj.technologies),
        };
      });

      // Ensure skills are in correct format
      const processedSkills = (formData.skills || []).map(skill => ({
        header: skill.header || '',
        skills: skill.skills || '',
      }));

      // Process education - remove isCurrent field
      const processedEducation = (formData.education || []).map(edu => {
        const { isCurrent, ...rest } = edu;
        return rest;
      });

      // Convert simple fields back to customSections structure for saving
      const saveData = {
  ...formData,
  education: processedEducation,
  experience: processedExperience,
  projects: processedProjects,
  skills: processedSkills,
  sectionOrder,
  customSections: fieldsToCustomSections(formData.customSections),
  avatarFile: avatarFile || null,
  removeAvatar
};

      console.log('Saving data:', saveData);
      await onSave(saveData);
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  const safeImageSrc = (value) => {
  if (!value || value === "") return null;
  return value;
};

useEffect(() => {
  if (!isOpen) {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarError(null);
    setRemoveAvatar(false);
    setUploadProgress(0);
  }
}, [isOpen]);

  // // Update all your existing functions to work with customSections instead of customFields
  // const updateField = (key, value) => {
  //   setFormData((prev) => ({ ...prev, [key]: value }));
  // };
  
  const toInputDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
};


  const addItem = (key, item) => {
    setFormData((prev) => {
      const list = prev[key] || [];
      if (list.length > 0 && isObjectEmpty(list[list.length - 1])) {
        return prev;
      }
      return {
        ...prev,
        [key]: [...list, item],
      };
    });
  };

  const updatePersonalField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      }
    }));
  };

  const isObjectEmpty = (obj) => {
    return Object.values(obj || {}).every((v) => {
      if (Array.isArray(v)) return v.length === 0;
      return v === "" || v === null || v === undefined;
    });
  };

  const removeItem = (key, index) => {
    setFormData((prev) => ({
      ...prev,
      [key]: (prev[key]).filter((_, i) => i !== index),
    }));
  };

  const updateNestedItem = (key, index, field, value) => {
    setFormData((prev) => {
      const items = [...prev[key]];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, [key]: items };
    });
  };

  const addArrayItem = (key, itemIndex, arrayKey, value) => {
    if (!value.trim()) return;
    setFormData((prev) => {
      const items = [...prev[key]];
      const currentArray = items[itemIndex][arrayKey] || [];
      items[itemIndex] = {
        ...items[itemIndex],
        [arrayKey]: [...currentArray, value.trim()]
      };
      return { ...prev, [key]: items };
    });
  };

  const removeArrayItem = (key, itemIndex, arrayKey, arrayIndex) => {
    setFormData((prev) => {
      const items = [...prev[key]];
      const currentArray = items[itemIndex][arrayKey] || [];
      items[itemIndex] = {
        ...items[itemIndex],
        [arrayKey]: currentArray.filter((_, i) => i !== arrayIndex)
      };
      return { ...prev, [key]: items };
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

   const handleItemReorder = (section, fromIndex, toIndex) => {
  if (fromIndex === toIndex) return;
  
  setFormData(prev => {
    const items = [...prev[section]];
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);
    
    // Update order numbers
    const updatedItems = items.map((item, idx) => ({
      ...item,
      order: idx
    }));
    
    return { ...prev, [section]: updatedItems };
  });
};
  // Section drag and drop handlers
  const handleSectionDragStart = (e, section) => {
    setDraggedSection(section);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSectionDrop = (e, targetSection) => {
    e.preventDefault();

    if (!draggedSection || draggedSection === targetSection) {
      setDraggedSection(null);
      return;
    }

    setSectionOrder(prev => {
      const newOrder = [...prev];
      const draggedIdx = newOrder.indexOf(draggedSection);
      const targetIdx = newOrder.indexOf(targetSection);

      const [movedSection] = newOrder.splice(draggedIdx, 1);
      newOrder.splice(targetIdx, 0, movedSection);

      return newOrder;
    });

    setDraggedSection(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm text-white">
      <div className="bg-base-100 p-6 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto scrollbar-none relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
          <h2 className="text-2xl font-bold text-base-content">
            {editingProfile ? 'Edit Profile' : 'Create Profile'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCloseRequest}
              className="btn btn-circle btn-ghost btn-sm hover:bg-base-300 transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Close Confirmation Dialog */}
        {showCloseConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
            <div className="bg-base-100 p-6 rounded-xl shadow-2xl max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg text-base-content">Discard Changes?</h3>
              </div>
              <p className="text-base-content/70 mb-6">
                You have unsaved changes. Are you sure you want to close without saving?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setShowCloseConfirm(false)}
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  className="btn btn-error flex-1"
                  onClick={confirmClose}
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 gap-6'>
          <form onSubmit={handleSubmit} className="space-y-6">
            {sectionOrder.map((sectionKey) => {
              if (sectionKey === 'personal') {
                return (
                  <section
                    key="personal"
                    className="card bg-base-200 p-6"
                    draggable
                    onDragStart={(e) => handleSectionDragStart(e, 'personal')}
                    onDragOver={handleSectionDragOver}
                    onDrop={(e) => handleSectionDrop(e, 'personal')}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection('personal')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-base-content/50 cursor-grab active:cursor-grabbing" />
                        <h3 className="text-lg font-semibold text-base-content">Personal Information</h3>
                      </div>
                      {expandedSections.personal ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {expandedSections.personal && (
                      <div className="mt-4 space-y-4">
                        
                        <div className="flex flex-col gap-6">
  <p className="label font-semibold text-lg">Profile Photo</p>

  {/* Preview and Upload Section */}
  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
    {/* Avatar Preview with Animation */}
    <div className="relative group">
      {/* Animated gradient ring */}
      <div className="absolute -inset-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-75 blur transition-opacity duration-500"></div>
      
      {/* Avatar container */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-base-100 shadow-xl transition-transform duration-300 group-hover:scale-105">
       {formData.personal?.avatar?.url ? <Image
          src={
            safeImageSrc(formData.personal?.avatar?.url)
          }
          width={128}
          height={128}
          alt="Avatar Preview"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        /> : <Image
          src={
            safeImageSrc(avatarPreview) ||
            "/default-avatar.png"
          }
          width={128}
          height={128}
          alt="Avatar Preview"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </div>
      </div>

      {/* Upload badge */}
      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300">
        <label className="cursor-pointer flex items-center justify-center w-full h-full">
          <svg 
            className="w-5 h-5 text-primary-content" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleAvatarChange(e.target.files[0])}
          />
        </label>
      </div>
    </div>

    {/* Upload Info and Actions */}
    <div className="flex flex-col gap-3 flex-1 text-center sm:text-left">
      <div>
        <h4 className="font-medium text-base-content mb-1">
          Upload your photo
        </h4>
        <p className="text-sm text-base-content/60">
          JPG, PNG, WebP • Max 3MB
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <label className="btn btn-primary btn-sm gap-2 flex-1 sm:flex-initial">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          Choose File
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleAvatarChange(e.target.files[0])}
          />
        </label>

        {(avatarPreview || formData.personal?.avatar?.url) && (
          <button 
            className="btn btn-ghost btn-sm gap-2 flex-1 sm:flex-initial"
            onClick={() => {
  setAvatarPreview(null);
  setAvatarFile(null);
  setRemoveAvatar(true);

  // Clear existing avatar from form data UI
  setFormData(prev => ({
    ...prev,
    personal: {
      ...prev.personal,
      avatar: null
    }
  }));
}}

          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
            Remove
          </button>
        )}
      </div>

      {avatarError && (
        <div className="alert alert-error py-2 px-3 text-sm">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span>{avatarError}</span>
        </div>
      )}
    </div>
  </div>
</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="label">Full Name</label>
                            <input
                              className="input input-bordered w-full"
                              value={formData.personal.name}
                              onChange={(e) => updatePersonalField("name", e.target.value)}
                              placeholder="John Doe"
                            />
                          </div>

                          <div>
                            <label className="label">Email</label>
                            <input
                              type="email"
                              className="input input-bordered w-full"
                              value={formData.personal.email}
                              onChange={(e) => updatePersonalField("email", e.target.value)}
                              placeholder="john@example.com"
                            />
                          </div>
                        </div>

                        {/* Designation */}
                        <div>
                          <label className="label">Designation</label>
                          <input
                            className="input input-bordered w-full"
                            value={formData.personal.designation}
                            onChange={(e) => updatePersonalField("designation", e.target.value)}
                            placeholder="Full Stack Developer"
                          />
                        </div>

                        {/* Bio */}
                        <div>
                          <label className="label">Bio</label>
                          <textarea
                            className="textarea textarea-bordered w-full"
                            rows={4}
                            value={formData.personal.bio}
                            onChange={(e) => updatePersonalField("bio", e.target.value)}
                            placeholder="A short introduction about yourself..."
                          />
                        </div>

                        {/* Location + Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="label">Location</label>
                            <input
                              className="input input-bordered w-full"
                              value={formData.personal.location}
                              onChange={(e) => updatePersonalField("location", e.target.value)}
                              placeholder="City, Country"
                            />
                          </div>

                          <div>
                            <label className="label">Phone</label>
                            <input
                              className="input input-bordered w-full"
                              value={formData.personal.phone}
                              onChange={(e) => updatePersonalField("phone", e.target.value)}
                              placeholder="+91 9876543210"
                            />
                          </div>
                        </div>

                        {/* Socials */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {["website", "github", "linkedin", "twitter"].map((field) => (
                            <div key={field}>
                              <label className="label capitalize">{field}</label>
                              <input
                                className="input input-bordered w-full"
                                value={formData.personal[field] || ""}
                                onChange={(e) => updatePersonalField(field, e.target.value)}
                                placeholder={`Enter ${field} URL`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                );
              }

             if (sectionKey === 'education') {
  return (
    <section
      key="education"
      className="card bg-base-200 p-6"
      draggable
      onDragStart={(e) => handleSectionDragStart(e, 'education')}
      onDragOver={handleSectionDragOver}
      onDrop={(e) => handleSectionDrop(e, 'education')}
    >
      <button
        type="button"
        onClick={() => toggleSection('education')}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-base-content/50 cursor-grab active:cursor-grabbing" />
          <h3 className="text-lg font-semibold text-base-content">Education</h3>
        </div>
        {expandedSections.education ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {expandedSections.education && (
        <div className="mt-4 space-y-4">
          {formData.education?.map((edu, idx) => (
            <div 
              key={idx} 
              className="card bg-base-100 p-4 border border-base-300 relative group"
              draggable
              onDragStart={(e) => {
                setDraggedItem({ section: 'education', index: idx });
                e.currentTarget.classList.add('opacity-50', 'cursor-grabbing');
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedItem.section === 'education' && draggedItem.index !== idx) {
                  setDragOverIndex(idx);
                  e.currentTarget.classList.add('border-primary', 'bg-base-300/30');
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-primary', 'bg-base-300/30');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-primary', 'bg-base-300/30');
                
                if (draggedItem.section === 'education' && draggedItem.index !== idx) {
                  handleItemReorder('education', draggedItem.index, idx);
                }
                
                setDraggedItem({ section: null, index: null });
                setDragOverIndex(null);
              }}
              onDragEnd={(e) => {
                e.currentTarget.classList.remove('opacity-50', 'cursor-grabbing');
                setDraggedItem({ section: null, index: null });
                setDragOverIndex(null);
              }}
            >
              {/* Drag handle (similar to section) */}
              <button
                type="button"
                className="absolute -left-3 top-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
                draggable="true"
              >
                <GripVertical className="w-5 h-5 text-base-content/40 hover:text-base-content/70" />
              </button>
              
              {/* Collapse/Expand button for this item */}
              <button
                type="button"
                className="absolute right-4 top-4 text-base-content/50 hover:text-base-content"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="label">
                    <span className="label-text font-medium">Institution</span>
                  </label>
                  <input
                    placeholder="University Name"
                    value={edu.institution}
                    onChange={(e) => updateNestedItem('education', idx, 'institution', e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label">
                    <span className="label-text font-medium">Degree</span>
                  </label>
                  <input
                    placeholder="Bachelor of Science"
                    value={edu.degree}
                    onChange={(e) => updateNestedItem('education', idx, 'degree', e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label">
                    <span className="label-text font-medium">Field of Study</span>
                  </label>
                  <input
                    placeholder="Computer Science"
                    value={edu.fieldOfStudy}
                    onChange={(e) => updateNestedItem('education', idx, 'fieldOfStudy', e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label">
                    <span className="label-text font-medium">Grade</span>
                  </label>
                  <input
                    placeholder="GPA or Grade"
                    value={edu.grade || ''}
                    onChange={(e) => updateNestedItem('education', idx, 'grade', e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label">
                    <span className="label-text font-medium">Start Date</span>
                  </label>
                  <input
                    type="date"
                    value={edu.startDate}
                    onChange={(e) => updateNestedItem('education', idx, 'startDate', e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label">
                    <span className="label-text font-medium">End Date</span>
                  </label>
                  <input
                    type="date"
                    disabled={edu.isCurrent}
                    value={edu.endDate || ''}
                    onChange={(e) => updateNestedItem('education', idx, 'endDate', e.target.value)}
                    className="input input-bordered w-full"
                  />
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={edu.isCurrent}
                      onChange={(e) => {
                        updateNestedItem('education', idx, "isCurrent", e.target.checked);
                        if (e.target.checked) {
                          updateNestedItem('education', idx, "endDate", "");
                        }
                      }}
                    />
                    <span className="text-sm">Currently Studying</span>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="label">
                    <span className="label-text font-medium">Description</span>
                  </label>
                  <textarea
                    placeholder="Description of your studies, achievements..."
                    value={edu.description || ''}
                    onChange={(e) => updateNestedItem('education', idx, 'description', e.target.value)}
                    className="textarea textarea-bordered w-full"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-3 pt-3 border-t border-base-300">
                <button
                  type="button"
                  onClick={() => removeItem('education', idx)}
                  className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            </div>
          ))}
          {(!formData.education || formData.education.length === 0) && (
            <div className="text-center text-base-content/60 py-8">
              No education entries added yet.
            </div>
          )}
          
          {/* Add Button at Bottom */}
          <button
            type="button"
            disabled={
              formData.education.length > 0 &&
              isObjectEmpty(formData.education[formData.education.length - 1])
            }
            className="btn btn-primary w-full mt-4"
            onClick={() => addItem('education', { 
              ...initialEducation, 
              order: formData.education?.length || 0 
            })}
          >
            <Plus className="w-4 h-4" /> Add Education
          </button>
        </div>
      )}
    </section>
  );
}

              if (sectionKey === 'experience') {
                return (
                  <section
                    key="experience"
                    className="card bg-base-200 p-6"
                    draggable
                    onDragStart={(e) => handleSectionDragStart(e, 'experience')}
                    onDragOver={handleSectionDragOver}
                    onDrop={(e) => handleSectionDrop(e, 'experience')}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection('experience')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-base-content/50 cursor-grab active:cursor-grabbing" />
                        <h3 className="text-lg font-semibold text-base-content">Work Experience</h3>
                      </div>
                      {expandedSections.experience ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {expandedSections.experience && (
                      <div className="mt-4 space-y-4">
                        {formData.experience?.map((exp, idx) => (
                          <div key={idx} className="card bg-base-100 p-4 border border-base-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <label className="label">
                                  <span className="label-text font-medium">Company</span>
                                </label>
                                <input
                                  placeholder="Company Name"
                                  value={exp.company}
                                  onChange={(e) => updateNestedItem('experience', idx, 'company', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="label">
                                  <span className="label-text font-medium">Position</span>
                                </label>
                                <input
                                  placeholder="Job Title"
                                  value={exp.position}
                                  onChange={(e) => updateNestedItem('experience', idx, 'position', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="label">
                                  <span className="label-text font-medium">Location</span>
                                </label>
                                <input
                                  placeholder="City, Country"
                                  value={exp.location || ''}
                                  onChange={(e) => updateNestedItem('experience', idx, 'location', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="label">
                                  <span className="label-text font-medium">Start Date</span>
                                </label>
                                <input
                                  type="date"
                                  value={exp.startDate}
                                  onChange={(e) => updateNestedItem('experience', idx, 'startDate', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="label">
                                  <span className="label-text font-medium">End Date</span>
                                </label>
                                <input
                                  type="date"
                                  disabled={exp.isCurrent}
                                  value={exp.endDate || ''}
                                  onChange={(e) => updateNestedItem('experience', idx, 'endDate', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                                 <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="checkbox"
                                    checked={exp.isCurrent}
                                    onChange={(e) => {
                                      updateNestedItem('experience', idx, "isCurrent", e.target.checked);
                                      if (e.target.checked) {
                                        updateNestedItem('experience', idx, "endDate", "");
                                      }
                                    }}
                                  />
                                  <span className="text-sm">Currently Working</span>
                                </div>
                              </div>
                            </div>

                            {/* Job Description */}
                            <div className="mt-4 space-y-2">
                              <label className="label">
                                <span className="label-text font-medium">Job Description</span>
                              </label>
                              <textarea
                                placeholder="Describe your role, responsibilities, and achievements..."
                                value={exp.description || ''}
                                onChange={(e) => updateNestedItem('experience', idx, 'description', e.target.value)}
                                className="textarea textarea-bordered w-full"
                                rows={4}
                              />
                            </div>

                            {/* Technologies */}
                            <div className="mt-4 space-y-2">
                              <label className="label">
                                <span className="label-text font-medium">Technologies Used (comma-separated)</span>
                              </label>
                              <textarea
                                placeholder="React, Node.js, MongoDB, TypeScript"
                                value={exp.technologies || ''}
                                onChange={(e) => updateNestedItem('experience', idx, 'technologies', e.target.value)}
                                className="textarea textarea-bordered w-full"
                                rows={2}
                              />
                              <p className="text-xs text-base-content/60">
                                Enter technologies separated by commas. Example: React, Node.js, MongoDB
                              </p>
                            </div>

                            <div className="flex justify-end mt-3 pt-3 border-t border-base-300">
                              <button
                                type="button"
                                onClick={() => removeItem('experience', idx)}
                                className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                              >
                                <Trash2 className="w-4 h-4" /> Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        {(!formData.experience || formData.experience.length === 0) && (
                          <div className="text-center text-base-content/60 py-8">
                            No work experience added yet.
                          </div>
                        )}
                        
                        {/* Add Button at Bottom */}
                        <button
                          type="button"
                          disabled={
                            formData.experience.length > 0 &&
                            isObjectEmpty(formData.experience[formData.experience.length - 1])
                          }
                          className="btn btn-primary w-full mt-4"
                          onClick={() => addItem('experience', { ...initialExperience })}
                        >
                          <Plus className="w-4 h-4" /> Add Experience
                        </button>
                      </div>
                    )}
                  </section>
                );
              }

              if (sectionKey === 'projects') {
                return (
                  <section
                    key="projects"
                    className="card bg-base-200 p-6"
                    draggable
                    onDragStart={(e) => handleSectionDragStart(e, 'projects')}
                    onDragOver={handleSectionDragOver}
                    onDrop={(e) => handleSectionDrop(e, 'projects')}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection('projects')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-base-content/50 cursor-grab active:cursor-grabbing" />
                        <h3 className="text-lg font-semibold text-base-content">Projects</h3>
                      </div>
                      {expandedSections.projects ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {expandedSections.projects && (
                      <div className="mt-4 space-y-4">
                        {formData.projects?.map((project, idx) => (
                          <div key={idx} className="card bg-base-100 p-4 border border-base-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <label className="label">
                                  <span className="label-text font-medium">Project Name</span>
                                </label>
                                <input
                                  placeholder="Project Name"
                                  value={project.name}
                                  onChange={(e) => updateNestedItem('projects', idx, 'name', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="label">
                                  <span className="label-text font-medium">Project Link</span>
                                </label>
                                <input
                                  placeholder="https://project.com"
                                  value={project.link || ''}
                                  onChange={(e) => updateNestedItem('projects', idx, 'link', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="label">
                                  <span className="label-text font-medium">Github</span>
                                </label>
                                <input
                                  placeholder="https://github.com/"
                                  value={project.github || ''}
                                  onChange={(e) => updateNestedItem('projects', idx, 'github', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="label">
                                  <span className="label-text font-medium">Start Date</span>
                                </label>
                                <input
                                  type="date"
                                  value={project.startDate || ''}
                                  onChange={(e) => updateNestedItem('projects', idx, 'startDate', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="label">
                                  <span className="label-text font-medium">End Date</span>
                                </label>
                                <input
                                  type="date"
                                  disabled={project.isCurrent}
                                  value={project.endDate || ''}
                                  onChange={(e) => updateNestedItem('projects', idx, 'endDate', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                                 <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="checkbox"
                                    checked={project.isCurrent}
                                    onChange={(e) => {
                                      updateNestedItem('projects', idx, "isCurrent", e.target.checked);
                                      if (e.target.checked) {
                                        updateNestedItem('projects', idx, "endDate", "");
                                      }
                                    }}
                                  />
                                  <span className="text-sm">Currently Working / Studying</span>
                                </div>
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <label className="label">
                                  <span className="label-text font-medium">Description</span>
                                </label>
                                <textarea
                                  placeholder="Describe the project, your role, and key achievements..."
                                  value={project.description}
                                  onChange={(e) => updateNestedItem('projects', idx, 'description', e.target.value)}
                                  className="textarea textarea-bordered w-full"
                                  rows={4}
                                />
                              </div>
                            </div>

                            {/* Technologies */}
                            <div className="mt-4 space-y-2">
                              <label className="label">
                                <span className="label-text font-medium">Technologies Used (comma-separated)</span>
                              </label>
                              <textarea
                                placeholder="React, Node.js, MongoDB, TypeScript"
                                value={project.technologies || ''}
                                onChange={(e) => updateNestedItem('projects', idx, 'technologies', e.target.value)}
                                className="textarea textarea-bordered w-full"
                                rows={2}
                              />
                              <p className="text-xs text-base-content/60">
                                Enter technologies separated by commas. Example: React, Node.js, MongoDB
                              </p>
                            </div>

                            <div className="flex justify-end mt-3 pt-3 border-t border-base-300">
                              <button
                                type="button"
                                onClick={() => removeItem('projects', idx)}
                                className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                              >
                                <Trash2 className="w-4 h-4" /> Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        {(!formData.projects || formData.projects.length === 0) && (
                          <div className="text-center text-base-content/60 py-8">
                            No projects added yet.
                          </div>
                        )}
                        
                        {/* Add Button at Bottom */}
                        <button
                          type="button"
                          disabled={
                            formData.projects.length > 0 &&
                            isObjectEmpty(formData.projects[formData.projects.length - 1])
                          }
                          className="btn btn-primary w-full mt-4"
                          onClick={() => addItem('projects', { ...initialProject })}
                        >
                          <Plus className="w-4 h-4" /> Add Project
                        </button>
                      </div>
                    )}
                  </section>
                );
              }

              if (sectionKey === 'skills') {
                return (
                  <section
                    key="skills"
                    className="card bg-base-200 p-6"
                    draggable
                    onDragStart={(e) => handleSectionDragStart(e, 'skills')}
                    onDragOver={handleSectionDragOver}
                    onDrop={(e) => handleSectionDrop(e, 'skills')}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection('skills')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-base-content/50 cursor-grab active:cursor-grabbing" />
                        <h3 className="text-lg font-semibold text-base-content">Skills</h3>
                      </div>
                      {expandedSections.skills ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {expandedSections.skills && (
                      <div className="mt-4 space-y-4">
                        {formData.skills?.map((skill, idx) => (
                          <div key={idx} className="card bg-base-100 p-4 border border-base-300">
                            <div className="grid grid-cols-1 gap-3">
                              <div className="space-y-2">
                                <label className="label">
                                  <span className="label-text font-medium">Skill Header</span>
                                </label>
                                <input
                                  placeholder="Frontend, Backend, DevOps, etc."
                                  value={skill.header || ''}
                                  onChange={(e) => updateNestedItem('skills', idx, 'header', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="label">
                                  <span className="label-text font-medium">Skills (comma-separated)</span>
                                </label>
                                <textarea
                                  placeholder="JavaScript, React, Node.js, TypeScript"
                                  value={skill.skills || ''}
                                  onChange={(e) => updateNestedItem('skills', idx, 'skills', e.target.value)}
                                  className="textarea textarea-bordered w-full"
                                  rows={2}
                                />
                                <p className="text-xs text-base-content/60">
                                  Enter skills separated by commas. Example: JavaScript, React, Node.js
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end mt-3 pt-3 border-t border-base-300">
                              <button
                                type="button"
                                onClick={() => removeItem('skills', idx)}
                                className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                              >
                                <Trash2 className="w-4 h-4" /> Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        {(!formData.skills || formData.skills.length === 0) && (
                          <div className="text-center text-base-content/60 py-8">
                            No skills added yet.
                          </div>
                        )}
                        
                        {/* Add Button at Bottom */}
                        <button
                          type="button"
                          disabled={
                            formData.skills.length > 0 &&
                            isObjectEmpty(formData.skills[formData.skills.length - 1])
                          }
                          className="btn btn-primary w-full mt-4"
                          onClick={() => addItem('skills', { ...initialSkill })}
                        >
                          <Plus className="w-4 h-4" /> Add Skill Category
                        </button>
                      </div>
                    )}
                  </section>
                );
              }

              if (sectionKey === 'certification') {
                return (
                  <section
                    key="certification"
                    className="card bg-base-200 p-6"
                    draggable
                    onDragStart={(e) => handleSectionDragStart(e, 'certification')}
                    onDragOver={handleSectionDragOver}
                    onDrop={(e) => handleSectionDrop(e, 'certification')}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection('certification')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-base-content/50 cursor-grab active:cursor-grabbing" />
                        <h3 className="text-lg font-semibold text-base-content">Certifications</h3>
                      </div>
                      {expandedSections.certification ? <ChevronUp /> : <ChevronDown />}
                    </button>

                    {expandedSections.certification && (
                      <div className="mt-4 space-y-4">
                        {formData.certification?.map((cert, idx) => (
                          <div key={idx} className="card bg-base-100 p-4 border border-base-300">
                            {/* Name */}
                            <div className="space-y-2">
                              <label className="label">Certification Name</label>
                              <input
                                className="input input-bordered w-full"
                                value={cert.name}
                                onChange={(e) => updateNestedItem("certification", idx, "name", e.target.value)}
                                placeholder="AWS Solutions Architect"
                              />
                            </div>

                            {/* Issuer */}
                            <div className="space-y-2 mt-2">
                              <label className="label">Issuer</label>
                              <input
                                className="input input-bordered w-full"
                                value={cert.issuer}
                                onChange={(e) => updateNestedItem("certification", idx, "issuer", e.target.value)}
                                placeholder="Amazon Web Services"
                              />
                            </div>

                            {/* Issue Date */}
                            <div className="space-y-2 mt-2">
                              <label className="label">Issue Date</label>
                              <input
                                type="date"
                                className="input input-bordered w-full"
                                value={cert.issueDate}
                                onChange={(e) => updateNestedItem("certification", idx, "issueDate", e.target.value)}
                              />
                            </div>

                            {/* Link */}
                            <div className="space-y-2 mt-2">
                              <label className="label">Certificate URL</label>
                              <input
                                className="input input-bordered w-full"
                                value={cert.link}
                                onChange={(e) => updateNestedItem("certification", idx, "link", e.target.value)}
                                placeholder="https://credential.net/xyz"
                              />
                            </div>

                            <div className="flex justify-end mt-3 pt-3 border-t border-base-300">
                              <button
                                type="button"
                                onClick={() => removeItem('certification', idx)}
                                className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                              >
                                <Trash2 className="w-4 h-4" /> Remove
                              </button>
                            </div>
                          </div>
                        ))}

                        {(!formData.certification || formData.certification.length === 0) && (
                          <div className="text-center text-base-content/60 py-8">
                            No certifications added yet.
                          </div>
                        )}
                        
                        {/* Add Button at Bottom */}
                        <button
                          type="button"
                          disabled={
                            formData.certification.length > 0 &&
                            isObjectEmpty(formData.certification[formData.certification.length - 1])
                          }
                          className="btn btn-primary w-full mt-4"
                          onClick={() => addItem('certification', { ...initialCertification })}
                        >
                          <Plus className="w-4 h-4" /> Add Certification
                        </button>
                      </div>
                    )}
                  </section>
                );
              }

              if (sectionKey === "customSections") {
                return (
                  <section
                    key="customSections"
                    className="card bg-base-200 p-6"
                    draggable
                    onDragStart={(e) => handleSectionDragStart(e, "customSections")}
                    onDragOver={handleSectionDragOver}
                    onDrop={(e) => handleSectionDrop(e, "customSections")}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleSection("customSections")
                      }
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-base-content/50 cursor-grab" />
                        <h3 className="text-lg font-semibold text-base-content">
                          Custom Sections
                        </h3>
                      </div>

                      {expandedSections.customSections ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    {expandedSections.customSections && (
                      <div className="mt-4 space-y-4">
                        {formData.customSections?.map((field, idx) => (
                          <div
                            key={idx}
                            className="card bg-base-100 p-4 border border-base-300"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="label">Field Name</label>
                                <input
                                  className="input input-bordered w-full"
                                  value={field.fieldName}
                                  onChange={(e) =>
                                    updateNestedItem(
                                      "customSections",
                                      idx,
                                      "fieldName",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div>
                                <label className="label">Field Type</label>
                                <select
                                  className="select select-bordered w-full"
                                  value={field.fieldType}
                                  onChange={(e) =>
                                    updateNestedItem(
                                      "customSections",
                                      idx,
                                      "fieldType",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="text">Text</option>
                                  <option value="textarea">Textarea</option>
                                  <option value="url">URL</option>
                                  <option value="date">Date</option>
                                  <option value="select">Dropdown</option>
                                </select>
                              </div>
                            </div>

                            {field.fieldType === "select" && (
                              <div className="mt-3">
                                <label className="label">Options</label>
                                <input
                                  className="input input-bordered w-full"
                                  value={field.fieldOptions.join(", ")}
                                  onChange={(e) =>
                                    updateNestedItem(
                                      "customSections",
                                      idx,
                                      "fieldOptions",
                                      e.target.value.split(",").map((o) => o.trim())
                                    )
                                  }
                                  placeholder="Option 1, Option 2"
                                />

                                <label className="label mt-2">Selected</label>
                                <select
                                  className="select select-bordered w-full"
                                  value={field.fieldValue}
                                  onChange={(e) =>
                                    updateNestedItem(
                                      "customSections",
                                      idx,
                                      "fieldValue",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">-- Select --</option>
                                  {field.fieldOptions.map((opt, i) => (
                                    <option key={i} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {field.fieldType !== "select" && (
                              <div className="mt-3">
                                <label className="label">Value</label>

                                {field.fieldType === "textarea" ? (
                                  <textarea
                                    className="textarea textarea-bordered w-full"
                                    rows={4}
                                    value={field.fieldValue}
                                    onChange={(e) =>
                                      updateNestedItem(
                                        "customSections",
                                        idx,
                                        "fieldValue",
                                        e.target.value
                                      )
                                    }
                                  />
                                ) : (
                                  <input
                                    type={field.fieldType}
                                    className="input input-bordered w-full"
                                    value={field.fieldValue}
                                    onChange={(e) =>
                                      updateNestedItem(
                                        "customSections",
                                        idx,
                                        "fieldValue",
                                        e.target.value
                                      )
                                    }
                                  />
                                )}
                              </div>
                            )}

                            <div className="flex justify-end mt-3 pt-3 border-t border-base-300">
                              <button
                                type="button"
                                onClick={() =>
                                  removeItem("customSections", idx)
                                }
                                className="btn btn-ghost btn-sm text-error"
                              >
                                <Trash2 className="w-4 h-4" /> Remove
                              </button>
                            </div>
                          </div>
                        ))}

                        {formData.customSections?.length === 0 && (
                          <div className="text-center text-base-content/60 py-8">
                            No custom sections added yet.
                          </div>
                        )}
                        
                        {/* Add Button at Bottom */}
                        <button
                          type="button"
                          className="btn btn-primary w-full mt-4"
                          onClick={() =>
                            addItem("customSections", {
                              fieldName: "",
                              fieldType: "text",
                              fieldValue: "",
                              fieldOptions: [],
                            })
                          }
                        >
                          <Plus className="w-4 h-4" /> Add Custom Section
                        </button>
                      </div>
                    )}
                  </section>
                );
              }
              return null;
            })}
            {/* === Upload Progress === */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-4">
                <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1 text-base-content/60">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}


            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-base-300">
              <button
                type="button"
                onClick={handleCloseRequest}
                className="btn btn-ghost"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileFormModal;
