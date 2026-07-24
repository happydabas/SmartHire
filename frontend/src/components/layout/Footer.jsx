import React from 'react';

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
      &copy; {new Date().getFullYear()} SmartHire Job Portal. All rights reserved.
    </footer>
  );
}

export default Footer;
