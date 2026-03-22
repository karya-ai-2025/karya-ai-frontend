'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Filter, ChevronDown, ChevronRight, X, Download, Save, List, MoreVertical,
  Eye, CheckSquare, Sparkles, UserMinus, Trash2, Phone, Mail, Linkedin, Twitter,
  Building, Calendar, MapPin, IndianRupee, Users, ArrowLeft, RefreshCw, Grid3X3,
  Copy, ThumbsUp, ThumbsDown, Info, MessageSquare, UserPlus, Link as LinkIcon,
  ClipboardList, Briefcase
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function LeadsSearch() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    keyword: '',
    state: '',
    companyAge: '',
    industry: '',
    companyType: '',
    paidUpCapital: '',
    city: ''
  });
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showActionsDropdown, setShowActionsDropdown] = useState(null);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [showTaskTypeDropdown, setShowTaskTypeDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowActionsDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stateOptions = [
    'Select an option', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Tamil Nadu',
    'Delhi', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala'
  ];

  const industryOptions = [
    'Select an option', 'Technology', 'Healthcare', 'Finance', 'Manufacturing',
    'Retail', 'Education', 'Real Estate', 'Hospitality', 'Wholesale', 'Services'
  ];

  const companyTypeOptions = [
    'Select Company type', 'Private Limited', 'Public Limited', 'LLP',
    'Partnership', 'Proprietorship', 'One Person Company'
  ];

  const capitalOptions = [
    'Choose', 'Under ₹1 Lakh', '₹1-10 Lakhs', '₹10-50 Lakhs',
    '₹50 Lakhs - 1 Cr', '₹1-10 Cr', 'Above ₹10 Cr'
  ];

  const taskTypes = [
    { id: 'email', label: 'Email', description: 'Send personalized emails.', icon: <Mail className="w-4 h-4 text-blue-400" /> },
    { id: 'call', label: 'Call', description: 'Make telephone calls to a given list of contacts.', icon: <Phone className="w-4 h-4 text-green-400" /> },
    { id: 'research', label: 'Contact Research', description: 'Research and gather information about contacts.', icon: <Search className="w-4 h-4 text-orange-400" /> },
    { id: 'linkedin-msg', label: 'LinkedIn Message', description: 'Send LinkedIn messages.', icon: <Linkedin className="w-4 h-4 text-blue-400" /> },
    { id: 'linkedin-connect', label: 'LinkedIn Connect Request', description: 'Send LinkedIn connection requests.', icon: <UserPlus className="w-4 h-4 text-blue-400" /> },
    { id: 'custom', label: 'Custom Task', description: 'Perform custom actions as defined by the user.', icon: <ClipboardList className="w-4 h-4 text-blue-600" /> },
  ];

  // Sample companies data
  const companies = [
    { id: 1, name: 'Meerut Roller Flour Mills Private Limited', industry: 'Wholesale', type: 'Wholesale', corpDate: '1981-03-06', capital: '3,05,00,000', city: 'Uttar Pradesh', state: 'Uttar Pradesh', people: 3 },
    { id: 2, name: 'Digital Accountants Private Limited', industry: 'Professional Services', type: 'Service', corpDate: '2019-10-25', capital: '1,00,000', city: 'Kolkata', state: 'West Bengal', people: 2 },
    { id: 3, name: 'Pipe And Sections Private Limited', industry: 'Retail, Consumer Goods', type: 'Retail, Service', corpDate: '2015-08-20', capital: '10,00,000', city: 'Ghaziabad', state: 'Uttar Pradesh', people: 2 },
    { id: 4, name: 'Sri Srinivasa Gudakesr Eatery Private Limited', industry: 'Wholesale, Tobacco, Food & Beverages', type: 'Wholesale', corpDate: '1998-12-18', capital: '18,71,000', city: 'Sambalpur', state: 'Odisha', people: 2 },
    { id: 5, name: 'Aakash Motels Private Limited', industry: 'Hospitality, Restaurants', type: 'Hospitality', corpDate: '2000-03-16', capital: '37,50,000', city: 'Surat', state: 'Gujarat', people: 5 },
    { id: 6, name: 'TechVista Solutions Pvt Ltd', industry: 'Technology', type: 'Service', corpDate: '2018-06-22', capital: '50,00,000', city: 'Bangalore', state: 'Karnataka', people: 12 },
    { id: 7, name: 'GreenLeaf Organics Private Limited', industry: 'Manufacturing', type: 'Manufacturing', corpDate: '2017-02-14', capital: '25,00,000', city: 'Pune', state: 'Maharashtra', people: 8 },
    { id: 8, name: 'CloudNine IT Services', industry: 'Technology', type: 'Service', corpDate: '2020-01-10', capital: '15,00,000', city: 'Hyderabad', state: 'Telangana', people: 6 },
  ];

  // Sample contacts for selected company
  const contactsData = [
    { id: 1, email: 'sudhi.sinha@ul.com', phone: '414.524.2787', confidence: 98, linkedin: true, twitter: true },
    { id: 2, email: 'sudhisinha@hotmail.com', phone: null, confidence: 96, linkedin: true, twitter: false },
    { id: 3, email: 'sudhi.sinha@gmail.com', phone: null, confidence: 96, linkedin: true, twitter: false },
    { id: 4, email: 'aditisi@amazon.com', phone: '918376904378', confidence: 62, linkedin: true, twitter: true },
    { id: 5, email: 'aditi.s2008@gmail.com', phone: null, confidence: 96, linkedin: false, twitter: false },
    { id: 6, email: 'sinha.adeeb@gmail.com', phone: null, confidence: 96, linkedin: false, twitter: false },
  ];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilter = (field) => {
    setFilters(prev => ({ ...prev, [field]: '' }));
  };

  const clearAllFilters = () => {
    setFilters({
      keyword: '',
      state: '',
      companyAge: '',
      industry: '',
      companyType: '',
      paidUpCapital: '',
      city: ''
    });
  };

  const toggleContactSelection = (id) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleActionClick = (contactId, action) => {
    setShowActionsDropdown(null);

    switch(action) {
      case 'view':
        break;
      case 'task':
        setSelectedContact(contactsData.find(c => c.id === contactId));
        setShowTaskPanel(true);
        break;
      case 'ai-script':
        break;
      case 'download':
        break;
      case 'archive':
        break;
      case 'delete':
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-orange-50"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-100 rounded-full blur-3xl"></div>
      </div>

      {/* Left Sidebar - Filters */}
      <div className="relative w-72 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/leads" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Filters</h2>
            <button onClick={clearAllFilters} className="text-blue-600 text-sm font-medium hover:text-blue-500">
              Clear All
            </button>
          </div>
        </div>

        {/* Filter Fields */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Keyword */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Keyword</label>
              {filters.keyword && (
                <button onClick={() => clearFilter('keyword')} className="text-blue-600 text-xs hover:text-blue-500">Clear</button>
              )}
            </div>
            <input
              type="text"
              placeholder="Enter keyword"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">You can search keyword in company name, industry, company din number or people name</p>
          </div>

          {/* State */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">State</label>
              {filters.state && (
                <button onClick={() => clearFilter('state')} className="text-blue-600 text-xs hover:text-blue-500">Clear</button>
              )}
            </div>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
            >
              {stateOptions.map((opt, i) => (
                <option key={i} value={i === 0 ? '' : opt} className="bg-white text-gray-900">{opt}</option>
              ))}
            </select>
          </div>

          {/* Company Age */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Company Age</label>
              {filters.companyAge && (
                <button onClick={() => clearFilter('companyAge')} className="text-blue-600 text-xs hover:text-blue-500">Clear</button>
              )}
            </div>
            <select
              value={filters.companyAge}
              onChange={(e) => handleFilterChange('companyAge', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
            >
              <option value="" className="bg-white">Choose age</option>
              <option value="0-1" className="bg-white">0-1 years</option>
              <option value="1-3" className="bg-white">1-3 years</option>
              <option value="3-5" className="bg-white">3-5 years</option>
              <option value="5-10" className="bg-white">5-10 years</option>
              <option value="10+" className="bg-white">10+ years</option>
            </select>
          </div>

          {/* Industry */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Industry</label>
              {filters.industry && (
                <button onClick={() => clearFilter('industry')} className="text-blue-600 text-xs hover:text-blue-500">Clear</button>
              )}
            </div>
            <select
              value={filters.industry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
            >
              {industryOptions.map((opt, i) => (
                <option key={i} value={i === 0 ? '' : opt} className="bg-white">{opt}</option>
              ))}
            </select>
          </div>

          {/* Company Type */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Company Type</label>
              {filters.companyType && (
                <button onClick={() => clearFilter('companyType')} className="text-blue-600 text-xs hover:text-blue-500">Clear</button>
              )}
            </div>
            <select
              value={filters.companyType}
              onChange={(e) => handleFilterChange('companyType', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
            >
              {companyTypeOptions.map((opt, i) => (
                <option key={i} value={i === 0 ? '' : opt} className="bg-white">{opt}</option>
              ))}
            </select>
          </div>

          {/* Paid up Capital */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Paid up capital</label>
              {filters.paidUpCapital && (
                <button onClick={() => clearFilter('paidUpCapital')} className="text-blue-600 text-xs hover:text-blue-500">Clear</button>
              )}
            </div>
            <select
              value={filters.paidUpCapital}
              onChange={(e) => handleFilterChange('paidUpCapital', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
            >
              {capitalOptions.map((opt, i) => (
                <option key={i} value={i === 0 ? '' : opt} className="bg-white">{opt}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">City</label>
              {filters.city && (
                <button onClick={() => clearFilter('city')} className="text-blue-600 text-xs hover:text-blue-500">Clear</button>
              )}
            </div>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
            >
              <option value="" className="bg-white">Choose</option>
              <option value="Mumbai" className="bg-white">Mumbai</option>
              <option value="Delhi" className="bg-white">Delhi</option>
              <option value="Bangalore" className="bg-white">Bangalore</option>
              <option value="Chennai" className="bg-white">Chennai</option>
              <option value="Hyderabad" className="bg-white">Hyderabad</option>
              <option value="Pune" className="bg-white">Pune</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
            <Search className="w-5 h-5" />
            Search
          </button>
          <button onClick={clearAllFilters} className="w-full mt-2 py-2 text-gray-400 text-sm hover:text-gray-900 transition-colors">
            Clear All
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">EasyProspect</span>
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-gray-400">Search Results</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium border border-emerald-500/30">
                Credits left: 847
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                Book Demo
              </button>
              <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all">
                Watch Demo
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                AS
              </div>
            </div>
          </div>
        </header>

        {/* Results Section */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Result</h1>
              <p className="text-gray-400 mt-1">
                <span className="text-blue-600 font-semibold">1,764,142</span> companies found
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-100 text-blue-500 rounded-lg font-medium hover:bg-blue-200 transition-all border border-blue-300">
              My List
            </button>
          </div>

          {/* Results Table */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" className="rounded border-white/30 bg-transparent" />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Company Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Industry</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Company Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Corp Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">PaidUp Capital</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">City</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">State</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Total People</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {companies.map((company, index) => (
                    <tr key={company.id} className="hover:bg-gray-100 transition-colors">
                      <td className="px-4 py-4">
                        <input type="checkbox" className="rounded border-white/30 bg-transparent" />
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">{company.name}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400">{company.industry}</td>
                      <td className="px-4 py-4 text-sm text-gray-400">{company.type}</td>
                      <td className="px-4 py-4 text-sm text-gray-400">{company.corpDate}</td>
                      <td className="px-4 py-4 text-sm text-gray-400">₹{company.capital}</td>
                      <td className="px-4 py-4 text-sm text-gray-400">{company.city}</td>
                      <td className="px-4 py-4 text-sm text-gray-400">{company.state}</td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                          {company.people}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Demo CTA Overlay */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-t border-purple-500/20 p-6 text-center">
              <p className="text-gray-300 mb-3">
                Easyprospect is available in custom annual plan, want a free trial? Please schedule a call with our team.
              </p>
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/25">
                Click here to schedule demo
              </button>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-400">Page 1 of 176,415</p>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 hover:bg-white/5 disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 hover:bg-white/5">
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Contacts Section */}
          <div className="mt-8">
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-white/5">
                <h3 className="font-bold text-gray-900">Contact Details - Sample Company</h3>
              </div>

              <table className="w-full">
                <thead className="bg-white/5 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Emails</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Phones</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {contactsData.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-100 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">{contact.email}</span>
                          {contact.email.includes('+') && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">+2</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {contact.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-300">{contact.phone}</span>
                            <span className="px-2 py-0.5 bg-white/10 text-gray-400 text-xs rounded">+1</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {contact.linkedin && (
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                              <Linkedin className="w-4 h-4 text-white" />
                            </div>
                          )}
                          {contact.twitter && (
                            <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">
                              <Twitter className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            contact.confidence >= 90
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : contact.confidence >= 70
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {contact.confidence}%
                          </span>
                          <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Info">
                            <Info className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Copy">
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Thumbs Up">
                            <ThumbsUp className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Thumbs Down">
                            <ThumbsDown className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 relative" ref={showActionsDropdown === contact.id ? dropdownRef : null}>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <RefreshCw className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <List className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => setShowActionsDropdown(showActionsDropdown === contact.id ? null : contact.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>

                        {/* Actions Dropdown Menu */}
                        {showActionsDropdown === contact.id && (
                          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-slideDown">
                            <div className="py-2">
                              <button
                                onClick={() => handleActionClick(contact.id, 'view')}
                                className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center gap-3 transition-all"
                              >
                                <Eye className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-300">View Full Profile</span>
                              </button>
                              <button
                                onClick={() => handleActionClick(contact.id, 'task')}
                                className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center gap-3 transition-all"
                              >
                                <CheckSquare className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-300">Create Task</span>
                              </button>
                              <button
                                onClick={() => handleActionClick(contact.id, 'ai-script')}
                                className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center gap-3 transition-all"
                              >
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                <span className="text-gray-300">Create AI Script</span>
                              </button>
                              <button
                                onClick={() => handleActionClick(contact.id, 'download')}
                                className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center gap-3 transition-all"
                              >
                                <Download className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-300">Download contact</span>
                              </button>
                              <button
                                onClick={() => handleActionClick(contact.id, 'archive')}
                                className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center gap-3 transition-all"
                              >
                                <UserMinus className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-300">Archive contact</span>
                              </button>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                onClick={() => handleActionClick(contact.id, 'delete')}
                                className="w-full px-4 py-3 text-left hover:bg-red-500/20 flex items-center gap-3 transition-all"
                              >
                                <Trash2 className="w-5 h-5 text-red-400" />
                                <span className="text-red-400">Delete contact</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Save Contacts Button */}
              <div className="p-4 border-t border-gray-200 text-center">
                <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/25">
                  Save contacts in bulk
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Panel */}
      {showTaskPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowTaskPanel(false)}
          ></div>

          {/* Panel */}
          <div className="relative w-[480px] bg-white h-full shadow-2xl overflow-y-auto animate-slideIn border-l border-gray-200">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-gray-500">/</span>
                <h2 className="font-bold text-gray-900">Create Task</h2>
              </div>
              <button
                onClick={() => setShowTaskPanel(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Task Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Task Type</label>
                <div className="relative">
                  <button
                    onClick={() => setShowTaskTypeDropdown(!showTaskTypeDropdown)}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-200 rounded-xl flex items-center justify-between hover:border-purple-500/50 transition-all text-gray-400"
                  >
                    <span>Select Type</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showTaskTypeDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showTaskTypeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                      {taskTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setShowTaskTypeDropdown(false)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-all text-left"
                        >
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            {type.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{type.label}</p>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Related Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Related Contact</label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search for contacts"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Task Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Task Name</label>
                <input
                  type="text"
                  placeholder="Enter task name"
                  defaultValue={selectedContact ? `Follow up with ${selectedContact.email.split('@')[0]}` : ''}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  rows={4}
                  placeholder="Add description"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                ></textarea>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                <div className="flex gap-3">
                  <input
                    type="date"
                    defaultValue="2025-10-21"
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <button className="px-4 py-3 bg-white/5 border border-gray-200 rounded-xl hover:bg-white/10 flex items-center gap-2 text-gray-400 transition-colors">
                    <span>Select Time</span>
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assigned To</label>
                <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900">
                  <option className="bg-white">Ashish Sinha</option>
                  <option className="bg-white">Team Member 1</option>
                  <option className="bg-white">Team Member 2</option>
                </select>
              </div>

              {/* Task Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Task Priority</label>
                <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900">
                  <option className="bg-white">None</option>
                  <option className="bg-white">Low</option>
                  <option className="bg-white">Medium</option>
                  <option className="bg-white">High</option>
                  <option className="bg-white">Urgent</option>
                </select>
              </div>

              {/* Template */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Template</label>
                <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900">
                  <option className="bg-white">Add Template</option>
                  <option className="bg-white">Follow Up Email</option>
                  <option className="bg-white">Cold Outreach</option>
                  <option className="bg-white">Meeting Request</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900">
                  <option className="bg-white">Add tags</option>
                  <option className="bg-white">Sales</option>
                  <option className="bg-white">Marketing</option>
                  <option className="bg-white">Support</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setShowTaskPanel(false)}
                className="px-6 py-3 text-gray-500 hover:text-gray-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-white hover:bg-gray-100 transition-all">
                  Save & New
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default LeadsSearch;