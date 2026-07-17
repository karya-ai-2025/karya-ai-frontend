'use client';
// pages/SupportHelp.jsx
import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Phone, Mail, Upload, Bell, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const authHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
};

function SupportHelp() {
  const router = useRouter();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal',
    screenshot: null
  });

  const [ticketResult, setTicketResult] = useState(null); // { type: 'success'|'error', message }
  const [sending, setSending] = useState(false);
  const [remaining, setRemaining] = useState(null); // support emails left (max 3)
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');
  const [subEmail, setSubEmail] = useState('');

  // Load how many support emails the user has left + subscription state.
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    fetch(`${API_URL}/support/status`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setRemaining(d.data.remaining);
          setSubscribed(!!d.data.subscribed);
        }
      })
      .catch(() => {});
  }, []);

  // Sends the message through the backend → arrives at ashish@karya-ai.com
  // with Reply-To set to the user's email. Max 3 per user.
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setTicketResult(null);
    if (!localStorage.getItem('token')) {
      setTicketResult({ type: 'error', message: 'Please log in to contact support.' });
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/support/contact`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send message');
      setTicketResult({
        type: 'success',
        message: `Message sent to our team ✓${data.remaining != null ? ` — you can send ${data.remaining} more email${data.remaining === 1 ? '' : 's'}.` : ''}`,
      });
      if (data.remaining != null) setRemaining(data.remaining);
      setContactForm({ name: '', email: '', subject: '', message: '', priority: 'normal', screenshot: null });
    } catch (err) {
      setTicketResult({ type: 'error', message: err.message });
    } finally {
      setSending(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubError('');
    if (!localStorage.getItem('token')) {
      setSubError('Please log in to subscribe.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/support/subscribe`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to subscribe');
      setSubscribed(true);
    } catch (err) {
      setSubError(err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setContactForm({ ...contactForm, screenshot: file });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">We're Here to Help</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Support</h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Reach our team directly, or subscribe to stay updated on system status.
          </p>
        </div>

        {/* Direct contact — phone + email */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500">Call us</p>
              <a href="tel:+919876543210" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                +91 98765 43210
              </a>
              <p className="text-xs text-gray-400 mt-0.5">Mon–Sat, 9am–7pm IST</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500">Email us</p>
              <a href="mailto:ashish@karya-ai.com" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors break-all">
                ashish@karya-ai.com
              </a>
              <p className="text-xs text-gray-400 mt-0.5">We reply within a few hours</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Contact Support Form */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              <h3 className="text-2xl font-bold text-gray-900">Contact Support</h3>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows="5"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Describe your issue in detail..."
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Priority</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value="normal"
                        checked={contactForm.priority === 'normal'}
                        onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                        className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Normal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value="urgent"
                        checked={contactForm.priority === 'urgent'}
                        onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                        className="w-4 h-4 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-gray-700">Urgent</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Screenshot (optional)</label>
                  <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-500 text-sm">
                      {contactForm.screenshot ? contactForm.screenshot.name : 'Upload screenshot'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {ticketResult && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${
                  ticketResult.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-[#fef2f2] border-[#fca5a5] text-[#b91c1c]'
                }`}>
                  {ticketResult.message}
                </div>
              )}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={sending || remaining === 0}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {remaining === 0 ? 'Email limit reached' : sending ? 'Sending…' : 'Send Message'}
                </button>
                {remaining != null && remaining > 0 && (
                  <span className="text-xs text-gray-400">{remaining} of 3 emails left</span>
                )}
                {remaining === 0 && (
                  <span className="text-xs text-gray-400">Please call us instead</span>
                )}
              </div>
            </form>
          </div>

          {/* Subscribe to Updates */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-bold text-gray-900">Subscribe to Updates</h3>
            </div>

            <p className="text-gray-500 mb-6">
              Get notified about system incidents, maintenance windows, and status updates.
            </p>

            <form className="space-y-4" onSubmit={handleSubscribe}>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium mb-2">Notification Preferences</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500" defaultChecked />
                  <span className="text-gray-600 text-sm">Incidents & Outages</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500" defaultChecked />
                  <span className="text-gray-600 text-sm">Scheduled Maintenance</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500" />
                  <span className="text-gray-600 text-sm">Feature Announcements</span>
                </label>
              </div>

              {subscribed && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700">
                  ✓ You're subscribed — we'll keep you posted.
                </div>
              )}
              {subError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-[#fef2f2] border border-[#fca5a5] rounded-lg text-sm font-medium text-[#b91c1c]">
                  {subError}
                </div>
              )}
              <button
                type="submit"
                disabled={subscribed}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 disabled:opacity-50 rounded-lg text-white font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                {subscribed ? 'Subscribed ✓' : 'Subscribe to Updates'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportHelp;
