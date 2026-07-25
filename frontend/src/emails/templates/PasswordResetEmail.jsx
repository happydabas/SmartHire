import React from 'react';
import BaseEmail from '../layouts/BaseEmail';
import PrimaryButton from '../components/PrimaryButton';

export function PasswordResetEmail({ userName, actionUrl }) {
  const displayUserName = userName || '{{userName}}';
  const displayUrl = actionUrl || '{{actionUrl}}';

  return (
    <BaseEmail>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#0f172a',
        margin: '0 0 16px 0',
        lineHeight: '1.3',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        Reset Your Password
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#475569',
        margin: '0 0 20px 0',
        lineHeight: '1.6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        Hi {displayUserName},
      </p>
      <p style={{
        fontSize: '14px',
        color: '#475569',
        margin: '0 0 24px 0',
        lineHeight: '1.6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        We received a request to reset the password for your SmartHire account. Click the button below to set a new password.
      </p>

      <PrimaryButton text="Reset Password" url={displayUrl} />

      <p style={{
        fontSize: '12px',
        color: '#e11d48',
        backgroundColor: '#fff1f2',
        border: '1px solid #ffe4e6',
        borderRadius: '8px',
        padding: '12px',
        margin: '24px 0',
        lineHeight: '1.5',
        fontWeight: 'bold',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        ⚠️ This reset link is secure and will expire in 60 minutes. If you did not request a password change, please ignore this email.
      </p>

      <p style={{
        fontSize: '12px',
        color: '#94a3b8',
        margin: '24px 0 0 0',
        lineHeight: '1.5',
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        If the button above doesn't work, copy and paste this link into your browser:<br />
        <a href={displayUrl} style={{ color: '#2563eb', textDecoration: 'underline' }}>{displayUrl}</a>
      </p>
    </BaseEmail>
  );
}

export default PasswordResetEmail;
