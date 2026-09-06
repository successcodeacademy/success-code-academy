import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Admin, AdminNotification, AdminNotificationPreference, AdminPushSubscription, SiteSetting } from '../models';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/environment';
import { deliverAdminNotification } from '../utils/notificationDelivery';

const adminId = (req: Request) => {
  if (!req.user || req.user.purpose !== 'admin') {
    throw new AppError('A verified admin session is required.', 403);
  }
  if (!Number.isSafeInteger(req.user.id) || req.user.id < 1) {
    throw new AppError('The authenticated admin id is invalid.', 401);
  }
  return req.user.id;
};
const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ status: 'success', data });
export const list = asyncHandler(async (req, res) => { const id = adminId(req); const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100); const page = Math.max(Number(req.query.page) || 1, 1); const { count, rows } = await AdminNotification.findAndCountAll({ where: { adminId: id }, order: [['createdAt', 'DESC']], limit, offset: (page - 1) * limit }); const unreadCount = await AdminNotification.count({ where: { adminId: id, readAt: { [Op.is]: null } } }); ok(res, { items: rows, unreadCount, pagination: { page, pageSize: limit, total: count, totalPages: Math.max(1, Math.ceil(count / limit)) } }); });
export const read = asyncHandler(async (req, res) => { const id = adminId(req); const notificationId = Number(req.params.id); if (!Number.isInteger(notificationId) || notificationId < 1) throw new AppError('Invalid notification id.', 400); const item = await AdminNotification.findOne({ where: { id: notificationId, adminId: id } }); if (!item) { ok(res, { id: notificationId, readAt: new Date() }); return; } await item.update({ readAt: new Date() }); ok(res, item); });
export const readAll = asyncHandler(async (req, res) => { await AdminNotification.update({ readAt: new Date() }, { where: { adminId: adminId(req), readAt: { [Op.is]: null } } }); ok(res, { updated: true }); });
export const subscribe = asyncHandler(async (req, res) => { const id = adminId(req); const { endpoint, keys } = req.body; const existing = await AdminPushSubscription.findOne({ where: { endpoint } }); if (existing && existing.adminId !== id) throw new AppError('This push subscription belongs to another admin.', 409); const values = { p256dh: keys.p256dh, auth: keys.auth, userAgent: req.get('user-agent') || null }; if (existing) await existing.update(values); else await AdminPushSubscription.create({ adminId: id, endpoint, ...values }); ok(res, { subscribed: true }, existing ? 200 : 201); });
export const unsubscribe = asyncHandler(async (req, res) => { const deleted = await AdminPushSubscription.destroy({ where: { adminId: adminId(req), endpoint: req.body.endpoint } }); ok(res, { subscribed: false, removed: deleted > 0 }); });
export const status = asyncHandler(async (req, res) => { const id = adminId(req); const setting = await SiteSetting.findOne({ where: { key: 'admin_notifications_enabled' } }); const pref = await AdminNotificationPreference.findOne({ where: { adminId: id } }); ok(res, { enabled: setting?.value !== 'false', recipientEnabled: pref?.enabled ?? true, vapidConfigured: Boolean(env.VAPID_PUBLIC_KEY) }); });
export const vapidKey = asyncHandler(async (_req, res) => { if (!env.VAPID_PUBLIC_KEY) throw new AppError('Push notifications are not configured.', 503); ok(res, { publicKey: env.VAPID_PUBLIC_KEY }); });
export const settings = asyncHandler(async (req, res) => { const value = req.body.enabled ? 'true' : 'false'; const [setting] = await SiteSetting.findOrCreate({ where: { key: 'admin_notifications_enabled' }, defaults: { key: 'admin_notifications_enabled', value } }); await setting.update({ value }); ok(res, { enabled: value === 'true' }); });
export const recipients = asyncHandler(async (req, res) => { const admins = await Admin.findAll({ attributes: ['id', 'name', 'email', 'role'], order: [['name', 'ASC']] }); const prefs = await AdminNotificationPreference.findAll(); const map = new Map(prefs.map(p => [p.adminId, p.enabled])); ok(res, admins.map(a => ({ ...a.toJSON(), enabled: map.get(a.id) ?? true }))); });
export const updateRecipient = asyncHandler(async (req, res) => { const target = await Admin.findByPk(Number(req.params.adminId)); if (!target) throw new AppError('Admin not found.', 404); const [pref] = await AdminNotificationPreference.findOrCreate({ where: { adminId: target.id }, defaults: { adminId: target.id, enabled: req.body.enabled } }); await pref.update({ enabled: req.body.enabled }); ok(res, pref); });
export { deliverAdminNotification };
