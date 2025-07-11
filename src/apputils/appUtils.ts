
import { EmailPayload, OtpEmailPayload, ticketEmailPaylaod } from "@/types/emailServiceDataTypes";

export function generateRandomPassword(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
}

  export function encodeString(value: string) {
    return btoa(value);
  }

  export function decodeString(value: string) {
    return atob(value);
  }



export function generateOTP(length: number): string {
  let otp = "";
  const digits = "123456789";

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }

  return otp;
}


  


export async function sendEmail(user: EmailPayload): Promise<"SUCCESS" | "ERROR"> {
  const url = "https://emailsenderapi.afrid.live/sendEmail/";

  let subject: string;
  let title: string;
  let htmlBody: string;

  if (user?.password) {
    // Account creation email
    subject = "Your Railtel e-Office Account Credentials";
    title = "Welcome to Railtel e-Office Helpdesk";
    htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0055A4;">Welcome to Railtel e-Office Helpdesk!</h2>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Thank you for registering with the Railtel e-Office Helpdesk.</p>
        <p>Your account has been successfully created. Please find your login credentials below:</p>

        <table style="border-collapse: collapse; margin: 16px 0; font-size: 16px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Email:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${user.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Password:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${user.password}</td>
          </tr>
        </table>

        <p>If you did not request this account or believe you received this email in error, please disregard this message or contact Railtel Helpdesk immediately.</p>

        <p style="margin-top: 24px;">
          Regards,<br />
          Railtel Corporation of India<br />
          e-Office Helpdesk Team
        </p>
      </div>
    `;
  } else {
    // Account enabled/disabled notification
    subject = "Your Railtel e-Office Account Status Changed";
    title = "Account Status Update - Railtel e-Office Helpdesk";
    const statusText = user.enabled ? "enabled" : "disabled";

    htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0055A4;">Account Status Changed</h2>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your account on the Railtel e-Office Helpdesk has been <strong>${statusText}</strong>.</p>

        <p>If you believe this change was made in error, please contact the Helpdesk team immediately.</p>

        <p style="margin-top: 24px;">
          Regards,<br />
          Railtel Corporation of India<br />
          e-Office Helpdesk Team
        </p>
      </div>
    `;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      toEmail: user.email,
      body: htmlBody,
      title,
      subject,
    }),
  });

  const result = await response.json();

  if (result?.message === "emailSendSuccess") {
    return "SUCCESS";
  } else {
    return "ERROR";
  }
}





export async function sendOtpEmail(user: OtpEmailPayload): Promise<"SUCCESS" | "ERROR"> {
  const url = "https://emailsenderapi.afrid.live/sendEmail/";

  // Default values for login
  let emailTitle = "Railte e-Office OTP Verification";
  let emailSubject = "Your OTP for Login";
  let htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #0055A4;">Railte e-Office Helpdesk - OTP Verification</h2>
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>You have requested to login or reset your password. Please use the One-Time Password (OTP) provided below to continue:</p>

      <div style="font-size: 24px; font-weight: bold; color: #D32F2F; margin: 16px 0;">
        ${user.otp}
      </div>

      <p>This OTP is valid for a limited time and should not be shared with anyone.</p>
      <p>If you did not request this OTP, please ignore this message or contact the Railtel Helpdesk immediately.</p>

      <p style="margin-top: 24px;">
        Regards,<br />
        Railtel Corporation of India<br />
        e-Office Helpdesk Team
      </p>
    </div>
  `;

  // If purpose is reset-password, customize subject and body
  if (user.purpose === "reset-password") {
    emailTitle = "Railte e-Office Password Reset OTP";
    emailSubject = "Your OTP to Reset Password";

    htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0055A4;">Railte e-Office Helpdesk - Password Reset OTP</h2>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>You have requested to reset your password. Please use the One-Time Password (OTP) provided below to continue:</p>

        <div style="font-size: 24px; font-weight: bold; color: #D32F2F; margin: 16px 0;">
          ${user.otp}
        </div>

        <p>This OTP is valid for a limited time and should not be shared with anyone.</p>
        <p>If you did not request this OTP, please ignore this message or contact the Railtel Helpdesk immediately.</p>

        <p style="margin-top: 24px;">
          Regards,<br />
          Railtel Corporation of India<br />
          e-Office Helpdesk Team
        </p>
      </div>
    `;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      toEmail: user.email,
      body: htmlBody,
      title: emailTitle,
      subject: emailSubject,
    }),
  });

  const result = await response.json();

  if (result?.message === "wrongEmail") {
    return "ERROR";
  } else if (result?.message === "emailSendSuccess") {
    return "SUCCESS";
  } else {
    return "ERROR";
  }
}



export async function sendTicketEmail(user: ticketEmailPaylaod): Promise<"SUCCESS" | "ERROR"> {
  const url = "https://emailsenderapi.afrid.live/sendEmail/";

  let subject: string = '';
  let title: string = '';
  let htmlBody: string = '';

  if (user.type === "ticketCreated") {
    subject = `Ticket #${user.ticketNumber} Created - Railtel e-Office`;
    title = "New Ticket Created";
    htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0055A4;">Your Ticket Has Been Created</h2>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your ticket has been successfully created with the following details:</p>

        <ul style="list-style: none; padding: 0;">
          <li><strong>Ticket Number:</strong> ${user.ticketNumber}</li>
        </ul>

        <p>Our support team will review your issue and get back to you shortly.</p>

        <p style="margin-top: 24px;">
          Regards,<br />
          Railtel Corporation of India<br />
          e-Office Helpdesk Team
        </p>
      </div>
    `;
  } else if (user.type === "ticketResolved") {
    subject = `Ticket #${user.ticketNumber} Resolved - Railtel e-Office`;
    title = "Ticket Resolved";
    htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #28a745;">Your Ticket Has Been Resolved</h2>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your ticket has been marked as resolved with the following details:</p>

        <ul style="list-style: none; padding: 0;">
          <li><strong>Ticket Number:</strong> ${user.ticketNumber}</li>
        </ul>

        <p>If you believe your issue is not resolved, please feel free to reopen the ticket or contact support.</p>

        <p style="margin-top: 24px;">
          Regards,<br />
          Railtel Corporation of India<br />
          e-Office Helpdesk Team
        </p>
      </div>
    `;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      toEmail: user.email,
      body: htmlBody,
      title,
      subject,
    }),
  });

  const result = await response.json();
  return result?.message === "emailSendSuccess" ? "SUCCESS" : "ERROR";
}
