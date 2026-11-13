'use client';
import { Phone, Mail, Users, Send } from 'lucide-react';
import ExpertPageWrapper from '@/components/expert/ExpertPageWrapper';

export default function ExpertCrmPage() {
  return (
    <ExpertPageWrapper activeNav="crm">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">CRM & Outreach</h1>
        <p className="text-gray-500 text-sm mb-8">Manage your contacts and outreach campaigns</p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Contacts',          value: '0',   icon: Users },
            { label: 'Active Sequences',  value: '0',   icon: Send },
            { label: 'Emails This Week',  value: '0',   icon: Mail },
            { label: 'Response Rate',     value: '0%',  icon: Phone },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 text-center">
              <s.icon className="w-6 h-6 text-gray-200 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
          <Phone className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-400 mb-2">No contacts yet</p>
          <p className="text-sm text-gray-400">Import or add contacts to start your outreach campaigns</p>
        </div>
      </div>
    </ExpertPageWrapper>
  );
}
