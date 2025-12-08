import { Schema, model, models } from 'mongoose';

// ---- Education Schema ----
const EducationSchema = new Schema(
    {
        institution: { type: String },
        degree: { type: String },
        fieldOfStudy: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        grade: { type: String },
        description: { type: String },
        order: { type: Number, default: 0 }
    },
    { _id: true }
);

// ---- Experience Schema ----
const ExperienceSchema = new Schema(
    {
        company: { type: String },
        position: { type: String },
        location: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        description: { type: String },
        technologies: { type: String }, // Comma-separated technologies string
        order: { type: Number, default: 0 }
    },
    { _id: true }
);

// ---- Project Schema ----
const ProjectSchema = new Schema(
    {
        name: { type: String },
        description: { type: String },
        link: { type: String },
        github: { type: String },
        technologies: { type: String }, // Comma-separated technologies string
        startDate: { type: Date },
        endDate: { type: Date },
        order: { type: Number, default: 0 }
    },
    { _id: true }
);

// ---- Skill Schema ----
const SkillSchema = new Schema(
    {
        header: { type: String },
        skills: { type: String }, // Comma-separated skills string
        order: { type: Number, default: 0 }
    },
    { _id: true }
);

// ---- Certification Schema ----
const CertificationSchema = new Schema(
    {
        name: { type: String },
        issuer: { type: String },
        issueDate: { type: Date },
        link: { type: String },
        order: { type: Number, default: 0 }
    },
    { _id: true }
);

// ------------------------------------------------------
// 🔥 CUSTOM USER-DEFINED MODULE SCHEMA
// ------------------------------------------------------

const CustomFieldDefinitionSchema = new Schema(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['string', 'number', 'date', 'boolean', 'array', 'object'],
            required: true
        }
    },
    { _id: false }
);

const CustomItemSchema = new Schema(
    {
        order: { type: Number, default: 0 },

        fields: { type: Schema.Types.Mixed }
    },
    { _id: true }
);

const CustomSectionSchema = new Schema(
    {
        name: { type: String, required: true }, // only required field
        label: { type: String },
        order: { type: Number, default: 0 },

        fieldsSchema: [CustomFieldDefinitionSchema],
        items: [CustomItemSchema]
    },
    { _id: true }
);

const personalSchema = new Schema(
    {
        name: { type: String },
        avatar: {
        url: String,
        originalName: String,
        mimetype: String,
        publicId: String,
        resourceType: String
    },
        bio: { type: String },
        designation : {type : String},
        location: { type: String },
        website: { type: String },
        email: { type: String },
        phone: { type: String },
        github: { type: String },
        linkedin: { type: String },
        twitter: { type: String },
    },
    { _id: true }
)

// ------------------------------------------------------
// 🔥 MAIN PROFILE SCHEMA
// ------------------------------------------------------

const ProfileSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        personal: {
            type: personalSchema,
            default: {}
        },
        education: [EducationSchema],
        experience: [ExperienceSchema],
        projects: [ProjectSchema],
        skills: [SkillSchema],
        certification: [CertificationSchema],

        customSections: [CustomSectionSchema],

        sectionOrder: {
            type: [String],
            default: [
                'personal',
                'education',
                'experience',
                'projects',
                'skills',
                'certification',
                'customSections'
            ]
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ---- Virtuals ----
ProfileSchema.virtual('userInfo', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true,
});

// ---- Export ----
const Profile = models.Profile || model('Profile', ProfileSchema);
module.exports = Profile;
