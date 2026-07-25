import React from 'react';
import BaseEmail from '../layouts/BaseEmail';
import PrimaryButton from '../components/PrimaryButton';

export function InterviewInvitationEmail({ userName, jobTitle, companyName, interviewDate, interviewTime, interviewLocation, actionUrl }) {
  const displayUserName = userName || '{{userName}}';
  const displayJobTitle = jobTitle || '{{jobTitle}}';
  const displayCompanyName = companyName || '{{companyName}}';
  const displayDate = interviewDate || '{{interviewDate}}';
  const displayTime = interviewTime || '{{interviewTime}}';
  const displayLocation = interviewLocation || '{{interviewLocation}}';
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
        Interview Invitation!
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#475569',
        margin: '0 0 24px 0',
        lineHeight: '1.6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        Hi {displayUserName}, you have been invited to an interview for the following position:
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
              <td style={{ padding: '0 0 4px 0', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>ROLE</td>
              <td style={{ padding: '0 0 4px 0', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>COMPANY</td>
            </tr>
            <tr>
              <td style={{ padding: '0 0 16px 0', fontSize: '14px', color: '#0f172a', fontWeight: 'extrabold' }}>{displayJobTitle}</td>
              <td style={{ padding: '0 0 16px 0', fontSize: '14px', color: '#0f172a', fontWeight: 'bold' }}>{displayCompanyName}</td>
            </tr>
            <tr>
              <td style={{ padding: '0 0 4px 0', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>DATE</td>
              <td style={{ padding: '0 0 4px 0', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>TIME</td>
            </tr>
            <tr>
              <td style={{ padding: '0 0 16px 0', fontSize: '14px', color: '#0f172a', fontWeight: 'bold' }}>{displayDate}</td>
              <td style={{ padding: '0 0 16px 0', fontSize: '14px', color: '#0f172a', fontWeight: 'bold' }}>{displayTime}</td>
            </tr>
            <tr>
              <td colSpan="2" style={{ padding: '0 0 4px 0', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>LOCATION / MEETING LINK</td>
            </tr>
            <tr>
              <td colSpan="2" style={{ fontSize: '13px', color: '#2563eb', fontWeight: 'bold', wordBreak: 'break-all' }}>{displayLocation}</td>
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
        Please review the details and confirm your attendance or make rescheduling arrangements if necessary.
      </p>

      <PrimaryButton text="View Interview Details" url={displayUrl} />

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

export default InterviewInvitationEmail;
