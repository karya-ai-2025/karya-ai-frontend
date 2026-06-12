'use client';

import React from 'react';
import DashboardHome from './DashboardHome';

export default function MainContent() {
  return (
    <main className="flex-1 overflow-auto bg-gradient-to-b from-[#f6f7f9] to-[#eef0f4]">
      <DashboardHome />
    </main>
  );
}
