import React from 'react';
import { APP_NAME } from '../../utils/constants';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-secondary-200 py-4 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-secondary-500">
          © {currentYear} {APP_NAME}. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
