import { z } from 'zod';
import { ADMIN, ADMIN_ROLES } from '../config/roles';

const imageLocation = z
  .string()
  .trim()
  .min(1, 'An image is required')
  .max(2048)
  .refine(
    (value) =>
      value.startsWith('/') ||
      /^https:\/\/[^\s]+$/i.test(value),
    'Use a local image path or an HTTPS image URL',
  );

const optionalLink = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) =>
      value === '' ||
      value.startsWith('/') ||
      /^https:\/\/[^\s]+$/i.test(value),
    'Use a local path or an HTTPS URL',
  )
  .optional();

const orderIndex = z.coerce.number().int().min(0).max(10000).default(0);

export const idParamsSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict();

export const mediaResourceParamsSchema = z
  .object({
    resourceType: z.enum(['banner', 'star', 'result', 'news', 'video']),
  })
  .strict();

export const mediaHistoryParamsSchema = mediaResourceParamsSchema
  .extend({
    id: z.coerce.number().int().positive(),
  })
  .strict();

export const mediaRestoreParamsSchema = mediaHistoryParamsSchema
  .extend({
    revisionId: z.coerce.number().int().positive(),
  })
  .strict();

export const uploadQuerySchema = z
  .object({
    type: z.enum(['banner', 'star', 'result', 'uploads', 'news', 'video']).default('uploads'),
  })
  .strict();

export const bannerCreateSchema = z
  .object({
    type: z.enum(['HOME', 'RESULTS']),
    image: imageLocation,
    altText: z.string().trim().min(2).max(180),
    targetUrl: optionalLink,
    isActive: z.boolean().default(true),
    orderIndex,
  })
  .strict();

export const bannerUpdateSchema = bannerCreateSchema.partial().strict();

export const notificationCreateSchema = z
  .object({
    text: z.string().trim().min(2).max(280),
    link: optionalLink,
    icon: z.string().trim().max(100).optional(),
    isActive: z.boolean().default(true),
    orderIndex,
  })
  .strict();

export const notificationUpdateSchema =
  notificationCreateSchema.partial().strict();

export const starCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    score: z.string().trim().min(1).max(60),
    rank: z.string().trim().min(1).max(80),
    course: z.string().trim().min(2).max(160),
    year: z.string().trim().min(2).max(40),
    image: imageLocation,
    colorHex: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex colour'),
    isActive: z.boolean().default(true),
    orderIndex,
  })
  .strict();

export const starUpdateSchema = starCreateSchema.partial().strict();

export const resultCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    image: imageLocation,
    year: z.coerce.number().int().min(2000).max(2100),
    college: z.string().trim().max(180).optional(),
    city: z.string().trim().max(120).optional(),
    marks: z.coerce.number().int().min(0).max(720).optional(),
    isActive: z.boolean().default(true),
    orderIndex,
  })
  .strict();

export const resultUpdateSchema = resultCreateSchema.partial().strict();

export const newsCreateSchema = z
  .object({
    category: z.string().trim().min(2).max(100),
    title: z.string().trim().min(2).max(200),
    shortTitle: z.string().trim().max(100).optional(),
    excerpt: z.string().trim().min(2).max(500),
    date: z.string().trim().min(2).max(40),
    author: z.string().trim().min(2).max(100),
    readTime: z.string().trim().min(2).max(40),
    image: imageLocation,
    slug: z.string().trim().min(2).max(200),
    externalUrl: optionalLink,
    isActive: z.boolean().default(true),
    orderIndex,
  })
  .strict();

export const newsUpdateSchema = newsCreateSchema.partial().strict();

export const videoCreateSchema = z
  .object({
    category: z.string().trim().min(2).max(100),
    title: z.string().trim().min(2).max(200),
    excerpt: z.string().trim().min(2).max(500),
    date: z.string().trim().min(2).max(40),
    duration: z.string().trim().min(2).max(20),
    image: imageLocation,
    videoUrl: z.string().trim().min(2).max(2048),
    isActive: z.boolean().default(true),
    orderIndex,
  })
  .strict();

export const videoUpdateSchema = videoCreateSchema.partial().strict();

export const courseCreateSchema = z
  .object({
    slug: z.string().trim().min(2).max(100),
    category: z.enum(['freshers', 'repeaters', 'test-series']),
    type: z.string().trim().min(2).max(100),
    badge: z.string().trim().min(2).max(100),
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().min(2).max(2000),
    highlights: z.array(z.string().trim().min(1).max(200)),
    isActive: z.boolean().default(true),
  })
  .strict();

export const courseUpdateSchema = courseCreateSchema.partial().strict();

export const settingsUpdateSchema = z
  .object({
    phone: z.string().trim().max(40).optional(),
    email: z.union([z.literal(''), z.string().trim().email()]).optional(),
    address1: z.string().trim().max(500).optional(),
    address2: z.string().trim().max(500).optional(),
    // Keep accepting the legacy combined address setting used by existing
    // admin clients and stored settings payloads.
    address: z.string().trim().max(1000).optional(),
    whatsapp: z.string().trim().max(2048).optional(),
    facebook: optionalLink,
    instagram: optionalLink,
    youtube: optionalLink,
    linkedin: optionalLink,
    twitter: optionalLink,
    notification_recipients: z.string().trim().max(4000).refine(
      (value) => value.length > 0 && value.split(/[\s,;]+/).every((email) => z.string().email().safeParse(email).success),
      'Provide one or more valid email addresses separated by commas, spaces, semicolons, or new lines',
    ).optional(),
    page_banner_scholarships: optionalLink,
    page_banner_contact: optionalLink,
    page_banner_results: optionalLink,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one setting to update',
  });

// These are intentionally separate from settingsUpdateSchema. Notification
// configuration is mounted under /admin/notifications, not /admin/settings.
export const notificationSettingsSchema = z
  .object({ enabled: z.boolean() })
  .strict();

export const notificationSubscriptionSchema = z
  .object({
    endpoint: z.string().url().max(2048),
    expirationTime: z.number().finite().nullable().optional(),
    keys: z
      .object({
        p256dh: z.string().min(16).max(500),
        auth: z.string().min(8).max(500),
      })
      .strict(),
  })
  .strict();

export const notificationUnsubscribeSchema = z
  .object({ endpoint: z.string().url().max(2048) })
  .strict();

export const notificationIdParamsSchema = z
  .object({ id: z.coerce.number().finite().int().positive() })
  .strict();

export const notificationAdminIdParamsSchema = z
  .object({ adminId: z.coerce.number().finite().int().positive() })
  .strict();

// Notification controls are deliberately kept off the site-settings schema.
// The global browser notification switch is updated through
// `/admin/notifications/settings` with `{ enabled: boolean }` instead.

export const adminListQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional().default(''),
    cursor: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    'page-size': z.coerce.number().int().min(1).max(100).optional(),
    page: z.coerce.number().int().positive().optional(),
    sortBy: z.enum([
      'id', 'createdAt', 'updatedAt', 'name', 'firstName', 'email',
      'courseTitle', 'preferredCourse', 'city', 'studentClass', 'title',
      'category', 'type', 'isActive',
    ]).optional(),
    sortDirection: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    course: z.string().trim().max(200).optional(),
    program: z.string().trim().max(200).optional(),
    class: z.string().trim().max(100).optional(),
    city: z.string().trim().max(120).optional(),
    school: z.string().trim().max(200).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    type: z.string().trim().max(100).optional(),
    year: z.coerce.number().int().min(2000).max(2100).optional(),
  })
  .strict();

const activityType = z.enum(['student', 'course-form', 'scholarship-form', 'contact-message']);

export const activityListQuerySchema = adminListQuerySchema
  .omit({ cursor: true, isActive: true, year: true })
  .extend({
    category: activityType.optional(),
    // `type` is retained as an alias for callers that name the category filter type.
    type: activityType.optional(),
    sortBy: z.enum(['id', 'createdAt', 'name', 'email', 'course', 'program', 'city']).optional(),
  })
  .strict();

export const leadExportQuerySchema = activityListQuerySchema
  .omit({ page: true, limit: true, 'page-size': true })
  .extend({
    resource: z.enum(['all', 'users', 'course-forms', 'scholarship-forms', 'contact-messages', 'activity']).default('all'),
  })
  .strict();

export const adminActivityLogQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(''),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(25),
  sortBy: z.enum(['createdAt', 'adminEmail', 'adminRole', 'action', 'resource']).optional().default('createdAt'),
  sortDirection: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional().default('desc'),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  adminId: z.coerce.number().int().positive().optional(),
  role: z.enum(['admin', 'super-admin']).optional(),
  action: z.string().trim().max(40).optional(),
  resource: z.string().trim().max(80).optional(),
}).strict();

export const resultListQuerySchema = z
  .object({
    year: z.coerce.number().int().min(2000).max(2100).optional(),
  })
  .strict();

const contentIdentifier = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(
    /^[a-z0-9][a-z0-9._:-]*$/,
    'Use lowercase letters, numbers, dots, dashes, underscores, or colons',
  );

export const pageContentParamsSchema = z
  .object({
    pageKey: contentIdentifier,
  })
  .strict();

export const contentBlockParamsSchema = z
  .object({
    pageKey: contentIdentifier,
    contentKey: contentIdentifier,
  })
  .strict();

export const contentBlockUpdateSchema = z
  .object({
    kind: z.enum(['text', 'multiline']).default('text'),
    value: z.string().max(20_000),
  })
  .strict();
// Student accounts never hold a password: sign-in is mobile number + OTP.
// `.strict()` makes a stray `password` or `role` an explicit 400 rather than a
// silently ignored field.
export const adminCreateUserSchema = z
  .object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    mobileNumber: z.string().trim().min(10).max(15),
    email: z.string().email(),
    age: z.coerce.number().int().min(5).max(100),
  })
  .strict();

export const adminUpdateUserSchema = adminCreateUserSchema.partial().strict();

// Administrator accounts live in the separate `admins` table and do hold a
// password. Rotation happens through a reset link, never by typing a new
// password into this form, so update has no password field at all.
//
// `role` is a closed enum and defaults to the restricted level, so an omitted
// or misspelled value can never produce a super administrator by accident.
// These endpoints are already limited to super administrators by the router.
export const adminAccountCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().toLowerCase().email(),
    mobileNumber: z.string().trim().regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
    password: z.string().min(6).max(128),
    role: z.enum(ADMIN_ROLES).default(ADMIN),
  })
  .strict();

export const adminAccountUpdateSchema = adminAccountCreateSchema
  .omit({ password: true, role: true })
  .partial()
  // Spelled out rather than left to `.partial()`: an absent role must mean
  // "leave the current level alone", not "reset it to the default".
  .extend({ role: z.enum(ADMIN_ROLES).optional() })
  .strict();

export const adminCreateCourseFormSchema = z
  .object({
    studentName: z.string().trim().min(1),
    courseTitle: z.string().trim().min(1),
    studentEmail: z.string().trim().email(),
    studentPhone: z.string().trim().min(10).max(15),
    visitingDate: z.string().trim().min(1),
    visitingTime: z.string().trim().min(1),
  })
  .strict();

export const adminUpdateCourseFormSchema = adminCreateCourseFormSchema.partial().strict();

export const adminCreateScholarshipFormSchema = z
  .object({
    studentName: z.string().trim().min(1),
    studentPhone: z.string().trim().min(10).max(15),
    parentPhone: z.string().trim().min(10).max(15),
    studentClass: z.string().trim().min(1),
    schoolName: z.string().trim().min(1),
    city: z.string().trim().min(1),
    preferredCourse: z.string().trim().min(1),
  })
  .strict();

export const adminUpdateScholarshipFormSchema = adminCreateScholarshipFormSchema.partial().strict();

export const adminCreateContactMessageSchema = z
  .object({
    name: z.string().trim().min(1),
    email: z.string().email(),
    phone: z.string().trim().min(10).max(15),
    message: z.string().trim().min(1),
  })
  .strict();

export const adminUpdateContactMessageSchema = adminCreateContactMessageSchema.partial().strict();
