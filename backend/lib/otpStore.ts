type OtpEntry = {
  code: string;
  expiresAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __otpStore: Map<string, OtpEntry> | undefined;
}

export const otpStore =
  globalThis.__otpStore ??
  (globalThis.__otpStore = new Map<string, OtpEntry>());
