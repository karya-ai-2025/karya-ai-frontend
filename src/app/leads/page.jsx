'use client';

import React, { useState } from 'react';
import {
  Search, Users, UserPlus, ChevronRight, Play,
  Chrome, Phone, FileSpreadsheet, Zap, Database, Bot, Receipt,
  Settings, HelpCircle, Sparkles, TrendingUp, Target, Download, Upload,
  BarChart3, PieChart, Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function LeadsDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  const sidebarItems = [
    { id: 'contacts', label: 'My Contacts', icon: <Users className="w-5 h-5" />, count: 156 },
    { id: 'team', label: 'My Team', icon: <UserPlus className="w-5 h-5" /> },
    { id: 'search', label: 'Search Leads', icon: <Search className="w-5 h-5" />, highlight: true },
    { id: 'enrichment', label: 'CSV Enrichment', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: 'api', label: 'API Enrichment', icon: <Zap className="w-5 h-5" /> },
    { id: 'crm', label: 'CRM Enrichment', icon: <Database className="w-5 h-5" /> },
    { id: 'agents', label: 'AI Agents', icon: <Bot className="w-5 h-5" />, badge: 'New' },
    { id: 'prospect', label: 'EasyProspect', icon: <Target className="w-5 h-5" /> },
    { id: 'billing', label: 'Billing & Invoices', icon: <Receipt className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'help', label: 'Help & Support', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  const stats = [
    { label: 'You are on', value: 'Starter Plan', subtext: 'Upgrade' },
    { label: 'Expiring on', value: 'Mar 15, 2026', subtext: 'Renew' },
    { label: 'My Team', value: '3 / 5', subtext: 'Add Member' },
    { label: 'Credits Left', value: '847', subtext: 'Get Free Credits' },
  ];

  const recentSearches = [
    { query: 'SaaS companies in Bangalore', results: 1247, date: '2 hours ago' },
    { query: 'Fintech startups Series A', results: 89, date: 'Yesterday' },
    { query: 'E-commerce Delhi NCR', results: 2341, date: '3 days ago' },
  ];

  const quickActions = [
    { label: 'Search Companies', icon: <Search className="w-6 h-6" />, color: 'from-blue-600 to-orange-500', action: () => router.push('/leads/search') },
    { label: 'Upload CSV', icon: <Upload className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500', action: () => {} },
    { label: 'API Access', icon: <Zap className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500', action: () => {} },
    { label: 'View Reports', icon: <BarChart3 className="w-6 h-6" />, color: 'from-orange-500 to-red-500', action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-orange-50"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-100 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <div className="relative z-10 w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Karya</span>
              <span className="text-lg font-bold text-blue-600">Leads</span>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-blue-300 rounded-xl p-4">
            <p className="text-sm text-gray-400">Welcome back,</p>
            <p className="font-bold text-lg text-gray-900">Ashish Sinha</p>
            <p className="text-xs text-gray-500 mt-1">ashish@company.com</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Credits left</span>
              <span className="font-bold text-xl text-gray-900">847</span>
            </div>
            <button className="w-full mt-3 py-2 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-sm font-medium text-white transition-all shadow-lg shadow-blue-500/25">
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'search') {
                  router.push('/leads/search');
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                item.highlight
                  ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg shadow-blue-500/25'
                  : activeTab === item.id
                    ? 'bg-blue-100 text-blue-500 border border-blue-300'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              {item.count && (
                <span className={`text-xs px-2 py-1 rounded-full ${item.highlight ? 'bg-white/20' : 'bg-white/10'}`}>
                  {item.count}
                </span>
              )}
              {item.badge && (
                <span className="text-xs px-2 py-1 bg-emerald-500 text-white rounded-full">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/leads/search')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-500 rounded-lg hover:bg-blue-200 transition-all border border-blue-300"
              >
                <Search className="w-4 h-4" />
                <span className="font-medium">Search Leads</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all">
                <Phone className="w-4 h-4" />
                <span>Search Phone Numbers</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">100% accuracy guaranteed</p>
                <p className="text-xs text-blue-600">*TnC apply</p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                Request a Demo
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                AS
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Hello Ashish Sinha!</h1>
            <p className="text-gray-400 text-lg">Let's start prospecting.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-blue-300 transition-all">
                <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-500 transition-colors">
                  {stat.subtext}
                </button>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="group bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-blue-300 transition-all hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    {action.icon}
                  </div>
                  <p className="font-semibold text-gray-900">{action.label}</p>
                  <ChevronRight className="w-5 h-5 text-gray-500 mt-2 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                </button>
              ))}
            </div>
          </div>


          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-8">
            {/* Recent Searches */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Searches</h3>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-500">View All</button>
              </div>
              <div className="space-y-3">
                {recentSearches.map((search, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all border border-gray-200 hover:border-blue-300">
                    <div>
                      <p className="font-medium text-gray-900">{search.query}</p>
                      <p className="text-sm text-gray-500">{search.results.toLocaleString()} results • {search.date}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Video Tutorial */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Watch how it works</h3>
              <div className="relative rounded-xl overflow-hidden bg-black/50 aspect-video group cursor-pointer border border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop"
                  alt="Tutorial"
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Analytics */}
          <div className="mt-8 bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Your Usage This Month</h3>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center p-4 bg-purple-500/10 border border-blue-300 rounded-xl">
                <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <p className="text-sm text-gray-400">Leads Searched</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <Download className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">342</p>
                <p className="text-sm text-gray-400">Contacts Exported</p>
              </div>
              <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">89%</p>
                <p className="text-sm text-gray-400">Email Accuracy</p>
              </div>
              <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <PieChart className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">153</p>
                <p className="text-sm text-gray-400">Credits Used</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadsDashboard;