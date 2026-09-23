import React, { useState } from 'react';
import { Phone, Copy, Check, X, MessageSquare } from 'lucide-react';

export default function CallModal({
  isOpen,
  onClose,
  name = 'Swarnamayi Help Desk',
  role = 'Official Advisor',
  phone = '+91 89021 30791',
  whatsappMsg = 'Hello Swarnamayi Real Estate Team, I would like to inquire about properties.'
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanPhone = (phone || '').replace(/[^0-9+]/g, '') || '+918902130791';
  const displayPhone = phone || '+91 89021 30791';
  const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
  const waPhone = digitsOnly.length === 10 ? '91' + digitsOnly : digitsOnly;
  const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(displayPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 relative animate-fadeIn text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-navy-900 p-1 rounded-lg transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 bg-navy-900/5 text-gold-500 rounded-full flex items-center justify-center mx-auto mb-3 border border-gold-500/30 shadow-inner">
          <Phone className="w-7 h-7" />
        </div>

        {/* Advisor Details */}
        <h3 className="text-lg font-extrabold text-navy-900">{name}</h3>
        <p className="text-xs text-gray-500 font-medium mb-4">{role}</p>

        {/* Display Phone Number Box */}
        <div className="bg-navy-900 text-gold-400 py-3 px-4 rounded-xl text-xl font-black mb-4 tracking-wider shadow-inner flex items-center justify-center space-x-2">
          <span>{displayPhone}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 bg-gray-100 hover:bg-gray-200 text-navy-900 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors border border-gray-200"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-navy-900" />
                <span>Copy Number</span>
              </>
            )}
          </button>

          <a
            href={`tel:${cleanPhone}`}
            className="py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <Phone className="w-3.5 h-3.5 text-gold-400" />
            <span>Dial Call</span>
          </a>
        </div>

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-sm"
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
