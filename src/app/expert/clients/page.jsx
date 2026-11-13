'use client';
import { Users } from 'lucide-react';
import ExpertPageWrapper from '@/components/expert/ExpertPageWrapper';

export default function ExpertClientsPage() {
  return (
    <ExpertPageWrapper activeNav="clients">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Clients</h1>
        <p className="text-gray-500 text-sm mb-8">Businesses you have worked with will appear here</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Clients',   value: '0' },
            { label: 'Active',          value: '0' },
            { label: 'Completed',       value: '0' },
            { label: 'Repeat Clients',  value: '0' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-gray-300">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-400 mb-2">No clients yet</p>
          <p className="text-sm text-gray-400">Your client list will grow once you complete your first project</p>
        </div>
      </div>
    </ExpertPageWrapper>
  );
}
