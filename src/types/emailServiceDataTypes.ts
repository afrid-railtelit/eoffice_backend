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
    enabled: boolean;
};
