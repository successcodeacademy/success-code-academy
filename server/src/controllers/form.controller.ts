import type { Request, Response } from 'express';
import { Op, col, fn, where as sequelizeWhere } from 'sequelize';
import { ContactMessage, CourseRegistration } from '../models';
import { asyncHandler } from '../utils/asyncHandler';
import logger from '../utils/logger';
import { sendMail, sendMailToRecipients } from '../utils/mailer';
import {
  contactFormReceipt,
  contactFormStaffAlert,
  courseRegistrationReceipt,
} from '../utils/emailTemplates';
import { AppError } from '../utils/AppError';
import { publishAdminNotification } from '../utils/notificationPublisher';

const normaliseEmail = (value: string): string => value.trim().toLowerCase();
const normalisePhone = (value: string): string => value.replace(/\D/g, '');

async function findExistingCourseRegistration(req: Request) {
  const { studentEmail, studentPhone } = req.body ?? {};
  if (req.user?.id) {
    const owned = await CourseRegistration.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'ASC']],
    });
    if (owned) return owned;
  }
  const identifiers = [
    studentEmail
      ? sequelizeWhere(fn('LOWER', col('studentEmail')), normaliseEmail(studentEmail))
      : req.user?.email
        ? sequelizeWhere(fn('LOWER', col('studentEmail')), normaliseEmail(req.user.email))
        : undefined,
    studentPhone
      ? sequelizeWhere(fn('REGEXP_REPLACE', col('studentPhone'), '[^0-9]', '', 'g'), normalisePhone(studentPhone))
      : req.user?.mobileNumber
        ? sequelizeWhere(fn('REGEXP_REPLACE', col('studentPhone'), '[^0-9]', '', 'g'), normalisePhone(req.user.mobileNumber))
        : undefined,
  ].filter(Boolean) as unknown as Array<Record<string, unknown>>;
  return identifiers.length
    ? CourseRegistration.findOne({
        where: { userId: { [Op.is]: null }, [Op.or]: identifiers } as any,
        order: [['createdAt', 'ASC']],
      })
    : null;
}

export const getMyCourseRegistration = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) throw new AppError('Unauthorized', 401);
  const registration = await findExistingCourseRegistration(req);
  if (!registration) {
    res.status(200).json({
      status: 'success',
      message: 'No existing course enquiry found.',
      data: { registration: null },
    });
    return;
  }
  res.status(200).json({ status: 'success', message: 'Existing course enquiry found.', data: { registration } });
});

export const updateMyCourseRegistration = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) throw new AppError('Unauthorized', 401);
  const registration = await findExistingCourseRegistration(req);
  if (!registration) throw new AppError('No course enquiry found.', 404);
  await registration.update({
    ...req.body,
    userId: req.user.id,
    ...(req.body.studentEmail ? { studentEmail: normaliseEmail(req.body.studentEmail) } : {}),
  });
  res.status(200).json({ status: 'success', message: 'Course enquiry updated successfully.', data: { registration } });
});

/**
 * POST /api/v1/forms/contact
 * Handles submissions from the Contact Us page.
 */
export const submitContactForm = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, phone, message } = req.body;

    const newMessage = await ContactMessage.create({
      name,
      email,
      phone,
      message,
    });

    void publishAdminNotification({
      eventType: 'contact_message.created',
      title: 'New contact message',
      body: 'A new contact enquiry is waiting for review.',
      targetUrl: '/admin/database/contact-messages',
      metadata: { recordId: newMessage.id, recordType: 'contact-message' },
    }).catch((error: unknown) => logger.warn('[Contact Form] Notification publish failed', { error }));

    logger.info(`📧 [Contact Form] New message received from ${name} (${email})`);

    // Receipt to the sender, best-effort.
    const receipt = contactFormReceipt({ name, email, phone, message });
    void sendMail({
      to: email,
      subject: 'We received your message — Success Code Academy',
      text: receipt.text,
      html: receipt.html,
    }).then((mail) => {
      if (!mail.delivered) {
        logger.warn('[Contact Form] Receipt email failed', { to: email, error: mail.error });
      }
    });

    // Staff alert to the academy inbox, best-effort, reply-to the sender.
    const alert = contactFormStaffAlert({ name, email, phone, message });
    void sendMailToRecipients({
      subject: `New contact enquiry from ${name}`,
      text: alert.text,
      html: alert.html,
      replyTo: email,
    }).then((mailResults) => {
      if (mailResults.some((mail) => !mail.delivered)) {
        logger.warn('[Contact Form] Staff alert email failed', { error: mailResults.find((mail) => !mail.delivered)?.error });
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Contact message saved successfully.',
      data: {
        id: newMessage.id,
      },
    });
  }
);

/**
 * POST /api/v1/forms/course-register
 * Handles submissions from the Course Registration forms.
 */
export const submitCourseRegistration = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { courseTitle, studentName, studentEmail, studentPhone, visitingDate, visitingTime } = req.body;

    const existing = await findExistingCourseRegistration(req);
    if (existing) {
      res.status(409).json({ status: 'fail', message: 'A course enquiry already exists for this student. Please update the existing enquiry instead.', data: { registration: existing } });
      return;
    }

    const newRegistration = await CourseRegistration.create({
      ...(req.user?.id ? { userId: req.user.id } : {}),
      courseTitle,
      studentName,
      studentEmail: normaliseEmail(studentEmail),
      studentPhone,
      visitingDate,
      visitingTime,
    });

    void publishAdminNotification({
      eventType: 'course_enquiry.created',
      title: 'New course enquiry',
      body: `A new enquiry was submitted for ${courseTitle}.`,
      targetUrl: '/admin/database/course-forms',
      metadata: { recordId: newRegistration.id, recordType: 'course-form' },
    }).catch((error: unknown) => logger.warn('[Course Registration] Notification publish failed', { error }));

    logger.info(`🎓 [Course Registration] New registration for ${courseTitle} by ${studentName}`);

    // Confirmation to the student, best-effort.
    const template = courseRegistrationReceipt({
      studentName,
      courseTitle,
      visitingDate,
      visitingTime,
    });
    void sendMail({
      to: studentEmail,
      subject: `Your campus visit is confirmed — ${courseTitle}`,
      text: template.text,
      html: template.html,
    }).then((mail) => {
      if (!mail.delivered) {
        logger.warn('[Course Registration] Confirmation email failed', {
          to: studentEmail,
          error: mail.error,
        });
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Course registration saved successfully.',
      data: {
        id: newRegistration.id,
      },
    });
  }
);
