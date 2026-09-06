import type { Request, Response } from 'express';
import { ScholarshipRegistration } from '../models';
import { asyncHandler } from '../utils/asyncHandler';
import logger from '../utils/logger';
import { sendMail, sendMailToRecipients } from '../utils/mailer';
import { scholarshipRegistrationReceipt, scholarshipRegistrationStaffAlert } from '../utils/emailTemplates';
import { AppError } from '../utils/AppError';
import { publishAdminNotification } from '../utils/notificationPublisher';

/**
 * GET /api/v1/scholarships/me
 *
 * Retrieves the scholarship registration for the authenticated user, if any.
 */
export const getMyRegistration = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const registration = await ScholarshipRegistration.findOne({
      where: { userId },
    });

    if (!registration) {
      res.status(200).json({
        status: 'success',
        message: 'No existing scholarship registration found.',
        data: {
          registration: null,
        },
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        registration,
      },
    });
  }
);

/**
 * PUT /api/v1/scholarships/me
 *
 * Updates the scholarship registration for the authenticated user.
 */
export const updateMyRegistration = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const {
      studentName,
      studentPhone,
      studentEmail,
      parentPhone,
      studentClass,
      schoolName,
      city,
      preferredCourse,
      scholarshipProgram,
    } = req.body;

    const registration = await ScholarshipRegistration.findOne({
      where: { userId },
    });

    if (!registration) {
      throw new AppError('No registration found.', 404);
    }

    const editableFields = {
      studentName,
      studentPhone,
      studentEmail,
      parentPhone,
      studentClass,
      schoolName,
      city,
      preferredCourse,
      scholarshipProgram,
    };
    await registration.update(
      Object.fromEntries(
        Object.entries(editableFields).filter(([, value]) => value !== undefined),
      ),
    );

    res.status(200).json({
      status: 'success',
      message: 'Scholarship registration updated successfully',
      data: {
        registration,
      },
    });
  }
);

/**
 * POST /api/v1/scholarships/register
 *
 * Receives validated request body and creates a new scholarship registration entry in the database.
 */
export const createRegistration = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    // Ensure user doesn't already have one
    const existing = await ScholarshipRegistration.findOne({
      where: { userId },
    });
    if (existing) {
      throw new AppError('You have already submitted a scholarship registration.', 400);
    }

    const {
      studentName,
      studentPhone,
      studentEmail,
      parentPhone,
      studentClass,
      schoolName,
      city,
      preferredCourse,
      scholarshipProgram,
    } = req.body;

    let registration;
    try {
      registration = await ScholarshipRegistration.create({
        userId, studentEmail, scholarshipProgram, studentName, studentPhone, parentPhone,
        studentClass, schoolName, city, preferredCourse,
      });
    } catch (error) {
      if ((error as { name?: string }).name === 'SequelizeUniqueConstraintError') {
        const existingRegistration = await ScholarshipRegistration.findOne({ where: { userId } });
        res.status(409).json({ status: 'fail', message: 'You already have a scholarship registration. Please update the existing registration.', data: { registration: existingRegistration } });
        return;
      }
      throw error;
    }

    logger.info(
      `🎓 [Scholarship] New SCST registration: ${studentName} (${studentClass}, ${city})`
    );

    void publishAdminNotification({
      eventType: 'scholarship_form.created',
      title: 'New scholarship form',
      body: 'A new scholarship application is waiting for review.',
      targetUrl: '/admin/database/scholarship-forms',
      metadata: { recordId: registration.id, recordType: 'scholarship-form' },
    }).catch((error: unknown) => logger.warn('[Scholarship] Notification publish failed', { error }));

    if (studentEmail) {
      const template = scholarshipRegistrationReceipt({
        studentName,
        studentClass,
        schoolName,
        city,
        preferredCourse,
      });
      void sendMail({
        to: studentEmail,
        subject: `Your SCST registration is confirmed — ${studentName}`,
        text: template.text,
        html: template.html,
      }).then((mail) => {
        if (!mail.delivered) {
          logger.warn('[Scholarship] Receipt email failed', { error: mail.error });
        }
      });
    }

    // Alert for admin
    const adminTemplate = scholarshipRegistrationStaffAlert({
      studentName,
      studentPhone,
      studentEmail,
      studentClass,
      schoolName,
      city,
      preferredCourse,
      scholarshipProgram,
    });
    void sendMailToRecipients({
      subject: `New SCST registration — ${studentName} (${studentClass})`,
      text: adminTemplate.text,
      html: adminTemplate.html,
    }).then((mailResults) => {
      if (mailResults.some((mail) => !mail.delivered)) {
        logger.warn('[Scholarship] Staff alert email failed', { error: mailResults.find((mail) => !mail.delivered)?.error });
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Scholarship registration submitted successfully',
      data: {
        registration,
      },
    });
  },
);
