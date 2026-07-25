import React from 'react';
import BaseEmail from '../layouts/BaseEmail';
import PrimaryButton from '../components/PrimaryButton';

export function ApplicationSubmittedEmail({ userName, jobTitle, companyName, applicationDate, actionUrl }) {
  const displayUserName = userName || '{{userName}}';
  const displayJobTitle = jobTitle || '{{jobTitle}}';
  const displayCompanyName = companyName || '{{companyName}}';
  const displayDate = applicationDate || '{{applicationDate}}';
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
        Application Submitted!
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#475569',
        margin: '0 0 24px 0',
        lineHeight: '1.6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        Hi {displayUserName}, your job application has been successfully submitted to the employer.
      </p>

      {/* Summary box */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        margin: '0 0 24px 0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '0 0 8px 0', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>JOB TITLE</td>
            </tr>
            <tr>
              <td style={{ padding: '0 0 16px 0', fontSize: '14px', color: '#0f172a', fontWeight: 'extrabold' }}>{displayJobTitle}</td>
            </tr>
            <tr>
              <td style={{ padding: '0 0 8px 0', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>COMPANY</td>
            </tr>
            <tr>
              <td style={{ padding: '0 0 16px 0', fontSize: '14px', color: '#0f172a', fontWeight: 'bold' }}>{displayCompanyName}</td>
            </tr>
            <tr>
              <td style={{ padding: '0 0 8px 0', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>APPLICATION DATE</td>
            </tr>
            <tr>
              <td style={{ fontSize: '13px', color: '#0f172a', fontWeight: 'bold' }}>{displayDate}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{
        fontSize: '14px',
        color: '#475569',
        margin: '0 0 24px 0',
        lineHeight: '1.6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        The recruiter will review your application soon. You will receive email and in-app alerts whenever there's an update to your candidate stage.
      </p>

      <PrimaryButton text="View Application" url={displayUrl} />

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

export default ApplicationSubmittedEmail;
