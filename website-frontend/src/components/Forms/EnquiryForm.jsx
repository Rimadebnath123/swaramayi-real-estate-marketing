import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { enquiryService } from '../../services/enquiryService';

export default function EnquiryForm({ propertyId, propertyTitle }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Property Consultation',
    bhk: '3 BHK',
    propertyType: 'Apartment',
    message: 'I am interested in this property. Please contact me with more information.',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setErrorMsg('Please fill in your name and phone number.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await enquiryService.submitEnquiry({
        ...formData,
        propertyInterested: propertyId,
        propertyTitle: propertyTitle,
      });
      setSuccessMsg(res.message || 'Enquiry submitted successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Property Consultation',
        bhk: '3 BHK',
        propertyType: 'Apartment',
        message: '',
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-navy-900 text-white rounded-2xl p-6 border border-gold-500/30 shadow-navy">
      <h3 className="text-lg font-bold text-white mb-1">Enquire About Property</h3>
      <p className="text-xs text-gray-400 mb-5">
        Connect with Swarnamayi real estate advisors for verified details and site visits.
      </p>

      {successMsg ? (
        <div className="bg-green-900/50 border border-green-500 text-green-300 p-4 rounded-xl flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold">{successMsg}</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sujay Mukherjee"
              className="w-full bg-navy-800 border border-gray-700 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 89021 XXXXX"
                className="w-full bg-navy-800 border border-gray-700 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sujay@example.com"
                className="w-full bg-navy-800 border border-gray-700 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full bg-navy-800 border border-gray-700 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none font-semibold"
            >
              <option value="Property Consultation">Property Consultation</option>
              <option value="List My Property">List My Property</option>
              <option value="Schedule Site Visit">Schedule Site Visit</option>
              <option value="Commercial Inquiry">Commercial Inquiry</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
                BHK Requirement
              </label>
              <select
                value={formData.bhk}
                onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
                className="w-full bg-navy-800 border border-gray-700 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none font-semibold"
              >
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="4+ BHK / Duplex">4+ BHK / Duplex</option>
                <option value="Commercial / Plot (N/A)">Commercial / Plot (N/A)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
                Property Type
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full bg-navy-800 border border-gray-700 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none font-semibold"
              >
                <option value="Apartment">Apartment</option>
                <option value="Sky Penthouse">Sky Penthouse</option>
                <option value="Villas & Independent Houses">Villas & Independent Houses</option>
                <option value="Commercial Offices">Commercial Offices</option>
                <option value="Retail Shops">Retail Shops</option>
                <option value="Plots & Land">Plots & Land</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
              Message / Special Request
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-navy-800 border border-gray-700 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:border-gold-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-extrabold py-3 rounded-xl shadow-gold transition-all duration-300 flex items-center justify-center space-x-2 text-xs sm:text-sm"
          >
            {loading ? (
              <span>Submitting...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>SEND ENQUIRY NOW</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
