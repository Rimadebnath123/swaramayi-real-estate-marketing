import React from 'react';
import SEO from '../../components/Common/SEO';
import Breadcrumbs from '../../components/Common/Breadcrumbs';

export default function CookiePolicy() {
  return (
    <>
      <SEO title="Cookie Policy | Swaramayi Real Estate Marketing" />

      <div className="bg-light-bg min-h-screen pb-16">
        <div className="bg-navy-900 text-white py-10 border-b border-gold-500/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: 'Cookie Policy' }]} />
            <h1 className="text-3xl font-extrabold text-white mt-1">Cookie Policy</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed">
            <h2 className="text-base font-bold text-navy-900">How We Use Cookies</h2>
            <p>
              Swaramayi Real Estate Marketing uses session cookies to store saved favorite properties, compare selections, and maintain authentication tokens for seamless browsing across Kolkata property listings.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
