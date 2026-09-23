import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/918902130791?text=${encodeURIComponent(
    'Hello Swarnamayi Real Estate Team, I would like to inquire about properties in Kolkata.'
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border-2 border-white"
      title="Chat on WhatsApp"
    >
      <MessageSquare className="w-6 h-6 fill-current" />
    </a>
  );
}
