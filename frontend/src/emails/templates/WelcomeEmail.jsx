import React from 'react';
import BaseEmail from '../layouts/BaseEmail';
import PrimaryButton from '../components/PrimaryButton';

export function WelcomeEmail({ userName, actionUrl }) {
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
        Welcome to SmartHire, {displayUserName}!
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#475569',
        margin: '0 0 20px 0',
        lineHeight: '1.6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        We're thrilled to have you join our professional community. SmartHire is designed to make job seeking and hiring faster, smarter, and more direct.
      </p>
      <p style={{
        fontSize: '14px',
        color: '#475569',
        margin: '0 0 24px 0',
        lineHeight: '1.6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        To get started, set up your profile, upload your resume, and browse through our active job listings.
      </p>
      
      <PrimaryButton text="Go to Dashboard" url={displayUrl} />
      
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

export default WelcomeEmail;
