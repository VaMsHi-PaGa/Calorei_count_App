"""
Email service for sending password reset and welcome emails.
"""

import logging
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

logger = logging.getLogger(__name__)

# Configuration from environment
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@fittrack.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def send_password_reset_email(email: str, reset_token: str, user_name: Optional[str] = None) -> bool:
    """
    Send a password reset email with a secure link.

    Args:
        email: Recipient email address
        reset_token: Secure token for password reset
        user_name: Optional user's first name for personalization

    Returns:
        True if sent successfully, False otherwise
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning(f"Email service not configured. Reset link: {FRONTEND_URL}/reset?token={reset_token}")
        return True

    reset_link = f"{FRONTEND_URL}/reset?token={reset_token}"
    subject = "Reset Your FitTrack Password"

    name_greeting = f"Hi {user_name}," if user_name else "Hello,"

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669;">FitTrack</h2>
          <p>{name_greeting}</p>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <p style="margin: 30px 0;">
            <a href="{reset_link}" style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 12px;">{reset_link}</p>
          <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
          <p style="color: #999; font-size: 12px;">© 2026 FitTrack. All rights reserved.</p>
        </div>
      </body>
    </html>
    """

    text_body = f"""
    {name_greeting}

    We received a request to reset your password. Click the link below to create a new password:

    {reset_link}

    This link expires in 1 hour.

    If you didn't request this, you can safely ignore this email.

    © 2026 FitTrack. All rights reserved.
    """

    return _send_email(email, subject, text_body, html_body)


def send_welcome_email(email: str, user_name: Optional[str] = None) -> bool:
    """
    Send a welcome email to a new user.

    Args:
        email: Recipient email address
        user_name: Optional user's first name for personalization

    Returns:
        True if sent successfully, False otherwise
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning(f"Email service not configured. Welcome email would be sent to {email}")
        return True

    subject = "Welcome to FitTrack!"
    name_greeting = f"Hi {user_name}," if user_name else "Hello,"

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669;">Welcome to FitTrack! 🎉</h2>
          <p>{name_greeting}</p>
          <p>Your account has been created successfully. You're now ready to start tracking your fitness journey.</p>
          <p style="margin: 20px 0;">Here's what you can do:</p>
          <ul>
            <li>Log your meals and let AI estimate nutrition</li>
            <li>Track your weight and see progress</li>
            <li>Monitor water intake</li>
            <li>Get personalized insights</li>
          </ul>
          <p style="margin: 30px 0;">
            <a href="{FRONTEND_URL}/dashboard" style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </p>
          <p style="color: #999; font-size: 12px;">Questions? We're here to help!</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">© 2026 FitTrack. All rights reserved.</p>
        </div>
      </body>
    </html>
    """

    text_body = f"""
    {name_greeting}

    Welcome to FitTrack! Your account has been created successfully.

    You can now:
    - Log your meals and let AI estimate nutrition
    - Track your weight and see progress
    - Monitor water intake
    - Get personalized insights

    Start here: {FRONTEND_URL}/dashboard

    © 2026 FitTrack. All rights reserved.
    """

    return _send_email(email, subject, text_body, html_body)


def _send_email(to_email: str, subject: str, text_body: str, html_body: str) -> bool:
    """
    Internal function to send email via SMTP.

    Args:
        to_email: Recipient email
        subject: Email subject
        text_body: Plain text email body
        html_body: HTML email body

    Returns:
        True if sent successfully, False otherwise
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM_EMAIL
        msg["To"] = to_email

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)

        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False
