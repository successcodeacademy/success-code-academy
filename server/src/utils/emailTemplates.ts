/**
 * Branded HTML email templates for Success Code Academy.
 *
 * One shell wraps every template: a white header strip carrying the academy
 * logo, a thin teal accent rule, the content card, and a plain footer. Colors
 * mirror the public site (#102f5e navy, #087f83 teal, #d2a22b gold).
 * Email-safe: tables, inline styles, no CSS classes.
 *
 * The logo is attached by the mailer as a Resend inline attachment and
 * referenced via the "sca-logo" content id, so it renders without a remote
 * fetch. Templates declare logoCid and the mailer supplies the binary.
 *
 * Copy is deliberately written in plain, conversational language. No em
 * dashes, no filler adjectives, no exclamation padding.
 *
 * Each template returns { html, text } so the mailer can send both parts.
 */

const BRAND = {
  navy: '#102f5e',
  teal: '#087f83',
  gold: '#d2a22b',
  text: '#14243a',
  muted: '#5d6c7e',
  border: '#d7e0e9',
  bg: '#f6f8fb',
};

const WEBSITE = 'https://www.successcodeacademy.in';

/** Content id for the inline logo attachment the mailer adds. */
export const LOGO_CID = 'sca-logo';

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shell(options: {
  heading: string;
  bodyHtml: string;
  footerNote?: string;
}): { html: string; text: string } {
  const { heading, bodyHtml, footerNote } = options;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:Arial,Helvetica,sans-serif;color:${BRAND.text};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">

  <tr>
    <td style="padding:26px 32px;background:#ffffff;text-align:center;">
      <img src="cid:${LOGO_CID}" alt="Success Code Academy" width="196" height="63" style="display:block;margin:0 auto;width:196px;max-width:70%;height:auto;border:0;">
    </td>
  </tr>

  <tr><td style="height:3px;background:linear-gradient(90deg,${BRAND.navy},${BRAND.teal} 52%,${BRAND.gold});font-size:0;line-height:0;">&nbsp;</td></tr>

  <tr>
    <td style="padding:32px;">
      <h1 style="margin:0 0 18px;font-size:21px;line-height:1.25;color:${BRAND.navy};letter-spacing:-0.4px;">${escapeHtml(heading)}</h1>
      ${bodyHtml}
    </td>
  </tr>

  <tr>
    <td style="padding:20px 32px 28px;border-top:1px solid ${BRAND.border};background:#fafcfe;">
      <p style="margin:0;font-size:12px;line-height:1.7;color:${BRAND.muted};">
        ${footerNote ? escapeHtml(footerNote) + '<br>' : ''}
        Success Code Academy, Baramati<br>
        <a href="${WEBSITE}" style="color:${BRAND.teal};text-decoration:none;">successcodeacademy.in</a>
        &nbsp;&middot;&nbsp; +91 86004 70850
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return { html, text: heading };
}

function detailTable(rows: Array<[string, string]>): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border:1px solid ${BRAND.border};border-radius:9px;">
${rows
      .map(
        ([label, value]) => `
<tr>
  <td style="padding:10px 14px;border-bottom:1px solid ${BRAND.border};font-size:11px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.08em;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
  <td style="padding:10px 14px;border-bottom:1px solid ${BRAND.border};font-size:14px;color:${BRAND.text};vertical-align:top;">${escapeHtml(value)}</td>
</tr>`,
      )
      .join('')}
</table>`;
}

/**
 * A slim text-style link button. Underline on hover is not possible in most
 * mail clients, so the teal color plus border reads as clickable on its own.
 */
function linkButton(url: string, label: string): string {
  return `
<p style="margin:24px 0 4px;">
<a href="${url}" style="display:inline-block;padding:9px 20px;font-size:13px;font-weight:700;color:${BRAND.teal};background:${BRAND.bg};border:1px solid ${BRAND.teal};border-radius:6px;text-decoration:none;">${escapeHtml(label)}</a>
</p>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-size:14px;line-height:1.65;color:${BRAND.muted};">${escapeHtml(text)}</p>`;
}

function greeting(name: string): string {
  return `<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:${BRAND.text};">Hi ${escapeHtml(name)},</p>`;
}

export function newsletterWelcome(): { html: string; text: string } {
  const bodyHtml = `
${greeting('there')}
${paragraph("Thanks for subscribing. From here on you'll get our announcements on new batches, scholarship tests and NEET results, straight to this inbox.")}
${paragraph("We only write when there is something worth telling you, so expect a handful of emails a year, not a flood.")}
${linkButton(WEBSITE, 'Visit the academy')}
${paragraph("If you never meant to subscribe, just ignore this email. We won't add you again.")}`;

  const text = [
    'Hi,',
    '',
    "Thanks for subscribing. From here on you'll get our announcements on new batches, scholarship tests and NEET results, straight to this inbox.",
    '',
    "We only write when there is something worth telling you, so expect a handful of emails a year, not a flood.",
    '',
    `Visit the academy: ${WEBSITE}`,
    '',
    "If you never meant to subscribe, just ignore this email. We won't add you again.",
  ].join('\n');

  return { html: shell({ heading: 'You are on the list', bodyHtml }).html, text };
}

/** Notice sent when an address is added to the internal notification list. */
export function internalNotificationRecipientWelcome(): { html: string; text: string } {
  const bodyHtml = `
${greeting('there')}
${paragraph('You have been added as an internal email notification recipient for Success Code Academy.')}
${paragraph('You will receive internal form and admin alerts, such as new enquiries, registrations, and other website updates that need the team\'s attention.')}
${paragraph('This is an operational email, not a marketing subscription. If you were added by mistake or no longer need these alerts, please contact Success Code Academy at +91 86004 70850 or ask the academy super administrator to remove your address.')}`;

  const text = [
    'Hi,',
    '',
    'You have been added as an internal email notification recipient for Success Code Academy.',
    '',
    "You will receive internal form and admin alerts, such as new enquiries, registrations, and other website updates that need the team's attention.",
    '',
    'This is an operational email, not a marketing subscription. If you were added by mistake or no longer need these alerts, please contact Success Code Academy at +91 86004 70850 or ask the academy super administrator to remove your address.',
  ].join('\n');

  return {
    html: shell({
      heading: 'You were added to internal alerts',
      bodyHtml,
      footerNote: 'You are receiving this because your address was added to the academy notification list.',
    }).html,
    text,
  };
}

export function studentWelcome(params: {
  firstName: string;
  mobileNumber: string;
}): { html: string; text: string } {
  const bodyHtml = `
${greeting(params.firstName)}
${paragraph('Your student account at Success Code Academy is set up. You can sign in any time from the website using the mobile number below.')}
${detailTable([
    ['Mobile number', params.mobileNumber],
  ])}
${paragraph('Whenever you are ready, our counselors can walk you through the batches, the study material and the test schedule. Just ask.')}`;

  const text = [
    `Hi ${params.firstName},`,
    '',
    'Your student account at Success Code Academy is set up. You can sign in any time from the website using the mobile number below.',
    '',
    `Mobile number: ${params.mobileNumber}`,
    '',
    'Whenever you are ready, our counselors can walk you through the batches, the study material and the test schedule. Just ask.',
  ].join('\n');

  return { html: shell({ heading: 'Your student account is ready', bodyHtml }).html, text };
}

export function studentOtpVerification(params: {
  otp: string;
}): { html: string; text: string } {
  const bodyHtml = `
${greeting('student')}
${paragraph('Please use the verification code below to verify your email address and complete your registration at Success Code Academy.')}
<div style="margin:24px 0;padding:16px;background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:8px;text-align:center;">
  <span style="font-size:32px;font-weight:700;letter-spacing:4px;color:${BRAND.navy};">${escapeHtml(params.otp)}</span>
</div>
${paragraph('This code expires in 15 minutes. If you did not request this, you can safely ignore this email.')}`;

  const text = [
    'Hi student,',
    '',
    'Please use the verification code below to verify your email address and complete your registration at Success Code Academy.',
    '',
    `Verification Code: ${params.otp}`,
    '',
    'This code expires in 15 minutes. If you did not request this, you can safely ignore this email.',
  ].join('\n');

  return { html: shell({ heading: 'Verify your email address', bodyHtml }).html, text };
}

export function contactFormReceipt(params: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): { html: string; text: string } {
  const bodyHtml = `
${greeting(params.name)}
${paragraph('We got your message and someone from the team will get back to you, usually within a day. Here is a copy of what you sent us, for your records.')}
${detailTable([
    ['Name', params.name],
    ['Email', params.email],
    ['Phone', params.phone],
    ['Message', params.message],
  ])}
${paragraph('If it is urgent, you can always call us on +91 86004 70850 between 9 AM and 7 PM.')}`;

  const text = [
    `Hi ${params.name},`,
    '',
    'We got your message and someone from the team will get back to you, usually within a day. Here is a copy of what you sent us, for your records.',
    '',
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    `Phone: ${params.phone}`,
    `Message: ${params.message}`,
    '',
    'If it is urgent, you can always call us on +91 86004 70850 between 9 AM and 7 PM.',
  ].join('\n');

  return { html: shell({ heading: 'We got your message', bodyHtml }).html, text };
}

export function contactFormStaffAlert(params: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): { html: string; text: string } {
  const bodyHtml = `
${greeting('team')}
${paragraph('A new enquiry came in through the website contact form. Reply to this email and it goes straight to the sender.')}
${detailTable([
    ['Name', params.name],
    ['Email', params.email],
    ['Phone', params.phone],
    ['Message', params.message],
  ])}
${linkButton(`${WEBSITE}/admin/database/contact-messages`, 'Open the dashboard')}`;

  const text = [
    'Hi team,',
    '',
    'A new enquiry came in through the website contact form. Reply to this email and it goes straight to the sender.',
    '',
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    `Phone: ${params.phone}`,
    `Message: ${params.message}`,
    '',
    `Open the dashboard: ${WEBSITE}/admin/database/contact-messages`,
  ].join('\n');

  return {
    html: shell({
      heading: 'New contact enquiry',
      bodyHtml,
      footerNote: 'You are receiving this because you manage the academy inbox.',
    }).html,
    text,
  };
}

export function courseRegistrationReceipt(params: {
  studentName: string;
  courseTitle: string;
  visitingDate: string;
  visitingTime: string;
}): { html: string; text: string } {
  const bodyHtml = `
${greeting(params.studentName)}
${paragraph('Your campus visit is booked. Here are the details, keep this email handy.')}
${detailTable([
    ['Course', params.courseTitle],
    ['Visit date', params.visitingDate],
    ['Visit time', params.visitingTime],
  ])}
${paragraph('Please come ten minutes early and carry a photo ID. Our counselor will show you the classrooms, the library and the doubt solving desks, and answer whatever is on your mind.')}`;

  const text = [
    `Hi ${params.studentName},`,
    '',
    'Your campus visit is booked. Here are the details, keep this email handy.',
    '',
    `Course: ${params.courseTitle}`,
    `Visit date: ${params.visitingDate}`,
    `Visit time: ${params.visitingTime}`,
    '',
    'Please come ten minutes early and carry a photo ID. Our counselor will show you the classrooms, the library and the doubt solving desks, and answer whatever is on your mind.',
  ].join('\n');

  return { html: shell({ heading: 'Your campus visit is booked', bodyHtml }).html, text };
}

export function scholarshipRegistrationReceipt(params: {
  studentName: string;
  studentClass: string;
  schoolName: string;
  city: string;
  preferredCourse: string;
}): { html: string; text: string } {
  const bodyHtml = `
${greeting(params.studentName)}
${paragraph('We have noted down your registration for the SCST scholarship test. We will call you on your registered mobile number with your exam slot and center details.')}
${detailTable([
    ['Student', params.studentName],
    ['Class', params.studentClass],
    ['School', params.schoolName],
    ['City', params.city],
    ['Preferred course', params.preferredCourse],
  ])}
${paragraph('The top scorers in SCST can win up to a full fee waiver, so take it seriously. Start your revision early.')}`;

  const text = [
    `Hi ${params.studentName},`,
    '',
    'We have noted down your registration for the SCST scholarship test. We will call you on your registered mobile number with your exam slot and center details.',
    '',
    `Student: ${params.studentName}`,
    `Class: ${params.studentClass}`,
    `School: ${params.schoolName}`,
    `City: ${params.city}`,
    `Preferred course: ${params.preferredCourse}`,
    '',
    'The top scorers in SCST can win up to a full fee waiver, so take it seriously. Start your revision early.',
  ].join('\n');

  return { html: shell({ heading: 'SCST registration noted', bodyHtml }).html, text };
}

export function scholarshipRegistrationStaffAlert(params: {
  studentName: string;
  studentPhone: string;
  studentEmail?: string;
  studentClass: string;
  schoolName: string;
  city: string;
  preferredCourse: string;
  scholarshipProgram?: string;
}): { html: string; text: string } {
  const rows: [string, string][] = [
    ['Student', params.studentName],
    ['Class', params.studentClass],
    ['Phone', params.studentPhone],
    ['School', params.schoolName],
    ['City', params.city],
    ['Preferred course', params.preferredCourse],
  ];
  if (params.scholarshipProgram) rows.push(['Scholarship program', params.scholarshipProgram]);
  if (params.studentEmail) rows.push(['Email', params.studentEmail]);

  const bodyHtml = `
${greeting('team')}
${paragraph('A new SCST scholarship registration has been submitted through the website. Review the details below and follow up as needed.')}
${detailTable(rows)}
${linkButton(`${WEBSITE}/admin/database/scholarship-forms`, 'Open the dashboard')}`;

  const text = [
    'Hi team,',
    '',
    'A new SCST scholarship registration has been submitted through the website.',
    '',
    `Student: ${params.studentName}`,
    `Class: ${params.studentClass}`,
    `Phone: ${params.studentPhone}`,
    `School: ${params.schoolName}`,
    `City: ${params.city}`,
    `Preferred course: ${params.preferredCourse}`,
    ...(params.scholarshipProgram ? [`Scholarship program: ${params.scholarshipProgram}`] : []),
    ...(params.studentEmail ? [`Email: ${params.studentEmail}`] : []),
    '',
    `Open the dashboard: ${WEBSITE}/admin/database/scholarship-forms`,
  ].join('\n');

  return {
    html: shell({
      heading: 'New SCST registration',
      bodyHtml,
      footerNote: 'You are receiving this because you manage the academy inbox.',
    }).html,
    text,
  };
}

export function adminLoginAlert(params: {
  name: string;
  email: string;
  ip?: string | undefined;
  when: Date;
}): { html: string; text: string } {
  const when = params.when.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'long',
  });
  const bodyHtml = `
${greeting(params.name)}
${paragraph('Your admin account was just signed in to. If that was you, you can ignore the rest of this email.')}
${detailTable([
    ['Email', params.email],
    ['Signed in at', when],
    ['IP address', params.ip || 'Not available'],
  ])}
${paragraph("If you do not recognize this sign in, change your password from the admin dashboard right away and inform the super admin.")}`;

  const text = [
    `Hi ${params.name},`,
    '',
    'Your admin account was just signed in to. If that was you, you can ignore the rest of this email.',
    '',
    `Email: ${params.email}`,
    `Signed in at: ${when}`,
    `IP address: ${params.ip || 'Not available'}`,
    '',
    "If you do not recognize this sign in, change your password from the admin dashboard right away and inform the super admin.",
  ].join('\n');

  return {
    html: shell({
      heading: 'New sign in to the admin account',
      bodyHtml,
      footerNote: 'You are receiving this because you manage the academy website.',
    }).html,
    text,
  };
}

export function adminPasswordResetEmail(params: {
  name: string;
  resetUrl: string;
  ttlMinutes: number;
}): { html: string; text: string } {
  const bodyHtml = `
${greeting(params.name)}
${paragraph('Someone asked to reset your admin password. If that was you, use the button below.')}
${linkButton(params.resetUrl, 'Reset password')}
${paragraph(`The link works for the next ${params.ttlMinutes} minutes and can only be used once.`)}
${paragraph('If the button does not open in your mail app, copy this link into your browser:')}
<p style="margin:0 0 14px;font-size:12px;line-height:1.6;color:${BRAND.teal};word-break:break-all;">${escapeHtml(params.resetUrl)}</p>
${paragraph('If you did not ask for this, ignore the email. Your current password keeps working.')}`;

  const text = [
    `Hi ${params.name},`,
    '',
    'Someone asked to reset your admin password. If that was you, use the link below.',
    `The link works for the next ${params.ttlMinutes} minutes and can only be used once.`,
    '',
    params.resetUrl,
    '',
    'If you did not ask for this, ignore the email. Your current password keeps working.',
  ].join('\n');

  return { html: shell({ heading: 'Reset your admin password', bodyHtml }).html, text };
}

export function userPasswordResetEmail(params: {
  name: string;
  resetUrl: string;
  ttlMinutes: number;
}): { html: string; text: string } {
  const bodyHtml = `
${greeting(params.name)}
${paragraph('Someone asked to reset your Success Code Academy password. If that was you, use the button below.')}
${linkButton(params.resetUrl, 'Reset password')}
${paragraph(`The link works for the next ${params.ttlMinutes} minutes and can only be used once.`)}
${paragraph('If the button does not open in your mail app, copy this link into your browser:')}
<p style="margin:0 0 14px;font-size:12px;line-height:1.6;color:${BRAND.teal};word-break:break-all;">${escapeHtml(params.resetUrl)}</p>
${paragraph('If you did not ask for this, ignore the email. Your current password keeps working.')}`;

  const text = [
    `Hi ${params.name},`,
    '',
    'Someone asked to reset your Success Code Academy password. If that was you, use the link below.',
    `The link works for the next ${params.ttlMinutes} minutes and can only be used once.`,
    '',
    params.resetUrl,
    '',
    'If you did not ask for this, ignore the email. Your current password keeps working.',
  ].join('\n');

  return { html: shell({ heading: 'Reset your password', bodyHtml }).html, text };
}
