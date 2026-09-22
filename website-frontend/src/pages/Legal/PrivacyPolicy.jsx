import React from 'react';
import SEO from '../../components/Common/SEO';
import Breadcrumbs from '../../components/Common/Breadcrumbs';

export default function PrivacyPolicy() {
  return (
    <>
      <SEO title="Privacy Policy | Swaramayi Real Estate Marketing" />

      <div className="bg-light-bg min-h-screen pb-16">
        <div className="bg-navy-900 text-white py-10 border-b border-gold-500/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
            <h1 className="text-3xl font-extrabold text-white mt-1">Privacy Policy</h1>
            <p className="text-xs text-gray-300 mt-1">Last Updated: September 2026</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed">
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl font-medium">
              Note: This is standard informational privacy text. Actual company privacy terms should be reviewed by legal counsel.
            </div>

            <h2 className="text-base font-bold text-navy-900">1. Information Collection</h2>
            <p>
              Swaramayi Real Estate Marketing collects information provided voluntarily when submitting property enquiries, scheduling site visits, or listing real estate properties.
            </p>

            <h2 className="text-base font-bold text-navy-900">2. Use of Information</h2>
            <p>
              Your contact details are strictly utilized to connect you with official Swaramayi real estate advisors, coordinate physical property tours, and process legal documentation.
            </p>

            <h2 className="text-base font-bold text-navy-900">3. Data Security</h2>
            <p>
              We enforce appropriate database security measures and encryption to prevent unauthorized access or disclosure of client records.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
