import React from 'react';
import SEO from '../../components/Common/SEO';
import Breadcrumbs from '../../components/Common/Breadcrumbs';
import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <>
      <SEO title="Property Disclaimer | Swaramayi Real Estate Marketing" />

      <div className="bg-light-bg min-h-screen pb-16">
        <div className="bg-navy-900 text-white py-10 border-b border-gold-500/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: 'Disclaimer' }]} />
            <h1 className="text-3xl font-extrabold text-white mt-1">Real Estate Disclaimer</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-xs text-gray-700 leading-relaxed">
            <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl flex items-start space-x-3 text-amber-900">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="font-semibold text-sm">Official Property Information Disclaimer</div>
            </div>

            <p className="text-sm font-medium text-navy-900 leading-relaxed bg-gray-50 p-5 rounded-xl border border-gray-200">
              "Property information is provided for informational purposes and may be subject to change. Users should independently verify property details, pricing, availability, approvals and legal documentation before making any financial transaction."
            </p>

            <p>
              Swaramayi Real Estate Marketing operates as a real estate marketing platform and property advisory company in Kolkata, West Bengal. Images, layouts, floor plans, and renderings shown on property listings are illustrative representations.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
