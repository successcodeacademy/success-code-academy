# Graph Report - Success-Code-Academy  (2026-09-06)

## Corpus Check
- 279 files · ~3,764,696 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1607 nodes · 2969 edges · 193 communities (130 shown, 63 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `84fa1f82`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin.routes.ts
- admin/layout.tsx
- analytics/page.tsx
- admin.controller.ts
- home.ts
- devDependencies
- server/package.json
- emailTemplates.ts
- scripts
- dependencies
- faq-data.ts
- useToast
- BannerEditor.tsx
- compilerOptions
- AdminContentManager.tsx
- Backend Foundation — Complete File-by-File Summary
- EditableText.tsx
- AcademyInsights.tsx
- HomeClient.tsx
- compilerOptions
- admin/page.tsx
- ResultsClient.tsx
- Banner.ts
- dependencies
- MediaRevision.ts
- content.routes.ts
- environment.ts
- admin/[...path]/route.ts
- Success Code Academy NEET Coaching Website - Project Master Context
- seedDatabase.ts
- models/index.ts
- getListOptions
- opencode.json
- Writing Guidelines for Postgres References
- replacePaths.js
- public/[...path]/route.ts
- app/layout.tsx
- config/roles.ts
- [pageKey]/route.ts
- SettingsEditor.tsx
- notification.routes.ts
- 🏆 Success Code Academy — Master Project Documentation
- adminApiFetch
- 11. Website Pages & Features
- express
- EditModeContext.tsx
- AdmissionsClient.tsx
- test-render.js
- Card.tsx
- TopperResult.ts
- CourseDetailClient.tsx
- IconButton.tsx
- PageHeader.tsx
- SectionHeading.tsx
- middleware.ts
- graphify.js
- @types/jsonwebtoken
- 5. Frontend — `client/`
- environment.d.ts
- express.d.ts
- test-db.js
- eslint.config.mjs
- next.config.ts
- Section Definitions
- Success Code Academy Admin Guide
- [1.2.0](https://github.com/supabase/agent-skills/compare/v1.1.1...v1.2.0) (2026-06-02)
- Supabase Postgres Best Practices
- 5.3 Scholarships Page
- 14. Implementation Phases
- 2.2 Core Technology Stack
- 5.5 Student Hub
- check.js
- notification.controller.ts
- client/README.md
- 12. Forms, Leads & Conversion Rules
- 13. Payment & Access Control
- 15. Development Standards
- 5.2 Courses Page
- 5.4 Test Series Page
- 9. Backend Modules & Data Models
- 17. Environment Variables
- 5.7 Blogs & Reviews
- 7. Student Login Portal
- 8. Admin / CMS Requirements
- AGENTS.md
- rules/graphify.md
- advanced-full-text-search.md
- advanced-jsonb-indexing.md
- conn-idle-timeout.md
- conn-limits.md
- conn-pooling.md
- conn-prepared-statements.md
- data-batch-inserts.md
- data-n-plus-one.md
- data-pagination.md
- data-upsert.md
- lock-advisory.md
- lock-deadlock-prevention.md
- lock-short-transactions.md
- lock-skip-locked.md
- monitor-explain-analyze.md
- monitor-pg-stat-statements.md
- monitor-vacuum-analyze.md
- query-composite-indexes.md
- query-covering-indexes.md
- query-index-types.md
- query-missing-indexes.md
- query-partial-indexes.md
- schema-constraints.md
- schema-data-types.md
- schema-foreign-key-indexes.md
- schema-lowercase-identifiers.md
- schema-partitioning.md
- schema-primary-keys.md
- security-privileges.md
- security-rls-basics.md
- security-rls-performance.md
- _template.md
- workflows/graphify.md
- client/AGENTS.md
- 12. Design System & Branding
- 18. Getting Started — Local Development
- 8. API Routes & Endpoints
- 10. Admin Panel & Visual Website Editor
- 19. Development Standards & Security
- 7. Database — Models & Migrations
- 9. Authentication & Authorization
- 13. SEO & Performance
- 14. Deployment & Infrastructure
- 3. Technology Stack
- 6. Backend — `server/`
- recordMediaRevision
- jsonwebtoken
- assertNotLastSuperAdmin
- logout/route.ts
- form.controller.ts
- getSupabase
- api.ts
- pg
- resend
- v1/index.ts
- 17. Environment Variables Reference
- cors
- auth.controller.ts
- @types/node
- form.routes.ts
- helmet
- exportLeadCsv
- auth.routes.ts
- mailer.ts
- ContentBlock.ts
- express-rate-limit
- @types/bcrypt
- @types/web-push
- web-push
- winston
- zod

## God Nodes (most connected - your core abstractions)
1. `useToast()` - 71 edges
2. `adminApiFetch()` - 61 edges
3. `Success Code Academy NEET Coaching Website - Project Master Context` - 32 edges
4. `sendMail()` - 23 edges
5. `🏆 Success Code Academy — Master Project Documentation` - 22 edges
6. `useEditModeOptional()` - 21 edges
7. `compilerOptions` - 20 edges
8. `useConfirm()` - 19 edges
9. `isAdminRole()` - 18 edges
10. `EditableText()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `createCourseForm` --calls--> `publishAdminNotification()`  [EXTRACTED]
  server/src/controllers/admin.controller.ts → server/src/utils/notificationPublisher.ts
- `createScholarshipForm` --calls--> `publishAdminNotification()`  [EXTRACTED]
  server/src/controllers/admin.controller.ts → server/src/utils/notificationPublisher.ts
- `createContactMessage` --calls--> `publishAdminNotification()`  [EXTRACTED]
  server/src/controllers/admin.controller.ts → server/src/utils/notificationPublisher.ts
- `AdmissionsClient()` --calls--> `useEditModeOptional()`  [EXTRACTED]
  client/src/app/(main)/admissions/AdmissionsClient.tsx → client/src/components/admin/EditModeContext.tsx
- `AdmissionsClient()` --calls--> `useToast()`  [EXTRACTED]
  client/src/app/(main)/admissions/AdmissionsClient.tsx → client/src/components/admin/Toast.tsx

## Import Cycles
- None detected.

## Communities (193 total, 63 thin omitted)

### Community 0 - "admin.routes.ts"
Cohesion: 0.08
Nodes (43): superAdminOnly, activityListQuerySchema, activityType, adminAccountCreateSchema, adminAccountUpdateSchema, adminCreateContactMessageSchema, adminCreateCourseFormSchema, adminCreateScholarshipFormSchema (+35 more)

### Community 1 - "admin/layout.tsx"
Cohesion: 0.06
Nodes (54): AdministratorEditorModal(), generatePassword(), ResetLink, AdminAdministratorsPage(), AdminLayout(), AdminTheme, allNavItems, clearClientAuthStorage() (+46 more)

### Community 2 - "analytics/page.tsx"
Cohesion: 0.12
Nodes (19): AdminAnalyticsPage(), AnalyticsData, BarEntry, BarRows(), CHART_PADDING, countryFlag(), deviceIcon(), DimensionRow (+11 more)

### Community 3 - "admin.controller.ts"
Cohesion: 0.04
Nodes (50): ACTIVITY_SORT_COLUMNS, ActivityRow, ADMIN_PUBLIC_ATTRIBUTES, AdminWhere, createAcademyVideo, createBanner, createContactMessage, createCourse (+42 more)

### Community 4 - "home.ts"
Cohesion: 0.17
Nodes (11): Course, courses, NavLink, navLinks, NewsItem, newsItems, overviewFeatures, Statistic (+3 more)

### Community 5 - "devDependencies"
Cohesion: 0.22
Nodes (9): nodemon, devDependencies, nodemon, sequelize-cli, ts-node, @types/multer, sequelize-cli, ts-node (+1 more)

### Community 6 - "server/package.json"
Cohesion: 0.22
Nodes (8): author, description, keywords, license, main, name, type, version

### Community 7 - "emailTemplates.ts"
Cohesion: 0.36
Nodes (20): adminLoginAlert(), adminPasswordResetEmail(), BRAND, contactFormReceipt(), contactFormStaffAlert(), courseRegistrationReceipt(), detailTable(), escapeHtml() (+12 more)

### Community 8 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, admin:create, build, db:migrate, dev, postinstall, prestart, start (+1 more)

### Community 9 - "dependencies"
Cohesion: 0.05
Nodes (39): dependencies, framer-motion, lucide-react, next, react, react-dom, react-icons, @vercel/analytics (+31 more)

### Community 10 - "faq-data.ts"
Cohesion: 0.28
Nodes (5): FaqItem, FaqSection, faqSections, FaqClient(), metadata

### Community 11 - "useToast"
Cohesion: 0.13
Nodes (18): AdminCoursesPage(), AdminScholarshipProgramsPage(), ScholarshipProgramEditor(), CourseFormEditorModal(), AdminCourseFormsPage(), AdminStudentsPage(), StudentEditorModal(), ResetPasswordForm() (+10 more)

### Community 12 - "BannerEditor.tsx"
Cohesion: 0.19
Nodes (13): AdminModal(), AdminEmptyState(), AdminLoadingState(), AdminNotice(), Banner, BannerEditorProps, ACTION_LABELS, MediaResourceType (+5 more)

### Community 13 - "compilerOptions"
Cohesion: 0.07
Nodes (29): dist, ES2022, node, src/**/*, compilerOptions, declaration, declarationMap, esModuleInterop (+21 more)

### Community 14 - "AdminContentManager.tsx"
Cohesion: 0.08
Nodes (24): AdminNotificationsPage(), ICON_PRESETS, renderNotificationIcon(), AdminContentColumn, AdminContentField, AdminContentManager(), FieldValue, initialValues() (+16 more)

### Community 15 - "Backend Foundation — Complete File-by-File Summary"
Cohesion: 0.06
Nodes (35): Backend Foundation — Complete File-by-File Summary, Commit 1 + 2: TypeScript Config Fix + Environment Configuration, Commit 3: Logger Setup, Commit 4: Error Handling Infrastructure, Commit 5: Database Connection, Commit 6: Core Middleware Stack, Commit 7: Authentication Middleware, Commit 8: Routes, Controllers & App Assembly (+27 more)

### Community 16 - "EditableText.tsx"
Cohesion: 0.12
Nodes (19): ConfirmApi, ConfirmContext, ConfirmDialogOptions, ConfirmDialogProps, ConfirmDialogProvider(), PendingConfirmation, useConfirm(), EditableTextProps (+11 more)

### Community 17 - "AcademyInsights.tsx"
Cohesion: 0.18
Nodes (11): categoryConfig, GalleryPage(), VideoItem, videoItems, AcademyInsights(), BlogItem, VideoItem, InstagramEmbed() (+3 more)

### Community 18 - "HomeClient.tsx"
Cohesion: 0.10
Nodes (20): Course, courseStyles, ExploreCourses(), Announcement, HomeBanner, HomeClient(), PublicContentResponse, renderAnnouncementIcon() (+12 more)

### Community 19 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 20 - "admin/page.tsx"
Cohesion: 0.11
Nodes (20): ActivityPagination, ActivityResponse, ActivityType, AdminDashboardPage(), CourseBreakdownItem, DashboardStats, formatDate(), formatFullDateTime() (+12 more)

### Community 21 - "ResultsClient.tsx"
Cohesion: 0.16
Nodes (7): metadata, ResultsClient(), videoStories, Button(), ButtonProps, resultsData, StudentResult

### Community 22 - "Banner.ts"
Cohesion: 0.50
Nodes (4): Banner, BannerAttributes, BannerCreationAttributes, initBanner()

### Community 23 - "dependencies"
Cohesion: 0.11
Nodes (19): bcrypt, dotenv, multer, pg-hstore, sequelize, dependencies, bcrypt, dotenv (+11 more)

### Community 24 - "MediaRevision.ts"
Cohesion: 0.19
Nodes (10): restoreMediaRevision, initMediaRevision(), MediaResourceType, MediaRevision, MediaRevisionAction, MediaRevisionAttributes, MediaRevisionCreationAttributes, restoreValues() (+2 more)

### Community 25 - "content.routes.ts"
Cohesion: 0.10
Nodes (19): AcademyVideo, AcademyVideoAttributes, AcademyVideoCreationAttributes, initAcademyVideo(), initNewsArticle(), NewsArticle, NewsArticleAttributes, NewsArticleCreationAttributes (+11 more)

### Community 26 - "environment.ts"
Cohesion: 0.14
Nodes (16): configuredOrigins, corsOptions, defaultAllowedOrigins, dbConfig, Env, envSchema, parsed, AdminNotificationPreference (+8 more)

### Community 28 - "admin/[...path]/route.ts"
Cohesion: 0.24
Nodes (9): backendBase(), DELETE, forward(), GET, HandlerContext, isSameOrigin(), PATCH, POST (+1 more)

### Community 29 - "Success Code Academy NEET Coaching Website - Project Master Context"
Cohesion: 0.09
Nodes (22): 10. SEO, Performance & Technical Requirements, 11. Design & Branding Guidelines, 16. Testing & Quality Checklist, 18. AI Agent Implementation Instructions, 19. Definition of Done, 1. Project Overview, 20. Final Product Direction, 3. Repository Structure (+14 more)

### Community 30 - "seedDatabase.ts"
Cohesion: 0.15
Nodes (18): main(), app, reconcileSchema(), scheduleDatabaseReconnect(), startServer(), errorHandler(), isZodError(), notFound() (+10 more)

### Community 31 - "models/index.ts"
Cohesion: 0.06
Nodes (41): AdminPasswordReset, AdminPasswordResetAttributes, AdminPasswordResetCreationAttributes, initAdminPasswordReset(), AdminPushSubscription, AdminPushSubscriptionAttributes, AdminPushSubscriptionCreationAttributes, initAdminPushSubscription() (+33 more)

### Community 32 - "getListOptions"
Cohesion: 0.30
Nodes (15): dateFilter(), getContactMessages, getCourseForms, getCourses, getDashboardActivity, getListOptions(), getScholarshipForms, getScholarshipPrograms (+7 more)

### Community 34 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 35 - "Writing Guidelines for Postgres References"
Cohesion: 0.12
Nodes (15): 1. Concrete Transformation Patterns, 2. Error-First Structure, 3. Quantified Impact, 4. Self-Contained Examples, 5. Semantic Naming, Code Example Standards, Comments, Impact Level Guidelines (+7 more)

### Community 36 - "replacePaths.js"
Cohesion: 0.33
Nodes (3): directoryMap, fs, path

### Community 37 - "public/[...path]/route.ts"
Cohesion: 0.60
Nodes (5): backendBase(), GET(), POST(), proxy(), PUT()

### Community 38 - "app/layout.tsx"
Cohesion: 0.24
Nodes (5): inter, metadata, plusJakarta, StyledJsxRegistry(), AnalyticsTracker()

### Community 39 - "config/roles.ts"
Cohesion: 0.26
Nodes (11): ADMIN, ADMIN_ROLES, AdminRole, isAdminRole(), AdminAttributes, AdminCreationAttributes, initAdmin(), createOrUpdateAdmin() (+3 more)

### Community 40 - "[pageKey]/route.ts"
Cohesion: 0.60
Nodes (4): backendUrl(), GET(), latestContent, staleContentResponse()

### Community 43 - "SettingsEditor.tsx"
Cohesion: 0.17
Nodes (14): ContactClient(), generateCaptcha(), INITIAL_CAPTCHA, Op, metadata, EditableSection(), EditableSectionProps, SettingsEditor() (+6 more)

### Community 44 - "notification.routes.ts"
Cohesion: 0.22
Nodes (8): SUPER_ADMIN, ADMIN_ROLE_SET, authorize(), notificationAdminIdParamsSchema, notificationIdParamsSchema, notificationSettingsSchema, notificationSubscriptionSchema, notificationUnsubscribeSchema

### Community 46 - "🏆 Success Code Academy — Master Project Documentation"
Cohesion: 0.17
Nodes (11): 15. Hosting & Infrastructure Services, 16. Messaging & Notification Services, 1. Project Overview, 20. Implementation, 2. High-Level Architecture, 4. Repository Structure, Key Tagline, Setup Requirements (+3 more)

### Community 48 - "adminApiFetch"
Cohesion: 0.13
Nodes (25): ContactMessageEditorModal(), AdminContactMessagesPage(), AdminScholarshipFormsPage(), ScholarshipFormEditorModal(), AdminSettingsPage(), initialSettings, PUBLIC_SETTING_KEYS, SiteSettings (+17 more)

### Community 49 - "11. Website Pages & Features"
Cohesion: 0.18
Nodes (11): 11. Website Pages & Features, About Page (`/about`), Additional Pages, Admissions Page (`/admissions`), Contact Page (`/contact`), Courses Page (`/courses`), Cross-Cutting Features, FAQ Page (`/faq`) (+3 more)

### Community 51 - "EditModeContext.tsx"
Cohesion: 0.14
Nodes (18): metadata, clearClientAuthStorage(), EditModeContext, EditModeContextValue, EditModeProvider(), useLiveContent(), LiveEditorToolbar(), pageName() (+10 more)

### Community 52 - "AdmissionsClient.tsx"
Cohesion: 0.36
Nodes (5): AdmissionsClient(), metadata, PAGE_BANNER_MAP, PageBannerPage, usePageBanner()

### Community 53 - "test-render.js"
Cohesion: 0.40
Nodes (4): data, https, options, req

### Community 55 - "TopperResult.ts"
Cohesion: 0.50
Nodes (4): initTopperResult(), TopperResult, TopperResultAttributes, TopperResultCreationAttributes

### Community 56 - "CourseDetailClient.tsx"
Cohesion: 0.15
Nodes (13): AdmissionsPage(), Course, CoursesClient(), classroomFeatures, CourseDetailClient(), CourseDetailClientProps, courseVisuals, timeSlots (+5 more)

### Community 64 - "5. Frontend — `client/`"
Cohesion: 0.25
Nodes (8): 5. Frontend — `client/`, API Proxy Routes, Framework & Configuration, Key Frontend Components, Layout Components, Middleware, Route Map, UI Primitives

### Community 79 - "Section Definitions"
Cohesion: 0.20
Nodes (9): 1. Query Performance (query), 2. Connection Management (conn), 3. Security & RLS (security), 4. Schema Design (schema), 5. Concurrency & Locking (lock), 6. Data Access Patterns (data), 7. Monitoring & Diagnostics (monitor), 8. Advanced Features (advanced) (+1 more)

### Community 80 - "Success Code Academy Admin Guide"
Cohesion: 0.22
Nodes (7): Admin dashboard, Safe editing habits, Sign in, Success Code Academy Admin Guide, Troubleshooting, Two ways to update the website, Visual website editor

### Community 81 - "[1.2.0](https://github.com/supabase/agent-skills/compare/v1.1.1...v1.2.0) (2026-06-02)"
Cohesion: 0.25
Nodes (7): [1.2.0](https://github.com/supabase/agent-skills/compare/v1.1.1...v1.2.0) (2026-06-02), [1.3.0](https://github.com/supabase/agent-skills/compare/v1.2.0...v1.3.0) (2026-06-05), Bug Fixes, Bug Fixes, Changelog, Features, Features

### Community 82 - "Supabase Postgres Best Practices"
Cohesion: 0.33
Nodes (5): How to Use, References, Rule Categories by Priority, Supabase Postgres Best Practices, When to Apply

### Community 83 - "5.3 Scholarships Page"
Cohesion: 0.33
Nodes (6): 5.3 Scholarships Page, Scholarship Achievements, Scholarship Exam Detail Page, Scholarship FAQs, Scholarship Listing, Scholarship Preparation

### Community 84 - "14. Implementation Phases"
Cohesion: 0.40
Nodes (5): 14. Implementation Phases, Phase 1 Build Order, Phase 2 Build Order, Phase 3 Build Order, Phase 4 Build Order

### Community 85 - "2.2 Core Technology Stack"
Cohesion: 0.40
Nodes (5): 2.1 Deployment Environment - Current Phase, 2.2 Core Technology Stack, 2. Architecture & Technology Stack, Backend - `server/`, Frontend - `client/`

### Community 86 - "5.5 Student Hub"
Cohesion: 0.40
Nodes (5): 5.5 Student Hub, NCERT Solutions, NEET Answer Key, Study Material, Success Code Academy G-Books

### Community 88 - "notification.controller.ts"
Cohesion: 0.19
Nodes (17): adminId(), list, ok(), read, readAll, recipients, settings, status (+9 more)

### Community 89 - "client/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 90 - "12. Forms, Leads & Conversion Rules"
Cohesion: 0.50
Nodes (4): 12. Forms, Leads & Conversion Rules, Conversion Rules, Form Requirements, Public Forms

### Community 91 - "13. Payment & Access Control"
Cohesion: 0.50
Nodes (4): 13. Payment & Access Control, Access Control, Payment Use Cases, Required Flow

### Community 92 - "15. Development Standards"
Cohesion: 0.50
Nodes (4): 15. Development Standards, Backend Standards, Frontend Standards, Security Standards

### Community 106 - "5.2 Courses Page"
Cohesion: 0.50
Nodes (4): 5.2 Courses Page, Course Categories, Course Detail Page Requirements, Course Listing Requirements

### Community 107 - "5.4 Test Series Page"
Cohesion: 0.50
Nodes (4): 5.4 Test Series Page, Student Test Dashboard, Test Series Categories, Test Series Detail Page

### Community 108 - "9. Backend Modules & Data Models"
Cohesion: 0.50
Nodes (4): 9. Backend Modules & Data Models, API Design Rules, Core Models, Example API Routes

### Community 109 - "17. Environment Variables"
Cohesion: 0.67
Nodes (3): 17. Environment Variables, Client, Server

### Community 110 - "5.7 Blogs & Reviews"
Cohesion: 0.67
Nodes (3): 5.7 Blogs & Reviews, Blog Section, Student Reviews

### Community 111 - "7. Student Login Portal"
Cohesion: 0.67
Nodes (3): 7. Student Login Portal, Authentication, Student Dashboard Features

### Community 112 - "8. Admin / CMS Requirements"
Cohesion: 0.67
Nodes (3): 8. Admin / CMS Requirements, Admin Roles, CMS Features

### Community 152 - "12. Design System & Branding"
Cohesion: 0.29
Nodes (7): 12. Design System & Branding, Brand Colors, Fluid Type Scale, Responsive Breakpoints, Shape, Shadows & Motion, Spacing & Layout, Typography

### Community 153 - "18. Getting Started — Local Development"
Cohesion: 0.29
Nodes (7): 18. Getting Started — Local Development, 1. Clone the Repository, 2. Set Up the Backend, 3. Set Up the Frontend, 4. Access the Application, Available Scripts, Prerequisites

### Community 154 - "8. API Routes & Endpoints"
Cohesion: 0.29
Nodes (7): 8. API Routes & Endpoints, Admin CMS (`/api/v1/admin`) — All require Admin auth, Authentication (`/api/v1/auth`), Content (`/api/v1/content`), Health Check, Public Forms (`/api/v1/forms`), Scholarships (`/api/v1/scholarships`)

### Community 155 - "10. Admin Panel & Visual Website Editor"
Cohesion: 0.40
Nodes (5): 10. Admin Panel & Visual Website Editor, 1. Admin Dashboard (`/admin`), 2. Visual Website Editor (Live Edit Mode), Admin Theming, Key Admin Components

### Community 156 - "19. Development Standards & Security"
Cohesion: 0.40
Nodes (5): 19. Development Standards & Security, Backend Standards, Definition of Done, Frontend Standards, Security Standards

### Community 157 - "7. Database — Models & Migrations"
Cohesion: 0.40
Nodes (5): 7. Database — Models & Migrations, Database Migrations (14 files), Database Seeding, Model Registration, Sequelize Models (17 total)

### Community 158 - "9. Authentication & Authorization"
Cohesion: 0.40
Nodes (5): 9. Authentication & Authorization, Admin Password Reset Flow, Authentication Flow, JWT Configuration, Role-Based Access Control (RBAC)

### Community 159 - "13. SEO & Performance"
Cohesion: 0.50
Nodes (4): 13. SEO & Performance, Image Optimization, Performance Targets, SEO Implementation

### Community 160 - "14. Deployment & Infrastructure"
Cohesion: 0.50
Nodes (4): 14. Deployment & Infrastructure, Deployment Flow, Production Architecture, Supabase Image Hosting

### Community 161 - "3. Technology Stack"
Cohesion: 0.50
Nodes (4): 3. Technology Stack, Backend (`server/`), Frontend (`client/`), Infrastructure & Services

### Community 162 - "6. Backend — `server/`"
Cohesion: 0.50
Nodes (4): 6. Backend — `server/`, Entry Point & Startup, Error Handling Architecture, Utility Services

### Community 165 - "recordMediaRevision"
Cohesion: 0.18
Nodes (11): deleteAcademyVideo, deleteBanner, deleteNewsArticle, deleteResult, deleteStarStudent, recordMediaRevision(), updateAcademyVideo, updateBanner (+3 more)

### Community 168 - "assertNotLastSuperAdmin"
Cohesion: 0.29
Nodes (8): assertAdminIdentityIsFree(), assertNotLastSuperAdmin(), countSuperAdmins(), createAdminAccount, deleteAdminAccount, getAdminAccounts, publicAdminAccount(), updateAdminAccount

### Community 169 - "logout/route.ts"
Cohesion: 0.12
Nodes (41): canonicalProductionTarget(), consoleLogoutDestination(), DELETE(), dynamic, fallbackDestination(), GET(), isConsoleHost(), isProductionConsoleLogin() (+33 more)

### Community 170 - "form.controller.ts"
Cohesion: 0.21
Nodes (17): sendEmailOtp, findExistingCourseRegistration(), getMyCourseRegistration, normaliseEmail(), normalisePhone(), submitContactForm, submitCourseRegistration, updateMyCourseRegistration (+9 more)

### Community 172 - "getSupabase"
Cohesion: 0.50
Nodes (4): getSignedUploadUrl, getSupabase(), upload, uploadImage

### Community 173 - "api.ts"
Cohesion: 0.14
Nodes (17): AdminPageBannersPage(), PAGE_SLOTS, PageBannerSlot, BannerEditor(), useEditMode(), LeadsDrawer(), ICON_PRESETS, Notification (+9 more)

### Community 178 - "v1/index.ts"
Cohesion: 0.24
Nodes (8): getHealth, router, router, router, router, router, v1Router, router

### Community 179 - "17. Environment Variables Reference"
Cohesion: 0.67
Nodes (3): 17. Environment Variables Reference, Client (`client/.env.local`), Server (`server/.env`)

### Community 181 - "auth.controller.ts"
Cohesion: 0.18
Nodes (23): appBaseUrl(), requestSelfPasswordReset, sendAdminPasswordReset, AuthPurpose, createToken(), forgotAdminPassword, forgotUserPassword, getCurrentUser (+15 more)

### Community 185 - "form.routes.ts"
Cohesion: 0.12
Nodes (18): getMyRegistration, updateMyRegistration, authenticate, adminLoginLimiter, defaultLimiter, passwordResetLimiter, submissionLimiter, validate() (+10 more)

### Community 189 - "auth.routes.ts"
Cohesion: 0.12
Nodes (16): changeAdminPassword, resetAdminPassword, resetUserPassword, verifyAdminPasswordReset, verifyUserPasswordReset, adminForgotPasswordSchema, adminLoginSchema, adminPasswordSchema (+8 more)

### Community 190 - "mailer.ts"
Cohesion: 0.14
Nodes (19): updateSettings, initSiteSetting(), SiteSetting, SiteSettingAttributes, SiteSettingCreationAttributes, brand, deliver(), deliverOnce() (+11 more)

### Community 192 - "ContentBlock.ts"
Cohesion: 0.40
Nodes (5): ContentBlock, ContentBlockAttributes, ContentBlockCreationAttributes, ContentBlockKind, initContentBlock()

## Knowledge Gaps
- **618 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `eslintConfig`, `nextConfig`, `name` (+613 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToast()` connect `useToast` to `admin/layout.tsx`, `SettingsEditor.tsx`, `BannerEditor.tsx`, `api.ts`, `AdminContentManager.tsx`, `adminApiFetch`, `EditableText.tsx`, `admin/page.tsx`, `AdmissionsClient.tsx`, `CourseDetailClient.tsx`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `adminApiFetch()` connect `adminApiFetch` to `admin/layout.tsx`, `useToast`, `BannerEditor.tsx`, `api.ts`, `AdminContentManager.tsx`, `SettingsEditor.tsx`, `EditableText.tsx`, `admin/page.tsx`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `isAdminRole()` connect `admin/layout.tsx` to `logout/route.ts`, `EditModeContext.tsx`, `api.ts`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `eslintConfig` to the rest of the system?**
  _618 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin.routes.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08181818181818182 - nodes in this community are weakly interconnected._
- **Should `admin/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.058173076923076925 - nodes in this community are weakly interconnected._
- **Should `analytics/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11956521739130435 - nodes in this community are weakly interconnected._