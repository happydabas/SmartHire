import React from 'react';
import BaseEmail from '../layouts/BaseEmail';
import PrimaryButton from '../components/PrimaryButton';

export function AccountVerificationEmail({ userName, actionUrl }) {
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
        Verify Your Email Address
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
        Thank you for registering with SmartHire! Please click the button below to verify your email address and activate your account.
      </p>

      <PrimaryButton text="Verify Email" url={displayUrl} />

      <p style={{
        fontSize: '14px',
        color: '#475569',
        margin: '24px 0 0 0',
        lineHeight: '1.6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        Verifying your email ensures you can receive important applicant updates, interview schedules, and job posting notifications.
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

export default AccountVerificationEmail;
