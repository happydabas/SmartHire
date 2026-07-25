import React from 'react';

export function EmailFooter() {
  return (
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style={{
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      borderCollapse: 'collapse'
    }}>
      <tbody>
        <tr>
          <td style={{ 
            padding: '24px', 
            textAlign: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            <p style={{
              fontSize: '11px',
              color: '#64748b',
              margin: '0 0 6px 0',
              fontWeight: 'bold'
            }}>
              © {new Date().getFullYear()} SmartHire Inc. All rights reserved.
            </p>
            <p style={{
              fontSize: '10px',
              color: '#94a3b8',
              margin: '0 0 16px 0',
              lineHeight: '1.4'
            }}>
              100 Fashion Ave, Suite 400, New York, NY 10001
            </p>
            <p style={{
              fontSize: '11px',
              margin: 0
            }}>
              <a href="mailto:support@smarthire.com" style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>
                support@smarthire.com
              </a>
              <span style={{ color: '#cbd5e1', margin: '0 8px' }}>|</span>
              <a href="#" style={{
                color: '#64748b',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>
                Privacy Policy
              </a>
              <span style={{ color: '#cbd5e1', margin: '0 8px' }}>|</span>
              <a href="#" style={{
                color: '#64748b',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>
                Unsubscribe
              </a>
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default EmailFooter;
