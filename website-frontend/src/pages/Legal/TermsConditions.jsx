import React from 'react';
import SEO from '../../components/Common/SEO';
import Breadcrumbs from '../../components/Common/Breadcrumbs';

export default function TermsConditions() {
  return (
    <>
      <SEO title="Terms & Conditions | Swaramayi Real Estate Marketing" />

      <div className="bg-light-bg min-h-screen pb-16">
        <div className="bg-navy-900 text-white py-10 border-b border-gold-500/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: 'Terms & Conditions' }]} />
            <h1 className="text-3xl font-extrabold text-white mt-1">Terms & Conditions</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-navy-900">1. Acceptance of Terms</h2>
            <p>
              By accessing Swaramayi Real Estate Marketing website, users agree to abide by these terms of service and applicable WBRERA regulations.
            </p>
            <h2 className="text-base font-bold text-navy-900">2. Property Information Accuracy</h2>
            <p>
              While every effort is made to maintain accurate property dimensions, floor plans, and pricing, users are advised to verify title deeds and physical approvals independently.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
