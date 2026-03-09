'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TopNavbar from '@/components/TopNavbar';
import { getProjectComponent, getProjectSidebar, getProjectMetadata, projectExists } from '@/components/Projects';
import {
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProjectWorkspace() {
  const params = useParams();
  const router = useRouter();
  const { user, getAuthHeader } = useAuth();
  const projectSlug = params?.projectId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [projectMetadata, setProjectMetadata] = useState(null);

  // Check project access and load metadata
  useEffect(() => {
    const checkProjectAccess = async () => {
      if (!projectSlug) {
        setError('No project specified');
        setLoading(false);
        return;
      }

      // Check if project exists in our components
      if (!projectExists(projectSlug)) {
        setError('Project not found');
        setLoading(false);
        return;
      }

      try {
        // Get project metadata
        const metadata = getProjectMetadata(projectSlug);
        setProjectMetadata(metadata);

        // Verify user has access to this project via backend
        const response = await fetch(`${API_BASE_URL}/projects/user/my-projects`, {
          headers: getAuthHeader()
        });

        if (response.ok) {
          const result = await response.json();
          const userHasProject = result.data.projects.some(
            project => project.slug === projectSlug
          );

          if (userHasProject) {
            setHasAccess(true);
          } else {
            setError('You do not have access to this project. Please select it from the dashboard first.');
          }
        } else {
          setError('Unable to verify project access');
        }
      } catch (err) {
        console.error('Error checking project access:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    checkProjectAccess();
  }, [projectSlug, getAuthHeader]);

  // Get the dynamic project component and sidebar
  const ProjectComponent = getProjectComponent(projectSlug);
  const ProjectSidebar = getProjectSidebar(projectSlug);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <TopNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !hasAccess) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <TopNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-red-600 mb-4">
              <AlertCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Access Denied'}
            </h3>
            <p className="text-gray-500 mb-4">
              {error || 'You need to select this project from the dashboard first.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/business-dashboard')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative">
      {/* Dynamic Sidebar - Absolutely positioned to cover top-left */}
      <div className="absolute top-0 left-0 h-full z-10">
        {ProjectSidebar ? (
          <ProjectSidebar projectMetadata={projectMetadata} />
        ) : (
          <div className="w-[260px] h-full bg-gradient-to-b from-gray-600 to-gray-800 text-white flex-shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-gray-500/30">
              <button
                onClick={() => router.push('/business-dashboard')}
                className="w-full flex items-center space-x-2 text-gray-200 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="text-sm">Back to Dashboard</span>
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-300">Sidebar not available for this project</p>
            </div>
          </div>
        )}
      </div>

      {/* Top Navigation - Full Width (sidebar will visually override left portion) */}
      <TopNavbar />

      {/* Main Layout - Below Navbar with left margin for sidebar */}
      <div className="flex flex-1 ml-[260px]">
        {/* Dynamic Project Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 py-2">
            {ProjectComponent ? (
              <ProjectComponent />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Project component not found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
