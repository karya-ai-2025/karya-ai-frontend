'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, Clock, Star, Tag, Crown } from 'lucide-react';
import { checkUserPlanAccess } from '@/services/planService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProjectSelection() {
  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [planStatus, setPlanStatus] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const router = useRouter();
  const { getAuthHeader } = useAuth();

  // Fetch user plan status
  useEffect(() => {
    const fetchPlanStatus = async () => {
      try {
        setPlanLoading(true);
        const authHeader = getAuthHeader();
        const token = authHeader?.Authorization?.split(' ')[1];

        if (token) {
          const planCheck = await checkUserPlanAccess(token);
          setPlanStatus(planCheck);
        }
      } catch (err) {
        console.error('Error fetching plan status:', err);
      } finally {
        setPlanLoading(false);
      }
    };

    fetchPlanStatus();
  }, [getAuthHeader]);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        if (selectedFilter === 'my-projects') {
          // Fetch user's projects
          const response = await fetch(`${API_BASE_URL}/projects/user/my-projects`, {
            headers: getAuthHeader()
          });

          if (!response.ok) {
            throw new Error('Failed to fetch your projects');
          }

          const result = await response.json();

          if (result.success) {
            setMyProjects(result.data.projects);
          } else {
            throw new Error(result.message || 'Failed to load your projects');
          }
        } else {
          // Fetch all projects
          let apiUrl = `${API_BASE_URL}/projects?limit=12`;

          // Apply filters
          if (selectedFilter === 'featured') {
            apiUrl = `${API_BASE_URL}/projects?featured=true&limit=12`;
          }

          const response = await fetch(apiUrl);

          if (!response.ok) {
            throw new Error('Failed to fetch projects');
          }

          const result = await response.json();

          if (result.success) {
            setProjects(result.data.projects);
          } else {
            throw new Error(result.message || 'Failed to load projects');
          }
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedFilter, getAuthHeader]);

  // Handle project selection
  const handleSelectProject = async (project) => {
    try {
      // First check if user has an active plan
      const authHeader = getAuthHeader();
      const token = authHeader?.Authorization?.split(' ')[1];

      if (!token) {
        alert('Please log in to access projects');
        return;
      }

      const planCheck = await checkUserPlanAccess(token);

      if (!planCheck.success) {
        throw new Error(planCheck.message || 'Failed to check plan access');
      }

      // If user doesn't have an active plan, redirect to pricing
      if (!planCheck.hasActivePlan) {
          router.push('/settings?section=upgrade');
        return;
      }

      // Check if user can create more projects
      if (!planCheck.data.limits.canCreateProject) {
        alert(`You've reached your project limit (${planCheck.data.userPlan.planPackageId.projectsAvailable}). Please upgrade your plan or complete existing projects.`);
        return;
      }

      // If plan check passes, proceed with project selection
      const response = await fetch(`${API_BASE_URL}/projects/${project._id}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });

      const result = await response.json();

      if (result.success) {
        // Navigate to project workspace using project slug
        const projectSlug = result.data.project.slug;
        router.push(`/business-dashboard/project-workspace/${projectSlug}`);
      } else {
        throw new Error(result.message || 'Failed to select project');
      }
    } catch (err) {
      console.error('Error selecting project:', err);
      // You might want to show a toast notification here
      alert(`Error selecting project: ${err.message}`);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'coming-soon':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'deprecated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Project</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Project</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 font-medium">Error loading projects</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-red-600 hover:text-red-500 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Plan Status Widget */}
      {!planLoading && (
        <div className="mb-6">
          {planStatus?.hasActivePlan ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">
                      {planStatus.data.userPlan.planId.displayName} - {planStatus.data.userPlan.planPackageId.name}
                    </h3>
                    <p className="text-sm text-green-700">
                      {planStatus.data.limits.remainingCredits.toLocaleString()} credits • {planStatus.data.limits.remainingProjects} projects remaining
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/settings?section=upgrade')}
                  className="text-green-600 hover:text-green-500 text-sm font-medium"
                >
                  Manage Plan
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h3 className="font-medium text-yellow-900">Free Plan</h3>
                    <p className="text-sm text-yellow-700">
                      Upgrade to access projects and unlock advanced features
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/settings?section=upgrade')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', name: 'All Projects' },
              { id: 'my-projects', name: 'My Projects' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedFilter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Projects Grid */}
      {(() => {
        const currentProjects = selectedFilter === 'my-projects' ? myProjects : projects;
        const emptyMessage = selectedFilter === 'my-projects'
          ? 'You haven\'t started any projects yet'
          : 'No projects available';
        const emptyAction = selectedFilter === 'my-projects'
          ? 'Browse All Projects'
          : 'Refresh';
        const emptyActionHandler = selectedFilter === 'my-projects'
          ? () => setSelectedFilter('all')
          : () => window.location.reload();

        return currentProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">{emptyMessage}</div>
            <button
              onClick={emptyActionHandler}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              {emptyAction}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProjects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200"
            >
              {/* Project Image */}
              {project.thumbnailImage && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={project.thumbnailImage}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Header with badges */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-wrap gap-2">
                    {project.isFeatured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐ Featured
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status === 'coming-soon' ? 'Coming Soon' : project.status}
                    </span>
                  </div>
                </div>

                {/* Project Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {project.name}
                </h3>


                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {project.description?.length > 150
                    ? `${project.description.substring(0, 150)}...`
                    : project.description
                  }
                </p>

                {/* Action Button */}
                <button
                  onClick={() => handleSelectProject(project)}
                  disabled={project.status !== 'active'}
                  className={`w-full px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center font-medium cursor-pointer ${
                    project.status === 'active'
                      ? (planStatus?.hasActivePlan
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700')
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {project.status === 'active'
                    ? (selectedFilter === 'my-projects'
                        ? 'Continue Project'
                        : (planStatus?.hasActivePlan ? 'Get Started' : 'Upgrade to Access'))
                    : project.status === 'coming-soon' ? 'Coming Soon' : 'Unavailable'}
                  {project.status === 'active' && (
                    planStatus?.hasActivePlan
                      ? <ChevronRight size={16} className="ml-2" />
                      : <Crown size={16} className="ml-2" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        );
      })()}

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Need a Custom Solution?
          </h3>
          <p className="text-gray-600 mb-4">
            Can't find the perfect project? We can help you build a custom GTM strategy tailored to your business.
          </p>
          <button className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200">
            Contact Our Experts
          </button>
        </div>
      </div>
    </div>
  );
}
