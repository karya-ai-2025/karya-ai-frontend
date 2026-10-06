'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { fetchMyProjects } from '@/lib/catalogApi';
import { FolderKanban, ArrowRight, Clock, Package, ChevronRight } from 'lucide-react';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

export default function MyProjectsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('my-projects');
  const [projects, setProjects]   = useState([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    // Try backend first; fall back to localStorage if backend is unavailable
    fetchMyProjects()
      .then(data => setProjects(data))
      .catch(() => {
        try {
          const stored = JSON.parse(localStorage.getItem('myProjects') || '[]');
          setProjects(stored.slice().reverse());
        } catch {
          setProjects([]);
        }
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <FolderKanban className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">My Projects</h1>
            </div>
            <p className="text-sm text-gray-500">Projects you have purchased and are actively running.</p>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">No projects yet</h2>
              <p className="text-sm text-gray-500 mb-6">
                Browse the marketplace and purchase a project to get started.
              </p>
              <button
                onClick={() => router.push('/project-marketplace')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Browse Marketplace
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((p, i) => {
                return (
                  <div
                    key={`${p.slug}-${i}`}
                    className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => router.push(`/business-dashboard/my-projects/${p.slug}`)}
                  >
                    {p.priceLabel && (
                      <div className="flex items-center justify-end mb-3">
                        <span className="text-xs font-bold text-gray-700">{p.priceLabel}</span>
                      </div>
                    )}
                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {p.title}
                    </h3>
                    {p.tagline && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">{p.tagline}</p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Started {formatDate(p.purchasedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
