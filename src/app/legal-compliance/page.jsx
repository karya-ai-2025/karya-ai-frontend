'use client';

import React from 'react';
import { Shield, FileText, Download, CheckCircle, Database, Trash2, Archive, MapPin, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function LegalCompliance() {
  const router = useRouter();

  const documents = [
    {
      title: "Terms of Service",
      description: "Our terms and conditions for using the platform",
      icon: <FileText className="w-6 h-6" />,
      link: "/legal/terms",
      downloadable: true,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Privacy Policy",
      description: "How we collect, use, and protect your data",
      icon: <Shield className="w-6 h-6" />,
      link: "/legal/privacy",
      downloadable: true,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Data Processing Agreement",
      description: "GDPR-compliant data processing terms",
      icon: <Database className="w-6 h-6" />,
      link: "/legal/dpa",
      downloadable: true,
      color: "from-green-500 to-teal-500"
    },
    {
      title: "Acceptable Use Policy",
      description: "Guidelines for appropriate platform usage",
      icon: <CheckCircle className="w-6 h-6" />,
      link: "/legal/aup",
      downloadable: false,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Cookie Policy",
      description: "Information about cookies and tracking",
      icon: <AlertCircle className="w-6 h-6" />,
      link: "/legal/cookies",
      downloadable: false,
      color: "from-blue-500 to-blue-500"
    }
  ];

  const certifications = [
    {
      name: "SOC 2 Type II",
      description: "Security, availability, and confidentiality controls verified",
      reportAvailable: true,
      color: "from-blue-500 to-blue-500"
    },
    {
      name: "GDPR Compliant",
      description: "Full compliance with EU data protection regulations",
      reportAvailable: false,
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "ISO 27001",
      description: "International standard for information security management",
      reportAvailable: false,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const dataLocations = [
    {
      region: "United States",
      location: "US-East (Virginia)",
      icon: <MapPin className="w-5 h-5" />,
      primary: true
    },
    {
      region: "European Union",
      location: "EU-West (Frankfurt)",
      icon: <MapPin className="w-5 h-5" />,
      primary: true
    }
  ];

  const dataProcessingActions = [
    {
      title: "Data Retention Policy",
      description: "We retain your data for as long as your account is active. After deletion, data is retained for 30 days for recovery, then permanently deleted.",
      icon: <Clock className="w-6 h-6" />,
      action: null,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Request Data Deletion",
      description: "Submit a request to permanently delete your personal data from our systems. This action is irreversible.",
      icon: <Trash2 className="w-6 h-6" />,
      action: "Request Deletion",
      color: "from-red-500 to-pink-500"
    },
    {
      title: "Export Your Data",
      description: "Download a complete copy of your data in JSON format for audit or migration purposes.",
      icon: <Archive className="w-6 h-6" />,
      action: "Export Data",
      color: "from-purple-500 to-blue-500"
    }
  ];

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
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">Trust & Transparency</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Legal & Compliance
          </h1>

          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Your data security and privacy are our top priorities. Review our policies and certifications.
          </p>
        </div>

        {/* Documents Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" />
            Legal Documents
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${doc.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="text-white">{doc.icon}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{doc.title}</h3>
                <p className="text-gray-500 text-sm mb-6">{doc.description}</p>

                <div className="flex gap-2">
                  <Link
                    href={doc.link}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium transition-all text-center"
                  >
                    View Online
                  </Link>
                  {doc.downloadable && (
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-white transition-all shadow-md">
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Certifications Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            Compliance Certifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-32 h-32 bg-gradient-to-br ${cert.color} rounded-full flex items-center justify-center mb-6 shadow-2xl`}>
                    <span className="text-white font-bold text-lg">{cert.name.split(' ')[0]}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{cert.name}</h3>
                  <p className="text-gray-500 text-sm mb-6">{cert.description}</p>

                  {cert.reportAvailable && (
                    <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium transition-all flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Processing Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-500" />
            Data Processing & Privacy
          </h2>

          {/* Data Locations */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-500" />
              Data Storage Locations
            </h3>
            <p className="text-gray-500 mb-6">
              Your data is stored in secure, redundant data centers in the following regions:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataLocations.map((location, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                    {location.icon}
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold">{location.region}</h4>
                    <p className="text-gray-500 text-sm">{location.location}</p>
                  </div>
                  {location.primary && (
                    <span className="ml-auto px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full text-emerald-700 text-xs font-semibold">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Data Processing Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataProcessingActions.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <span className="text-white">{item.icon}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm mb-6">{item.description}</p>

                {item.action && (
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-white font-medium transition-all shadow-md">
                    {item.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Questions about our policies?
          </h3>
          <p className="text-gray-500 mb-6">
            Our team is here to help. Contact us for any privacy or compliance inquiries.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl text-white font-bold transition-all shadow-lg shadow-blue-500/20">
            Contact Legal Team
          </button>
        </div>
      </div>
    </div>
  );
}

export default LegalCompliance;
