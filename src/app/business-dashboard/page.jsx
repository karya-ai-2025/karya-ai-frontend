'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import MainContent from '@/components/dashboard/MainContent';

export default function BusinessDashboard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('home'); // Set Home as default active

  // Auth guard
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?role=owner');
    }
  }, [loading, isAuthenticated, router]);

  // bfcache guard
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted && !localStorage.getItem('token')) {
        window.location.replace('/login?role=owner');
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated (useEffect will handle redirect)
  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Main Content */}
        <MainContent />
      </div>
    </div>
  );
}