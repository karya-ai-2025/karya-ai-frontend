'use client';
import { Wrench, Link as LinkIcon } from 'lucide-react';
import ExpertPageWrapper from '@/components/expert/ExpertPageWrapper';

const INTEGRATIONS = [
  { name: 'Google Calendar',   desc: 'Sync your schedule and manage meetings', category: 'Productivity' },
  { name: 'Slack',             desc: 'Get notified and communicate with clients', category: 'Communication' },
  { name: 'Notion',            desc: 'Manage project notes and deliverables', category: 'Productivity' },
  { name: 'HubSpot',           desc: 'Sync your CRM contacts and deals', category: 'CRM' },
  { name: 'LinkedIn',          desc: 'Import your profile and connections', category: 'Networking' },
  { name: 'Clay',              desc: 'Enrich leads and run outreach sequences', category: 'Outreach' },
];

export default function ExpertToolsPage() {
  return (
    <ExpertPageWrapper activeNav="tools">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tools & Integrations</h1>
        <p className="text-gray-500 text-sm mb-8">Connect your favourite tools to streamline your workflow</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map(tool => (
            <div key={tool.name} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 flex flex-col gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{tool.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{tool.desc}</p>
              </div>
              <button
                disabled
                className="w-full py-2 border border-gray-200 rounded-xl text-sm text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <LinkIcon className="w-3.5 h-3.5" /> Connect — Coming Soon
              </button>
            </div>
          ))}
        </div>
      </div>
    </ExpertPageWrapper>
  );
}
