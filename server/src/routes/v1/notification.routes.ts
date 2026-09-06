import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { ADMIN_ROLES, SUPER_ADMIN } from '../../config/roles';
import { activityLogger } from '../../middlewares/activityLogger';
import * as controller from '../../controllers/notification.controller';
import {
  notificationAdminIdParamsSchema,
  notificationIdParamsSchema,
  notificationSettingsSchema,
  notificationSubscriptionSchema,
  notificationUnsubscribeSchema,
} from '../../validation/admin.schemas';

const router = Router();
router.use(authenticate, authorize(...ADMIN_ROLES));
router.use(activityLogger);
router.post('/subscriptions', validate(notificationSubscriptionSchema), controller.subscribe);
router.delete('/subscriptions', validate(notificationUnsubscribeSchema), controller.unsubscribe);
router.get('/status', controller.status);
router.get('/vapid-public-key', controller.vapidKey);
router.put('/settings', authorize(SUPER_ADMIN), validate(notificationSettingsSchema), controller.settings);
router.get('/recipients', authorize(SUPER_ADMIN), controller.recipients);
router.put('/recipients/:adminId', authorize(SUPER_ADMIN), validate(notificationAdminIdParamsSchema, 'params'), validate(notificationSettingsSchema), controller.updateRecipient);
router.get('/', controller.list);
router.patch('/:id/read', validate(notificationIdParamsSchema, 'params'), controller.read);
router.post('/read-all', controller.readAll);
export default router;
