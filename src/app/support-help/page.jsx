'use client';
// pages/SupportHelp.jsx
import React, { useState } from 'react';
import { HelpCircle, BookOpen, Video, MessageSquare, Phone, Upload, AlertCircle, CheckCircle, Clock, TrendingUp, ExternalLink, Bell, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  const [featureRequest, setFeatureRequest] = useState({
    title: '',
    description: '',
    category: 'feature'
  });

  const supportTickets = [
    {
      id: '#12345',
      subject: 'Integration question',
      status: 'open',
      created: '1-Mar',
      lastUpdate: '2-Mar',
      statusColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: '#12234',
      subject: 'Billing inquiry',
      status: 'closed',
      created: '20-Feb',
      lastUpdate: '21-Feb',
      statusColor: 'bg-emerald-100 text-emerald-700'
    }
  ];

  const featureRequests = [
    {
      id: 1,
      title: 'Dark mode support',
      description: 'Add dark theme option for better user experience',
      votes: 127,
      status: 'In Progress',
      statusColor: 'bg-blue-100 text-blue-700',
      userVoted: false
    },
    {
      id: 2,
      title: 'Slack integration',
      description: 'Connect workspace notifications to Slack channels',
      votes: 89,
      status: 'Planned',
      statusColor: 'bg-blue-100 text-blue-700',
      userVoted: true
    },
    {
      id: 3,
      title: 'Advanced analytics dashboard',
      description: 'More detailed metrics and reporting capabilities',
      votes: 156,
      status: 'Under Review',
      statusColor: 'bg-amber-100 text-amber-700',
      userVoted: false
    }
  ];

  const recentIncidents = [
    {
      title: 'All Systems Operational',
      description: 'All services are running normally',
      status: 'operational',
      date: '10-Mar',
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      title: 'Minor API Latency - Resolved',
      description: 'Brief increase in API response times. Issue has been resolved.',
      status: 'resolved',
      date: '8-Mar',
      icon: <Clock className="w-5 h-5" />
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
  };

  const handleFeatureRequestSubmit = (e) => {
    e.preventDefault();
    console.log('Feature request submitted:', featureRequest);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setContactForm({ ...contactForm, screenshot: file });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">We're Here to Help</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Support & Help Center
          </h1>

          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Get the help you need, when you need it. Browse resources, contact support, or check system status.
          </p>
        </div>

        {/* Get Help Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-blue-500" />
            Get Help
          </h2>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/knowledge-base"
              className="group bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">📚 Help Center</h3>
              <p className="text-gray-500 text-sm">
                Browse our comprehensive knowledge base and guides
              </p>
            </Link>

            <a
              href="#video-tutorials"
              className="group bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">🎥 Video Tutorials</h3>
              <p className="text-gray-500 text-sm">
                Watch step-by-step video guides and walkthroughs
              </p>
            </a>

            <a
              href="#schedule-call"
              className="group bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">📞 Schedule a Call</h3>
              <p className="text-gray-500 text-sm">
                Book time with your success manager for personalized help
              </p>
            </a>
          </div>

          {/* Contact Support Form */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              <h3 className="text-2xl font-bold text-gray-900">💬 Contact Support</h3>
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

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-white font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </section>

        {/* Support Tickets Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            Your Support Tickets
          </h2>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ticket #</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Last Update</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {supportTickets.map((ticket, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-blue-600 font-mono text-sm font-medium">{ticket.id}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{ticket.subject}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 ${ticket.statusColor} rounded-full text-xs font-semibold`}>
                          {ticket.status === 'open' ? 'Open' : 'Closed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{ticket.created}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{ticket.lastUpdate}</td>
                      <td className="px-6 py-4">
                        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium transition-all">
                          View Thread
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Feature Requests Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            Feature Requests
          </h2>

          {/* Submit Feature Request Form */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Submit New Feature Idea</h3>
            <form onSubmit={handleFeatureRequestSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Feature Title</label>
                <input
                  type="text"
                  value={featureRequest.title}
                  onChange={(e) => setFeatureRequest({ ...featureRequest, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief title for your feature request"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                  value={featureRequest.description}
                  onChange={(e) => setFeatureRequest({ ...featureRequest, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Describe the feature and why it would be valuable..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Category</label>
                <select
                  value={featureRequest.category}
                  onChange={(e) => setFeatureRequest({ ...featureRequest, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="feature">New Feature</option>
                  <option value="enhancement">Enhancement</option>
                  <option value="integration">Integration</option>
                  <option value="ui">UI/UX Improvement</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                Submit Feature Request
              </button>
            </form>
          </div>

          {/* Existing Feature Requests */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Vote on Existing Requests</h3>
            {featureRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        request.userVoted
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-500'
                      }`}
                    >
                      <TrendingUp className="w-5 h-5" />
                    </button>
                    <span className="text-gray-900 font-bold text-sm">{request.votes}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{request.title}</h4>
                      <span className={`px-3 py-1 ${request.statusColor} rounded-full text-xs font-semibold whitespace-nowrap`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">{request.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Status Page Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-500" />
            System Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Status */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <h3 className="text-xl font-bold text-gray-900">Current Status</h3>
              </div>

              <div className="space-y-4">
                {recentIncidents.map((incident, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      incident.status === 'operational' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {incident.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 font-semibold mb-1">{incident.title}</h4>
                      <p className="text-gray-500 text-sm mb-2">{incident.description}</p>
                      <span className="text-gray-400 text-xs">{incident.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="#"
                className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 font-medium transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View Full Status Page
              </a>
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

              <form className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                  <input
                    type="email"
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

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-white font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                  Subscribe to Updates
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Can't find what you're looking for?
          </h3>
          <p className="text-gray-500 mb-6">
            Our support team is available 24/7 to help you with any questions or issues.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl text-white font-bold transition-all shadow-lg shadow-blue-500/20">
            Chat with Support Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default SupportHelp;
