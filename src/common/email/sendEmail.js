import nodemailer from "nodemailer";

import env from "../../../config/env.service.js";

const createTransporter = () => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: false,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("Email skipped because SMTP credentials are not configured", {
      to,
      subject
    });
    return { skipped: true };
  }

  return transporter.sendMail({
    from: env.smtpUser,
    to,
    subject,
    html
  });
};

export default sendEmail;
