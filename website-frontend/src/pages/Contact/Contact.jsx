import React, { useState } from 'react';
import SEO from '../../components/Common/SEO';
import Breadcrumbs from '../../components/Common/Breadcrumbs';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import API from '../../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Property Consultation',
    bhk: '3 BHK',
    propertyType: 'Apartment',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      alert('Please complete all required fields.');
      return;
    }
    try {
      setLoading(true);
      // Submit contact form with BHK and Property Type
      await API.post('/enquiries', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        bhk: formData.bhk,
        propertyType: formData.propertyType,
        message: `[Requirement: ${formData.bhk} | ${formData.propertyType}] Subject: ${formData.subject} - ${formData.message}`,
      });
      setSuccess(true);
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
      alert('Failed to send message. Please try calling helpline directly.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = `https://wa.me/918902130791?text=${encodeURIComponent(
    'Hello Swarnamayi Real Estate Marketing, I would like to schedule a property consultation.'
  )}`;

  return (
    <>
      <SEO
        title="Contact Swarnamayi Real Estate Marketing | Kolkata Advisory"
        description="Get in touch with Swarnamayi Real Estate Marketing in Kolkata. Phone: +91 89021 30791. Office Address: 4, Samarkunja Apartment, Sarada Sarani, Udayrajpur, North 24 Parganas, Madhyamgram, Kolkata-700129."
      />

      <div className="bg-light-bg min-h-screen pb-16">
        <div className="bg-navy-900 text-white py-10 border-b border-gold-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: 'Contact Us' }]} />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Contact Swarnamayi Advisors</h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
              We are ready to guide your property search, site visits, or listing requirements in Kolkata.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Contact Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                <div className="inline-block bg-white p-2 rounded-xl border border-gold-500/40 shadow-sm">
                  <img src={logoImg} alt="Swarnamayi Logo" className="h-12 w-auto object-contain" />
                </div>
                <h3 className="font-extrabold text-navy-900 text-base border-b pb-2">Swarnamayi Real Estate Marketing</h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-800">Office Address</div>
                      <div className="text-gray-600 mt-0.5">4, Samarkunja Apartment, Sarada Sarani, Udayrajpur, North 24 Parganas, Madhyamgram, Kolkata-700129</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gold-600 shrink-0" />
                    <div>
                      <div className="font-bold text-gray-800">Helpline Phone</div>
                      <a href="tel:+918902130791" className="text-navy-900 font-bold hover:text-gold-600">
                        +91 89021 30791
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gold-600 shrink-0" />
                    <div>
                      <div className="font-bold text-gray-800">Official Email</div>
                      <a href="mailto:avishek@swaramayi.info" className="text-gray-600 hover:text-navy-900">
                        avishek@swaramayi.info
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-800">Business Hours</div>
                      <div className="text-gray-600">Monday - Saturday: 10:00 AM - 7:00 PM</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
                  <a
                    href="tel:+918902130791"
                    className="w-full py-2.5 bg-navy-900 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-4 h-4 text-gold-400" />
                    <span>Call Helpline Now</span>
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-extrabold text-navy-900 mb-2">Send Us a Direct Message</h2>
                <p className="text-xs text-gray-500 mb-6">
                  Fill out the form below and an official Swarnamayi property consultant will connect with you.
                </p>

                {success ? (
                  <div className="bg-green-50 border border-green-300 text-green-800 p-6 rounded-2xl flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
                      <p className="text-xs mt-1">Thank you for reaching out to Swarnamayi. Our advisor will call you shortly.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Sujay Mukherjee"
                          className="w-full bg-gray-50 border border-gray-300 text-navy-900 text-xs rounded-xl p-3 focus:outline-none focus:border-navy-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 89021 XXXXX"
                          className="w-full bg-gray-50 border border-gray-300 text-navy-900 text-xs rounded-xl p-3 focus:outline-none focus:border-navy-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="sujay@example.com"
                          className="w-full bg-gray-50 border border-gray-300 text-navy-900 text-xs rounded-xl p-3 focus:outline-none focus:border-navy-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-300 text-navy-900 text-xs rounded-xl p-3 focus:outline-none focus:border-navy-900"
                        >
                          <option value="Property Consultation">Property Consultation</option>
                          <option value="List My Property">List My Property</option>
                          <option value="Schedule Site Visit">Schedule Site Visit</option>
                          <option value="Commercial Inquiry">Commercial Inquiry</option>
                        </select>
                      </div>
                    </div>

                    {/* BHK & Property Type Requirements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">BHK Requirement</label>
                        <select
                          value={formData.bhk}
                          onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-300 text-navy-900 text-xs rounded-xl p-3 focus:outline-none focus:border-navy-900 font-semibold"
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
                        <label className="block text-xs font-bold text-gray-700 mb-1">Property Type</label>
                        <select
                          value={formData.propertyType}
                          onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-300 text-navy-900 text-xs rounded-xl p-3 focus:outline-none focus:border-navy-900 font-semibold"
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
                      <label className="block text-xs font-bold text-gray-700 mb-1">Your Message *</label>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us what type of property you are looking for in Kolkata..."
                        className="w-full bg-gray-50 border border-gray-300 text-navy-900 text-xs rounded-xl p-3 focus:outline-none focus:border-navy-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-navy-900 hover:bg-navy-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow transition-colors flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4 text-gold-400" />
                      <span>{loading ? 'Sending Message...' : 'SEND MESSAGE NOW'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
