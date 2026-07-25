import React from 'react';
import EmailHeader from '../components/EmailHeader';
import EmailFooter from '../components/EmailFooter';

export function BaseEmail({ children }) {
  return (
    <div style={{
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '40px 16px',
      margin: 0,
      width: '100%',
      boxSizing: 'border-box',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style={{
        maxWidth: '560px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        borderCollapse: 'collapse',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
      }}>
        <tbody>
          <tr>
            <td style={{ padding: '0px' }}>
              <EmailHeader />
              <div style={{ padding: '32px 24px' }}>
                {children}
              </div>
              <EmailFooter />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default BaseEmail;
