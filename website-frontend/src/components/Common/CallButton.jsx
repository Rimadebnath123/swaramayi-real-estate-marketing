import React from 'react';
import { Phone } from 'lucide-react';

export default function CallButton() {
  return (
    <a
      href="tel:+918902130791"
      className="fixed bottom-6 left-6 z-40 bg-navy-900 text-gold-400 p-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border-2 border-gold-500/50 sm:hidden"
      title="Call Helpline"
    >
      <Phone className="w-6 h-6" />
    </a>
  );
}
