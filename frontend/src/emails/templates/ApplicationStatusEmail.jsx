import React from 'react';
import BaseEmail from '../layouts/BaseEmail';
import PrimaryButton from '../components/PrimaryButton';

export function ApplicationStatusEmail({ userName, jobTitle, companyName, status, actionUrl }) {
  const displayUserName = userName || '{{userName}}';
  const displayJobTitle = jobTitle || '{{jobTitle}}';
  const displayCompanyName = companyName || '{{companyName}}';
  const displayStatus = (status || '{{status}}').toLowerCase();
  const displayUrl = actionUrl || '{{actionUrl}}';

  let emailTitle = 'Application Status Updated';
  let messageContent = '';

  if (displayStatus.includes('screen')) {
    emailTitle = 'Application Moved to Screening';
    messageContent = `Your application for the ${displayJobTitle} role at ${displayCompanyName} has moved to the Screening stage. The hiring team is currently evaluating your credentials.`;
  } else if (displayStatus.includes('select') || displayStatus.includes('accept') || displayStatus.includes('hire') || displayStatus === 'selected') {
    emailTitle = 'Application Selected!';
    messageContent = `Congratulations! We are delighted to inform you that you have been selected for the ${displayJobTitle} position at ${displayCompanyName}. The recruiter will contact you shortly with matching offer details.`;
  } else if (displayStatus.includes('reject') || displayStatus.includes('decline') || displayStatus === 'rejected') {
    emailTitle = 'Update on your Application';
    messageContent = `Thank you for your interest in the ${displayJobTitle} role at ${displayCompanyName}. After careful consideration, we regret to inform you that we are not moving forward with your application at this time. We wish you the best of luck in your job search.`;
  } else {
    emailTitle = 'Application Status Update';
    messageContent = `Your application for the ${displayJobTitle} role at ${displayCompanyName} has transitioned to: ${status}.`;
  }

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
        {emailTitle}
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
        {messageContent}
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

export default ApplicationStatusEmail;
