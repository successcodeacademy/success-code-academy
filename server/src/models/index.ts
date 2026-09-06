import { Sequelize } from 'sequelize';
import dbConfig from '../config/database';
import logger from '../utils/logger';

const sequelize = new Sequelize(dbConfig);

// Import models and initialize them to ensure they are registered on the sequelize instance
import Admin, { initAdmin } from './Admin';
import AdminPasswordReset, { initAdminPasswordReset } from './AdminPasswordReset';
import UserPasswordReset, { initUserPasswordReset } from './UserPasswordReset';
import ScholarshipRegistration, { initScholarshipRegistration } from './ScholarshipRegistration';
import User, { initUser } from './User';
import OtpVerification, { initOtpVerification } from './OtpVerification';
import ContactMessage, { initContactMessage } from './ContactMessage';
import CourseRegistration, { initCourseRegistration } from './CourseRegistration';
import Banner, { initBanner } from './Banner';
import Notification, { initNotification } from './Notification';
import StarStudent, { initStarStudent } from './StarStudent';
import SiteSetting, { initSiteSetting } from './SiteSetting';
import TopperResult, { initTopperResult } from './TopperResult';
import ContentBlock, { initContentBlock } from './ContentBlock';
import MediaRevision, { initMediaRevision } from './MediaRevision';
import NewsArticle, { initNewsArticle } from './NewsArticle';
import AcademyVideo, { initAcademyVideo } from './AcademyVideo';
import Course, { initCourse } from './Course';
import ScholarshipProgram, { initScholarshipProgram } from './ScholarshipProgram';
import {
  NewsletterSubscriber,
  initNewsletterSubscriber,
} from './NewsletterSubscriber';
import AdminNotification, { initAdminNotification } from './AdminNotification';
import AdminPushSubscription, { initAdminPushSubscription } from './AdminPushSubscription';
import AdminNotificationPreference, { initAdminNotificationPreference } from './AdminNotificationPreference';
import AdminActivityLog, { initAdminActivityLog } from './AdminActivityLog';

initAdmin(sequelize);
initAdminPasswordReset(sequelize);
initUserPasswordReset(sequelize);
initScholarshipRegistration(sequelize);
initUser(sequelize);
initOtpVerification(sequelize);
initContactMessage(sequelize);
initCourseRegistration(sequelize);
initBanner(sequelize);
initNotification(sequelize);
initStarStudent(sequelize);
initSiteSetting(sequelize);
initTopperResult(sequelize);
initContentBlock(sequelize);
initMediaRevision(sequelize);
initNewsArticle(sequelize);
initAcademyVideo(sequelize);
initCourse(sequelize);
initScholarshipProgram(sequelize);
initNewsletterSubscriber(sequelize);
initAdminNotification(sequelize);
initAdminPushSubscription(sequelize);
initAdminNotificationPreference(sequelize);
initAdminActivityLog(sequelize);

export async function testConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully.');
    
    // Automatically create/alter tables to match models
    if (process.env.NODE_ENV !== 'production') {
      // Local development stays convenient. Production schema changes must
      // go through reviewed migrations (`npm run db:migrate`).
      await sequelize.sync({ alter: true });
    }
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Development database tables synchronized successfully.');
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', { error });
    return false;
  }
}

export {
  sequelize,
  Admin,
  AdminPasswordReset,
  UserPasswordReset,
  ScholarshipRegistration,
  User,
  OtpVerification,
  ContactMessage,
  CourseRegistration,
  Banner,
  Notification,
  StarStudent,
  SiteSetting,
  TopperResult,
  ContentBlock,
  MediaRevision,
  NewsArticle,
  AcademyVideo,
  Course,
  ScholarshipProgram,
  NewsletterSubscriber,
  AdminNotification,
  AdminPushSubscription,
  AdminNotificationPreference,
  AdminActivityLog,
};
export default sequelize;
