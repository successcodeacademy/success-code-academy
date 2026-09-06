import type { NextFunction, Request, Response } from 'express';
import type { Model } from 'sequelize';
import {
  AcademyVideo, Admin, AdminActivityLog, Banner, ContactMessage, ContentBlock,
  Course, CourseRegistration, NewsArticle, Notification, ScholarshipProgram,
  ScholarshipRegistration, SiteSetting, StarStudent, TopperResult, User,
} from '../models';
import logger from '../utils/logger';

const MUTATIONS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function resourceFromPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const index = parts.indexOf('admin');
  const first = parts[index + 1] || parts[0] || 'admin';
  const value = first === 'database' ? parts[index + 2] || first : first;
  const names: Record<string, string> = {
    banners: 'banner', notifications: 'notification', stars: 'star-student',
    results: 'result', news: 'news-article', videos: 'academy-video',
    courses: 'course', settings: 'site-setting', 'page-content': 'content-block',
    users: 'student', 'course-forms': 'course-form',
    'scholarship-forms': 'scholarship-form', 'contact-messages': 'contact-message',
    admins: 'admin-account', 'scholarship-programs': 'scholarship-program',
    upload: 'media', history: 'media-revision',
  };
  return names[value] || value;
}

function actionFromRequest(req: Request): string {
  if (req.path.includes('/restore')) return 'restore';
  if (req.path.includes('/upload')) return 'upload';
  return ({ POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' } as Record<string, string>)[req.method] || req.method.toLowerCase();
}

type SnapshotModel = { findByPk: (id: string) => Promise<Model | null> };

function modelForResource(resource: string): SnapshotModel | null {
  const models: Record<string, SnapshotModel> = {
    student: User as unknown as SnapshotModel,
    'admin-account': Admin as unknown as SnapshotModel,
    banner: Banner as unknown as SnapshotModel,
    notification: Notification as unknown as SnapshotModel,
    'star-student': StarStudent as unknown as SnapshotModel,
    result: TopperResult as unknown as SnapshotModel,
    'news-article': NewsArticle as unknown as SnapshotModel,
    'academy-video': AcademyVideo as unknown as SnapshotModel,
    course: Course as unknown as SnapshotModel,
    'course-form': CourseRegistration as unknown as SnapshotModel,
    'scholarship-form': ScholarshipRegistration as unknown as SnapshotModel,
    'contact-message': ContactMessage as unknown as SnapshotModel,
    'scholarship-program': ScholarshipProgram as unknown as SnapshotModel,
    'content-block': ContentBlock as unknown as SnapshotModel,
  };
  return models[resource] || null;
}

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => sanitize(item, depth + 1));
  if (typeof value !== 'object') return value;
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (/password|token|secret|authorization|cookie|hash/i.test(key)) continue;
    result[key] = sanitize(item, depth + 1);
  }
  return result;
}

function responseData(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const body = value as { data?: unknown };
  return body.data === undefined ? value : body.data;
}

async function readBefore(resource: string, resourceId: string | null, req: Request): Promise<unknown> {
  if (resource === 'site-setting') return SiteSetting.findAll({ raw: true });
  if (resource === 'content-block') return ContentBlock.findOne({ where: { pageKey: req.params.pageKey || req.path.split('/').at(-2), contentKey: req.params.contentKey || req.path.split('/').at(-1) }, raw: true });
  const model = modelForResource(resource);
  return model && resourceId ? model.findByPk(resourceId) : null;
}

export async function activityLogger(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user || req.user.purpose !== 'admin' || !MUTATIONS.has(req.method) || req.path.includes('/activity-logs')) {
    next();
    return;
  }

  const requestPath = `${req.baseUrl}${req.path}`;
  const resource = resourceFromPath(requestPath);
  const action = actionFromRequest({ ...req, path: requestPath } as Request);
  const resourceIdMatch = requestPath.match(/\/([0-9]+)(?:\/|$)/);
  const resourceId = resourceIdMatch?.[1] || null;
  let before: unknown = null;
  try {
    if (action !== 'create' && action !== 'upload') before = await readBefore(resource, resourceId, req);
  } catch (error: unknown) {
    logger.warn('Admin activity before-snapshot failed.', { error });
  }

  let responseBody: unknown;
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    responseBody = body;
    return originalJson(body);
  }) as Response['json'];

  res.once('finish', () => {
    if (res.statusCode < 200 || res.statusCode >= 300 || !req.user) return;
    const returned = responseData(responseBody) as Record<string, unknown> | null;
    const afterId = resourceId || (returned && typeof returned === 'object' && 'id' in returned ? String(returned.id) : null);
    void (async () => {
      let after: unknown = action === 'delete' ? null : responseData(responseBody);
      try {
        if (action !== 'delete') after = await readBefore(resource, afterId, req) || after;
      } catch (error: unknown) {
        logger.warn('Admin activity after-snapshot failed.', { error });
      }
      await AdminActivityLog.create({
        adminId: req.user!.id,
        adminEmail: req.user!.email,
        adminRole: req.user!.role,
        action,
        resource,
        resourceId: afterId,
        method: req.method,
        route: requestPath,
        summary: `${action} ${resource}${afterId ? ` #${afterId}` : ''}`,
        metadata: { queryKeys: Object.keys(req.query) },
        before: sanitize(before) as Record<string, unknown> | null,
        after: sanitize(after) as Record<string, unknown> | null,
      });
    })().catch((error: unknown) => logger.error('Admin activity log write failed.', { error }));
  });
  next();
}
