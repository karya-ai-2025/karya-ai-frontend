'use client';
import { BarChart3, Award } from 'lucide-react';
import ExpertPageWrapper from '@/components/expert/ExpertPageWrapper';

export default function ExpertEarningsPage() {
  return (
    <ExpertPageWrapper activeNav="earnings">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Earnings</h1>
        <p className="text-gray-500 text-sm mb-8">Your income summary and payout history</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'This Month',       value: '₹0', sub: null },
            { label: 'This Quarter',     value: '₹0', sub: '0% of goal' },
            { label: 'Pending Payouts',  value: '₹0', sub: null },
            { label: 'Lifetime Earnings',value: '₹0', sub: null, icon: Award },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">{s.label}</span>
                {s.icon && <s.icon className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              {s.sub && <p className="text-xs text-gray-400 mt-1">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Earnings Trend</h2>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BarChart3 className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Your earnings chart will appear once you complete your first project</p>
          </div>
        </div>

        {/* Payout history */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Payout History</h2>
          <div className="py-8 text-center text-sm text-gray-400">No payouts yet</div>
        </div>
      </div>
    </ExpertPageWrapper>
  );
}
