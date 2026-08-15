import smtplib
import asyncio
import logging
from email.message import EmailMessage
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    """
    Centralized reusable service for sending transactional emails via SMTP (e.g. Gmail SMTP).
    - Connects to SMTP_HOST:SMTP_PORT with STARTTLS.
    - Authenticates using settings.SMTP_USERNAME and settings.SMTP_PASSWORD.
    - Never logs passwords or sensitive credentials.
    - Provides HTML and plain-text fallback formatting.
    """

    @property
    def host(self) -> str:
        return settings.SMTP_HOST

    @property
    def port(self) -> int:
        return settings.SMTP_PORT

    @property
    def username(self) -> str:
        return settings.SMTP_USERNAME or settings.SMTP_USER or ""

    @property
    def password(self) -> str:
        return settings.SMTP_PASSWORD or ""

    @property
    def from_email(self) -> str:
        return settings.EMAIL_FROM or settings.EMAILS_FROM_EMAIL or "no-reply@smarthire.com"

    @property
    def frontend_url(self) -> str:
        import os
        env_url = os.getenv("FRONTEND_URL", "").strip()
        if env_url and not ("localhost" in env_url or "127.0.0.1" in env_url):
            return env_url.rstrip('/')
        if settings.FRONTEND_URL and not ("localhost" in settings.FRONTEND_URL or "127.0.0.1" in settings.FRONTEND_URL):
            return settings.FRONTEND_URL.rstrip('/')
        return "https://smarthire-jobs.netlify.app"

    def _send_sync(self, msg: EmailMessage) -> None:
        """Internal synchronous helper executed in a separate thread."""
        if not self.username or not self.password:
            raise ValueError("SMTP_USERNAME or SMTP_PASSWORD is not configured.")

        if self.port == 465:
            with smtplib.SMTP_SSL(self.host, self.port, timeout=15) as server:
                server.login(self.username, self.password)
                server.send_message(msg)
        else:
            try:
                with smtplib.SMTP(self.host, self.port, timeout=8) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(self.username, self.password)
                    server.send_message(msg)
            except Exception as first_err:
                logger.warning("SMTP STARTTLS connection on port %s failed (%s). Retrying with SSL on port 465...", self.port, first_err)
                with smtplib.SMTP_SSL(self.host, 465, timeout=15) as server:
                    server.login(self.username, self.password)
                    server.send_message(msg)

    async def send_email(self, to_email: str, subject: str, html_content: str, text_content: str) -> None:
        """
        Send a multipart HTML + text email asynchronously.
        Handles connection and authentication errors safely without exposing credentials.
        """
        if not self.username or not self.password:
            logger.warning("SMTP_USERNAME or SMTP_PASSWORD not configured in settings. Skipping live email dispatch to %s.", to_email)
            return

        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = self.from_email
        msg['To'] = to_email

        # Set plain-text fallback content
        msg.set_content(text_content)
        # Attach HTML alternative version
        msg.add_alternative(html_content, subtype='html')

        try:
            await asyncio.to_thread(self._send_sync, msg)
            logger.info("Successfully sent email with subject '%s' to %s", subject, to_email)
        except Exception as exc:
            # Mask credentials and log only safe technical details
            logger.error("Failed to deliver email to recipient %s: %s", to_email, str(exc))
            raise RuntimeError(f"Failed to send invitation email to {to_email}: {str(exc)}") from None

    async def send_recruiter_invitation_email(
        self,
        to_email: str,
        company_name: str,
        owner_name: Optional[str],
        invitation_token: str,
        expires_in_days: int = 7
    ) -> None:
        """
        Construct and send a recruiter invitation email containing the CTA acceptance URL.
        Invitation URL format: {FRONTEND_URL}/invitations/accept/{token}
        """
        accept_url = f"{self.frontend_url}/invitations/accept/{invitation_token}"
        subject = f"You're invited to join {company_name} on SmartHire"

        inviter = owner_name if owner_name else "A team member"

        # 1. Fallback Plain-Text Content
        text_content = (
            f"Hello,\n\n"
            f"{inviter} has invited you to join {company_name} as a recruiter on SmartHire.\n\n"
            f"To accept this invitation and set up your recruiter account, click the link below:\n"
            f"{accept_url}\n\n"
            f"This invitation expires in {expires_in_days} days.\n\n"
            f"If you did not expect this invitation, you can safely ignore this email.\n\n"
            f"Best regards,\n"
            f"The SmartHire Team"
        )

        # 2. Responsive Professional HTML Email Template
        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recruiter Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                                Smart<span style="color: #3b82f6;">Hire</span>
                            </div>
                            <div style="font-size: 13px; color: #94a3b8; margin-top: 4px; font-weight: 500;">
                                Recruitment & Talent Platform
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Content Body -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; tracking-tight;">
                                You're invited to join <span style="color: #2563eb;">{company_name}</span>
                            </h2>
                            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                                <strong>{inviter}</strong> has invited you to join <strong>{company_name}</strong> as a Recruiter on SmartHire. Collaborate with your team to post jobs, evaluate candidate applications, and streamline your hiring pipeline.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0;">
                                <tr>
                                    <td align="center" style="border-radius: 12px; background-color: #2563eb;">
                                        <a href="{accept_url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; background-color: #2563eb;">
                                            Accept Invitation &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">
                                ⏱️ This invitation link will expire in <strong>{expires_in_days} days</strong>.
                            </p>
                            
                            <p style="margin: 24px 0 0 0; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                                If you did not expect this invitation, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                                &copy; SmartHire Recruitment System. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"""

        await self.send_email(to_email=to_email, subject=subject, html_content=html_content, text_content=text_content)
