import React from 'react';

export function EmailHeader() {
  return (
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style={{
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      borderCollapse: 'collapse'
    }}>
      <tbody>
        <tr>
          <td align="center" style={{ padding: '24px' }}>
            <span style={{
              fontSize: '22px',
              fontWeight: '900',
              color: '#2563eb',
              letterSpacing: '-0.5px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Smart<span style={{ color: '#0f172a' }}>Hire</span>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default EmailHeader;
