import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Send OTP ─────────────────────────────────────────────────────────────────

type SendOtpEmailParams = {
  to: string;
  code: string;
};

export async function sendOtpEmail({ to, code }: SendOtpEmailParams) {
  const { data, error } = await resend.emails.send({
    from: "Founder OS <noreply@mail.creworklabs.com>",
    to,
    subject: `Your verification code: ${code}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222222;border-radius:8px;overflow:hidden;">

                  <!-- Header -->
                  <tr>
                    <td style="padding:28px 36px 20px;border-bottom:1px solid #222222;">
                      <p style="margin:0;font-size:12px;color:#666666;letter-spacing:0.1em;text-transform:uppercase;">Crework Labs</p>
                      <h1 style="margin:6px 0 0;font-size:20px;font-weight:600;color:#ffffff;letter-spacing:-0.02em;">Founder OS</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 36px;">
                      <p style="margin:0 0 24px;font-size:14px;color:#aaaaaa;line-height:1.6;">
                        Use the code below to verify your email and unlock your full report. It expires in 10 minutes.
                      </p>

                      <!-- OTP code block -->
                      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:24px;text-align:center;margin:0 0 28px;">
                        <p style="margin:0 0 6px;font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:0.1em;">Your verification code</p>
                        <p style="margin:0;font-size:40px;font-weight:700;color:#ffffff;letter-spacing:0.18em;">${code}</p>
                      </div>

                      <p style="margin:0;font-size:12px;color:#444444;line-height:1.6;">
                        If you didn't request this, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:18px 36px;border-top:1px solid #1e1e1e;">
                      <p style="margin:0;font-size:12px;color:#444444;">
                        Sent by <a href="https://creworklabs.com" style="color:#666666;text-decoration:none;">Crework Labs</a>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Resend OTP error: ${error.message}`);
  }

  return data;
}

// ─── Send Report ──────────────────────────────────────────────────────────────

type SendReportEmailParams = {
  to: string;
  ideaSummary: string;
  archetype: string;
  reportUrl: string;
};

export async function sendReportEmail({
  to,
  ideaSummary,
  archetype,
  reportUrl,
}: SendReportEmailParams) {
  const archetypeLabel: Record<string, string> = {
    saas_tool: "SaaS Tool",
    marketplace: "Marketplace",
    consumer_app: "Consumer App",
    ai_wrapper: "AI-Powered Tool",
    b2b_platform: "B2B Platform",
    community: "Community Platform",
    ecommerce: "E-Commerce",
    developer_tool: "Developer Tool",
  };

  const label = archetypeLabel[archetype] ?? "Startup";

  const { data, error } = await resend.emails.send({
    from: "Founder OS <noreply@mail.creworklabs.com>",
    to,
    subject: `Your ${label} founder report is ready`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222222;border-radius:8px;overflow:hidden;">

                  <!-- Header -->
                  <tr>
                    <td style="padding:32px 40px 24px;border-bottom:1px solid #222222;">
                      <p style="margin:0;font-size:13px;color:#666666;letter-spacing:0.1em;text-transform:uppercase;">Crework Labs</p>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;color:#ffffff;letter-spacing:-0.02em;">Founder OS</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 40px;">
                      <p style="margin:0 0 16px;font-size:15px;color:#aaaaaa;line-height:1.6;">
                        Your report is ready. Here's a quick summary of what we found for your idea:
                      </p>

                      <!-- Idea pill -->
                      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:16px 20px;margin:0 0 24px;">
                        <p style="margin:0 0 4px;font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:0.08em;">Your idea</p>
                        <p style="margin:0;font-size:14px;color:#dddddd;line-height:1.5;">${ideaSummary}</p>
                      </div>

                      <!-- What's inside -->
                      <p style="margin:0 0 12px;font-size:13px;font-weight:500;color:#ffffff;">Your report includes:</p>
                      <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 28px;">
                        <tr>
                          <td style="padding:8px 0;border-bottom:1px solid #1e1e1e;">
                            <span style="font-size:13px;color:#aaaaaa;">A &nbsp;&nbsp;</span>
                            <span style="font-size:13px;color:#dddddd;">Idea Validator — demand signals, communities, competitor gaps</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;border-bottom:1px solid #1e1e1e;">
                            <span style="font-size:13px;color:#aaaaaa;">B &nbsp;&nbsp;</span>
                            <span style="font-size:13px;color:#dddddd;">MVP Scope Builder — what to build, what to skip, complexity score</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;">
                            <span style="font-size:13px;color:#aaaaaa;">C &nbsp;&nbsp;</span>
                            <span style="font-size:13px;color:#dddddd;">Build Readiness Audit — spec check, team fit, 3-week roadmap</span>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA -->
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#ffffff;border-radius:6px;">
                            <a href="${reportUrl}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:500;color:#000000;text-decoration:none;letter-spacing:-0.01em;">
                              View your full report →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #1e1e1e;">
                      <p style="margin:0;font-size:12px;color:#444444;line-height:1.6;">
                        Sent by <a href="https://creworklabs.com" style="color:#666666;text-decoration:none;">Crework Labs</a> · 
                        We build MVPs for non-technical founders ·
                        <a href="https://creworklabs.com" style="color:#666666;text-decoration:none;">Unsubscribe</a>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return data;
}
// ─── Send Full Report PDF ──────────────────────────────────────────────────

type SendFullReportEmailParams = {
  to: string;
  ideaSummary: string;
  pdfBuffer: Buffer;
};

export async function sendFullReportEmail({
  to,
  ideaSummary,
  pdfBuffer,
}: SendFullReportEmailParams) {
  const { data, error } = await resend.emails.send({
    from: "Founder OS <noreply@mail.creworklabs.com>",
    to,
    subject: "Your full Founder OS report (PDF)",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222222;border-radius:8px;overflow:hidden;">
                <tr><td style="padding:28px 36px 20px;border-bottom:1px solid #222222;">
                  <p style="margin:0;font-size:12px;color:#666666;letter-spacing:0.1em;text-transform:uppercase;">Crework Labs</p>
                  <h1 style="margin:6px 0 0;font-size:20px;color:#ffffff;">Founder OS</h1>
                </td></tr>
                <tr><td style="padding:32px 36px;">
                  <p style="margin:0 0 16px;font-size:14px;color:#aaaaaa;line-height:1.6;">
                    Your full report is attached as a PDF — demand validation, MVP scope, and your 28-day build plan.
                  </p>
                  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#555555;text-transform:uppercase;">Your idea</p>
                    <p style="margin:0;font-size:13px;color:#dddddd;">${ideaSummary}</p>
                  </div>
                </td></tr>
                <tr><td style="padding:18px 36px;border-top:1px solid #1e1e1e;">
                  <p style="margin:0;font-size:12px;color:#444444;">Sent by <a href="https://creworklabs.com" style="color:#666666;text-decoration:none;">Crework Labs</a></p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `,
    attachments: [
      {
        filename: "founderos-report.pdf",
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(`Resend full-report error: ${error.message}`);
  }

  return data;
}