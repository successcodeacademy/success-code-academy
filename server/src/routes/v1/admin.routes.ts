import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { ADMIN_ROLES, SUPER_ADMIN } from '../../config/roles';
import { passwordResetLimiter } from '../../middlewares/rateLimiter';
import { activityLogger } from '../../middlewares/activityLogger';
import {
  adminListQuerySchema,
  activityListQuerySchema,
  leadExportQuerySchema,
  bannerCreateSchema,
  bannerUpdateSchema,
  idParamsSchema,
  notificationCreateSchema,
  notificationUpdateSchema,
  newsCreateSchema,
  newsUpdateSchema,
  videoCreateSchema,
  videoUpdateSchema,
  resultCreateSchema,
  resultListQuerySchema,
  resultUpdateSchema,
  settingsUpdateSchema,
  starCreateSchema,
  starUpdateSchema,
  uploadQuerySchema,
  pageContentParamsSchema,
  contentBlockParamsSchema,
  contentBlockUpdateSchema,
  mediaHistoryParamsSchema,
  mediaResourceParamsSchema,
  mediaRestoreParamsSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminAccountCreateSchema,
  adminAccountUpdateSchema,
  adminCreateCourseFormSchema,
  adminUpdateCourseFormSchema,
  adminCreateScholarshipFormSchema,
  adminUpdateScholarshipFormSchema,
  adminCreateContactMessageSchema,
  adminUpdateContactMessageSchema,
  courseCreateSchema,
  courseUpdateSchema,
  adminActivityLogQuerySchema,
} from '../../validation/admin.schemas';

const router = Router();

/*
 * Authorization model for this router
 * -----------------------------------
 * Every route below requires a verified admin-purpose session. On top of that:
 *
 *   GET / PUT     — both roles. A standard administrator reads and updates
 *                   existing records.
 *   POST / DELETE — `superAdminOnly`. Creating and deleting records is
 *                   reserved for a super administrator.
 *   /database/admins — `superAdminOnly` on every verb, including GET. Managing
 *                   who can sign in is never visible to a standard admin.
 *
 * The guards are attached per route rather than assumed by the dashboard, so
 * a hand-crafted request to the API is refused exactly like a hidden button.
 */
router.use(authenticate);
router.use(authorize(...ADMIN_ROLES));
router.use(activityLogger);

const superAdminOnly = authorize(SUPER_ADMIN);

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats);

/*
 * Uploads back the *update* of an existing record as often as the creation of
 * a new one (replacing a banner image, swapping a student photo), so both roles
 * may obtain an upload URL. The uploaded file only becomes public content
 * through a POST or PUT that is itself authorized above.
 */
router.post('/upload/signed-url', adminController.getSignedUploadUrl);

// Image Upload (Legacy/Memory)
router.post(
  '/upload',
  validate(uploadQuerySchema, 'query'),
  adminController.upload,
  adminController.uploadImage,
);

// Banners
router.get('/banners', adminController.getBanners);
router.post(
  '/banners',
  superAdminOnly,
  validate(bannerCreateSchema),
  adminController.createBanner,
);
router.put(
  '/banners/:id',
  validate(idParamsSchema, 'params'),
  validate(bannerUpdateSchema),
  adminController.updateBanner,
);
router.delete(
  '/banners/:id',
  superAdminOnly,
  validate(idParamsSchema, 'params'),
  adminController.deleteBanner,
);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.post(
  '/notifications',
  superAdminOnly,
  validate(notificationCreateSchema),
  adminController.createNotification,
);
router.put(
  '/notifications/:id',
  validate(idParamsSchema, 'params'),
  validate(notificationUpdateSchema),
  adminController.updateNotification,
);
router.delete(
  '/notifications/:id',
  superAdminOnly,
  validate(idParamsSchema, 'params'),
  adminController.deleteNotification,
);

// Star Students
router.get('/stars', adminController.getStarStudents);
router.post(
  '/stars',
  superAdminOnly,
  validate(starCreateSchema),
  adminController.createStarStudent,
);
router.put(
  '/stars/:id',
  validate(idParamsSchema, 'params'),
  validate(starUpdateSchema),
  adminController.updateStarStudent,
);
router.delete(
  '/stars/:id',
  superAdminOnly,
  validate(idParamsSchema, 'params'),
  adminController.deleteStarStudent,
);

// Results Management
router.get(
  '/results',
  validate(resultListQuerySchema, 'query'),
  adminController.getResults,
);
router.post(
  '/results',
  superAdminOnly,
  validate(resultCreateSchema),
  adminController.createResult,
);
router.put(
  '/results/:id',
  validate(idParamsSchema, 'params'),
  validate(resultUpdateSchema),
  adminController.updateResult,
);
router.delete(
  '/results/:id',
  superAdminOnly,
  validate(idParamsSchema, 'params'),
  adminController.deleteResult,
);

// News Articles
router.get('/news', adminController.getNewsArticles);
router.post(
  '/news',
  superAdminOnly,
  validate(newsCreateSchema),
  adminController.createNewsArticle,
);
router.put(
  '/news/:id',
  validate(idParamsSchema, 'params'),
  validate(newsUpdateSchema),
  adminController.updateNewsArticle,
);
router.delete(
  '/news/:id',
  superAdminOnly,
  validate(idParamsSchema, 'params'),
  adminController.deleteNewsArticle,
);

// Academy Videos
router.get('/videos', adminController.getAcademyVideos);
router.post(
  '/videos',
  superAdminOnly,
  validate(videoCreateSchema),
  adminController.createAcademyVideo,
);
router.put(
  '/videos/:id',
  validate(idParamsSchema, 'params'),
  validate(videoUpdateSchema),
  adminController.updateAcademyVideo,
);
router.delete(
  '/videos/:id',
  superAdminOnly,
  validate(idParamsSchema, 'params'),
  adminController.deleteAcademyVideo,
);

// Courses
router.get('/courses', adminController.getCourses);
router.post(
  '/courses',
  superAdminOnly,
  validate(courseCreateSchema),
  adminController.createCourse,
);
router.put(
  '/courses/:id',
  validate(idParamsSchema, 'params'),
  validate(courseUpdateSchema),
  adminController.updateCourse,
);
router.delete(
  '/courses/:id',
  superAdminOnly,
  validate(idParamsSchema, 'params'),
  adminController.deleteCourse,
);

// Media history and rollback. Reading history is harmless, but restoring a
// revision re-creates a record that was deleted, so it counts as a create.
router.get(
  '/history/:resourceType',
  validate(mediaResourceParamsSchema, 'params'),
  adminController.getMediaHistory,
);
router.get(
  '/history/:resourceType/:id',
  validate(mediaHistoryParamsSchema, 'params'),
  adminController.getMediaHistory,
);
router.post(
  '/history/:resourceType/:id/:revisionId/restore',
  superAdminOnly,
  validate(mediaRestoreParamsSchema, 'params'),
  adminController.restoreMediaRevision,
);

// Site Settings. Read and update only — there is nothing to create or delete.
router.get('/settings', adminController.getSettings);
router.put('/settings', validate(settingsUpdateSchema), adminController.updateSettings);

// On-page visual editor. Deleting an override restores the code default, which
// discards saved content, so it is treated as a delete.
router.get(
  '/page-content/:pageKey',
  validate(pageContentParamsSchema, 'params'),
  adminController.getPageContent,
);
router.put(
  '/page-content/:pageKey/:contentKey',
  validate(contentBlockParamsSchema, 'params'),
  validate(contentBlockUpdateSchema),
  adminController.updateContentBlock,
);
router.delete(
  '/page-content/:pageKey/:contentKey',
  superAdminOnly,
  validate(contentBlockParamsSchema, 'params'),
  adminController.deleteContentBlock,
);

// Database Viewers / Leads
router.get(
  '/database/users',
  validate(adminListQuerySchema, 'query'),
  adminController.getUsers,
);
router.get(
  '/database/admins',
  superAdminOnly,
  validate(adminListQuerySchema, 'query'),
  adminController.getAdminAccounts,
);
router.get(
  '/database/course-forms',
  validate(adminListQuerySchema, 'query'),
  adminController.getCourseForms,
);
router.get(
  '/database/scholarship-forms',
  validate(adminListQuerySchema, 'query'),
  adminController.getScholarshipForms,
);
router.get(
  '/database/contact-messages',
  validate(adminListQuerySchema, 'query'),
  adminController.getContactMessages,
);
router.get(
  '/leads',
  validate(adminListQuerySchema, 'query'),
  adminController.searchLeads,
);
router.get(
  '/activity',
  validate(activityListQuerySchema, 'query'),
  adminController.getDashboardActivity,
);
router.get(
  '/activity-logs',
  validate(adminActivityLogQuerySchema, 'query'),
  adminController.getAdminActivityLogs,
);
router.get(
  '/activity-logs/export.csv',
  validate(adminActivityLogQuerySchema.omit({ page: true, limit: true }), 'query'),
  adminController.exportAdminActivityLogs,
);
router.get(
  '/database/export.csv',
  validate(leadExportQuerySchema, 'query'),
  adminController.exportLeadCsv,
);

// Database Management mutations
router.post('/database/users', superAdminOnly, validate(adminCreateUserSchema), adminController.createUser);
router.put('/database/users/:id', validate(idParamsSchema, 'params'), validate(adminUpdateUserSchema), adminController.updateUser);
router.delete('/database/users/:id', superAdminOnly, validate(idParamsSchema, 'params'), adminController.deleteUser);

// Administrator accounts. Super administrators only, on every verb: this is
// the endpoint that decides who can sign in and at what privilege level, so a
// standard admin must not even be able to enumerate it. Passwords are set once
// at creation and afterwards rotated only through a single-use reset link.
router.post('/database/admins', superAdminOnly, validate(adminAccountCreateSchema), adminController.createAdminAccount);
router.put('/database/admins/:id', superAdminOnly, validate(idParamsSchema, 'params'), validate(adminAccountUpdateSchema), adminController.updateAdminAccount);
router.delete('/database/admins/:id', superAdminOnly, validate(idParamsSchema, 'params'), adminController.deleteAdminAccount);
router.post(
  '/database/admins/:id/password-reset',
  superAdminOnly,
  validate(idParamsSchema, 'params'),
  adminController.sendAdminPasswordReset,
);
router.post(
  '/request-password-reset',
  passwordResetLimiter,
  adminController.requestSelfPasswordReset,
);

router.post('/database/course-forms', superAdminOnly, validate(adminCreateCourseFormSchema), adminController.createCourseForm);
router.put('/database/course-forms/:id', validate(idParamsSchema, 'params'), validate(adminUpdateCourseFormSchema), adminController.updateCourseForm);
router.delete('/database/course-forms/:id', superAdminOnly, validate(idParamsSchema, 'params'), adminController.deleteCourseForm);

router.post('/database/scholarship-forms', superAdminOnly, validate(adminCreateScholarshipFormSchema), adminController.createScholarshipForm);
router.put('/database/scholarship-forms/:id', validate(idParamsSchema, 'params'), validate(adminUpdateScholarshipFormSchema), adminController.updateScholarshipForm);
router.delete('/database/scholarship-forms/:id', superAdminOnly, validate(idParamsSchema, 'params'), adminController.deleteScholarshipForm);

router.post('/database/contact-messages', superAdminOnly, validate(adminCreateContactMessageSchema), adminController.createContactMessage);
router.put('/database/contact-messages/:id', validate(idParamsSchema, 'params'), validate(adminUpdateContactMessageSchema), adminController.updateContactMessage);
router.delete('/database/contact-messages/:id', superAdminOnly, validate(idParamsSchema, 'params'), adminController.deleteContactMessage);

// Scholarship Programs (content management)
router.get('/scholarship-programs', adminController.getScholarshipPrograms);
router.post('/scholarship-programs', superAdminOnly, adminController.createScholarshipProgram);
router.put('/scholarship-programs/:id', validate(idParamsSchema, 'params'), adminController.updateScholarshipProgram);
router.delete('/scholarship-programs/:id', superAdminOnly, validate(idParamsSchema, 'params'), adminController.deleteScholarshipProgram);

export default router;
