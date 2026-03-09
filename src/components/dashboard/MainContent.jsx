'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProjectSelection from './ProjectSelection';

export default function MainContent() {
  const { user } = useAuth();

  return (
    <main className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="p-6 pb-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome {user?.fullName?.split(' ')[0]}
          </h2>
          <p className="text-gray-600">
            Ready to accelerate your business growth? Choose a project below to get started.
          </p>
        </div>

        {/* Project Selection */}
        <ProjectSelection />
      </div>
    </main>
  );
}
