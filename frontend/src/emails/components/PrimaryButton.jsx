import React from 'react';

export function PrimaryButton({ text, url }) {
  return (
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style={{ borderCollapse: 'collapse' }}>
      <tbody>
        <tr>
          <td align="center" style={{ padding: '24px 0 8px 0' }}>
            <a
              href={url}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '12px 28px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'inline-block',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.15)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {text}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default PrimaryButton;
