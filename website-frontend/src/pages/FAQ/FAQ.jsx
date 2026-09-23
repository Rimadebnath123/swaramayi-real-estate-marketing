import React, { useState } from 'react';
import SEO from '../../components/Common/SEO';
import Breadcrumbs from '../../components/Common/Breadcrumbs';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How do I search for a property on Swarnamayi?',
    a: 'Use our floating search bar on the homepage or head to the /properties page. You can filter by category (Buy, Rent, Commercial), location (New Town, Rajarhat, Salt Lake), BHK size, price range, and furnishing.',
  },
  {
    q: 'How can I schedule a free site visit?',
    a: 'On any property details page, simply click "Schedule Site Visit", pick your preferred date and time slot, and enter your phone number. Our Swarnamayi site tour representative will confirm your visit.',
  },
  {
    q: 'Can I contact an official agent directly?',
    a: 'Yes, every property listing displays the assigned Swarnamayi advisor with direct phone and WhatsApp contact buttons.',
  },
  {
    q: 'How do I list my property for sale or rent with Swarnamayi?',
    a: 'Click the "List Property" or "Contact Us" button in the top navbar or call our helpline (+91 89021 30791). Our team will arrange property inspection and digital marketing.',
  },
  {
    q: 'What documents are generally required for buying property in Kolkata?',
    a: 'Key documents include Title Deed, Encumbrance Certificate, Approved Building Sanction Plan, WBRERA Registration Certificate, Mutation Certificate, and Tax receipts.',
  },
  {
    q: 'What is WBRERA and why is it important?',
    a: 'West Bengal Real Estate Regulatory Authority (WBRERA) ensures transparency and buyer protection. Properties approved under RERA adhere to strict construction schedules and transparent legal terms.',
  },
  {
    q: 'Can I compare properties side-by-side?',
    a: 'Yes! Click "+ Compare" on up to 4 property listings and visit the /compare page to view a detailed side-by-side spec comparison matrix.',
  },
  {
    q: 'How do I save properties for later review?',
    a: 'Click the heart icon on any property card to save it to your Favorites page (/favorites). Your saved items are preserved automatically.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (i) => setOpenIdx(openIdx === i ? -1 : i);

  return (
    <>
      <SEO title="Frequently Asked Questions (FAQ) | Swarnamayi Real Estate" />

      <div className="bg-light-bg min-h-screen pb-16">
        <div className="bg-navy-900 text-white py-10 border-b border-gold-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: 'Frequently Asked Questions' }]} />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Frequently Asked Questions</h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
              Answers to common property search, site visit, legal, and listing questions.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggle(i)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-navy-900 text-sm hover:text-gold-600 transition-colors"
                >
                  <span className="flex items-center space-x-3">
                    <HelpCircle className="w-5 h-5 text-gold-500 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${openIdx === i ? 'rotate-180 text-gold-600' : ''}`}
                  />
                </button>
                {openIdx === i && (
                  <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
