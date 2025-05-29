export type OtpEmailPayload = {
  email: string;
  name: string;
  otp: string;
  purpose?: "login" | "reset-password"; // optional, default to "login"

};

export type EmailPayload = {
  email: string;
  name: string;
  password?: string;
    enabled?: boolean;
};

export type ticketEmailPaylaod =
  | {
      type: "ticketCreated";
      name: string;
      email: string;
      ticketNumber: string;
      subject: string;
    }
  | {
      type: "ticketResolved";
      name: string;
      email: string;
      ticketNumber: string;
      subject: string;
    };
