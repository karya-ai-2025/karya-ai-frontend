'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Database,
  Edit3,
  Eye,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserPlus,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const scrollbarStyles = `
  .crm-list-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .crm-list-scroll::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }

  .crm-list-scroll::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 4px;
  }

  .crm-list-scroll::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;

const emptyLead = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  industry: '',
  country: ''
};

const emptyForm = {
  crmObjectName: '',
  exportFormat: 'email_only',
  source: 'manual',
  searchCriteria: {
    industry: '',
    company: '',
    companySegment: '',
    location: ''
  },
  leads: [{ ...emptyLead }]
};

const getListId = (crmList) => crmList?.id || crmList?._id;

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  return new Date(dateValue).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getLeadName = (lead) => (
  lead.fullName ||
  `${lead.firstName || ''} ${lead.lastName || ''}`.trim() ||
  'Unnamed Lead'
);

export default function CRMListManager({ onBack, onCollapseSidebar }) {
  const { getAuthHeader } = useAuth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const [activeView, setActiveView] = useState('list');
  const [crmLists, setCrmLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedList, setSelectedList] = useState(null);
  const [previewList, setPreviewList] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (onCollapseSidebar) {
      onCollapseSidebar();
    }
  }, [onCollapseSidebar]);

  const fetchCrmLists = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/user-crm`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCrmLists(data.data || []);
      } else {
        setFormErrors({ submit: data.message || 'Failed to load CRM lists' });
      }
    } catch (error) {
      console.error('Error fetching CRM lists:', error);
      setFormErrors({ submit: 'Failed to load CRM lists. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, getAuthHeader]);

  useEffect(() => {
    fetchCrmLists();
  }, [fetchCrmLists]);

  const resetForm = () => {
    setFormData({
      ...emptyForm,
      searchCriteria: { ...emptyForm.searchCriteria },
      leads: [{ ...emptyLead }]
    });
    setSelectedList(null);
    setFormErrors({});
  };

  const mapLeadToForm = (lead) => ({
    firstName: lead.firstName || lead.rawData?.First_Name || '',
    lastName: lead.lastName || lead.rawData?.Last_Name || '',
    email: lead.email || '',
    phone: lead.phone || lead.mobile || '',
    company: lead.company || lead.rawData?.Account_Name || '',
    jobTitle: lead.jobTitle || lead.title || lead.rawData?.title || '',
    industry: lead.industry || lead.rawData?.GTM_Industry || '',
    country: lead.country || lead.rawData?.Mailing_Country || ''
  });

  const hydrateFormFromList = (crmList, duplicate = false) => {
    setSelectedList(duplicate ? null : crmList);
    setFormData({
      crmObjectName: duplicate ? `${crmList.crmObjectName} (Copy)` : crmList.crmObjectName,
      exportFormat: crmList.exportFormat || 'email_only',
      source: duplicate ? 'manual' : crmList.source || 'manual',
      searchCriteria: {
        industry: crmList.searchCriteria?.industry || '',
        company: crmList.searchCriteria?.company || '',
        companySegment: crmList.searchCriteria?.companySegment || '',
        location: crmList.searchCriteria?.location || ''
      },
      leads: (crmList.leads || []).length > 0
        ? crmList.leads.map(mapLeadToForm)
        : [{ ...emptyLead }]
    });
    setFormErrors({});
    setActiveView('form');
  };

  const filteredLists = crmLists.filter((crmList) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query ||
      crmList.crmObjectName?.toLowerCase().includes(query) ||
      crmList.searchCriteria?.industry?.toLowerCase().includes(query) ||
      crmList.searchCriteria?.company?.toLowerCase().includes(query);
    const matchesSource = sourceFilter === 'all' || crmList.source === sourceFilter;

    return matchesSearch && matchesSource;
  });

  const updateLead = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      leads: prev.leads.map((lead, leadIndex) => (
        leadIndex === index ? { ...lead, [field]: value } : lead
      ))
    }));
  };

  const addLead = () => {
    setFormData((prev) => ({
      ...prev,
      leads: [...prev.leads, { ...emptyLead }]
    }));
  };

  const removeLead = (index) => {
    setFormData((prev) => ({
      ...prev,
      leads: prev.leads.length === 1
        ? [{ ...emptyLead }]
        : prev.leads.filter((_, leadIndex) => leadIndex !== index)
    }));
  };

  const validateForm = () => {
    const errors = {};
    const trimmedLeads = formData.leads
      .map((lead) => ({
        ...lead,
        firstName: lead.firstName.trim(),
        lastName: lead.lastName.trim(),
        email: lead.email.trim(),
        phone: lead.phone.trim(),
        company: lead.company.trim(),
        jobTitle: lead.jobTitle.trim(),
        industry: lead.industry.trim(),
        country: lead.country.trim()
      }))
      .filter((lead) => Object.values(lead).some(Boolean));

    if (!formData.crmObjectName.trim()) {
      errors.crmObjectName = 'CRM list name is required';
    }

    if (trimmedLeads.length === 0) {
      errors.leads = 'Add at least one lead';
    }

    const invalidEmailLead = trimmedLeads.find((lead) => lead.email && !lead.email.includes('@'));
    if (invalidEmailLead) {
      errors.leads = 'Every entered email address must be valid';
    }

    setFormErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      leads: trimmedLeads
    };
  };

  const buildPayload = (leads) => ({
    crmObjectName: formData.crmObjectName.trim(),
    exportFormat: formData.exportFormat,
    source: formData.source || 'manual',
    searchCriteria: {
      industry: formData.searchCriteria.industry.trim(),
      company: formData.searchCriteria.company.trim(),
      companySegment: formData.searchCriteria.companySegment.trim(),
      location: formData.searchCriteria.location.trim()
    },
    leads: leads.map((lead) => ({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email.toLowerCase(),
      phone: lead.phone,
      company: lead.company,
      title: lead.jobTitle,
      industry: lead.industry,
      country: lead.country,
      fullName: `${lead.firstName} ${lead.lastName}`.trim()
    })),
    metadata: {
      requestedCount: leads.length,
      matchedCount: leads.length,
      exportedBy: 'hotlead-inbox-crm-manager'
    }
  });

  const handleSave = async () => {
    const { isValid, leads } = validateForm();
    if (!isValid) return;

    try {
      setSaving(true);
      const selectedId = getListId(selectedList);
      const response = await fetch(
        selectedId ? `${apiBaseUrl}/user-crm/${selectedId}` : `${apiBaseUrl}/user-crm`,
        {
          method: selectedId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          credentials: 'include',
          body: JSON.stringify(buildPayload(leads))
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchCrmLists();
        resetForm();
        setActiveView('list');
      } else {
        setFormErrors({ submit: data.message || 'Failed to save CRM list' });
      }
    } catch (error) {
      console.error('Error saving CRM list:', error);
      setFormErrors({ submit: 'Failed to save CRM list. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (crmList) => {
    if (!confirm(`Are you sure you want to delete "${crmList.crmObjectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/user-crm/${getListId(crmList)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (previewList && getListId(previewList) === getListId(crmList)) {
          setPreviewList(null);
        }
        fetchCrmLists();
      } else {
        alert(`Failed to delete CRM list: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting CRM list:', error);
      alert('Failed to delete CRM list. Please try again.');
    }
  };

  const renderListView = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CRM Lists</h2>
          <p className="text-gray-600 mt-1">Create and manage saved lead lists from the userCRM collection</p>
        </div>

        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setActiveView('form');
            }}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New CRM List</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search CRM lists..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={sourceFilter}
          onChange={(event) => setSourceFilter(event.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Sources</option>
          <option value="manual">Manual</option>
          <option value="export">Export</option>
        </select>

        <button
          onClick={fetchCrmLists}
          className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          title="Refresh CRM lists"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {formErrors.submit && (
        <div className="flex items-center space-x-2 text-red-600 p-4 bg-red-50 rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">{formErrors.submit}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading CRM lists...</span>
        </div>
      ) : filteredLists.length === 0 ? (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {crmLists.length === 0 ? 'No CRM lists yet' : 'No CRM lists match your search'}
          </h3>
          <p className="text-gray-600 mb-6">
            {crmLists.length === 0
              ? 'Create a CRM list or save leads from lead generation to use them in campaigns.'
              : 'Try adjusting your search or source filter.'
            }
          </p>
          <button
            onClick={() => {
              resetForm();
              setActiveView('form');
            }}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create CRM List
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLists.map((crmList) => (
            <div
              key={getListId(crmList)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">{crmList.crmObjectName}</h3>
                  <p className="text-sm text-gray-600">
                    {crmList.emailLeadCount || 0} email ready of {crmList.totalLeads || 0} leads
                  </p>
                </div>

                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => setPreviewList(crmList)}
                    className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                    title="View leads"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => hydrateFormFromList(crmList)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => hydrateFormFromList(crmList, true)}
                    className="p-1 text-gray-400 hover:text-green-600 rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(crmList)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div>
                  Format: <span className="font-medium text-gray-900">
                    {crmList.exportFormat === 'email_phone' ? 'Email + Phone' : 'Email Only'}
                  </span>
                </div>
                <div>
                  Source: <span className="font-medium text-gray-900 capitalize">{crmList.source || 'manual'}</span>
                </div>
                <div>
                  Created: <span className="font-medium text-gray-900">{formatDate(crmList.createdAt)}</span>
                </div>
                <div>
                  Updated: <span className="font-medium text-gray-900">{formatDate(crmList.updatedAt)}</span>
                </div>
              </div>

              {(crmList.searchCriteria?.industry || crmList.searchCriteria?.company || crmList.searchCriteria?.location) && (
                <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
                  {[crmList.searchCriteria.industry, crmList.searchCriteria.company, crmList.searchCriteria.location]
                    .filter(Boolean)
                    .join(' / ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFormView = () => (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              resetForm();
              setActiveView('list');
            }}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="Back to CRM lists"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedList ? 'Edit CRM List' : 'Create CRM List'}
            </h2>
            <p className="text-gray-600">
              {selectedList ? 'Update this saved lead list' : 'Create a saved lead list for campaign audiences'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              resetForm();
              setActiveView('list');
            }}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{selectedList ? 'Update' : 'Save'} CRM List</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">List Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CRM List Name *
              </label>
              <input
                type="text"
                value={formData.crmObjectName}
                onChange={(event) => setFormData({ ...formData, crmObjectName: event.target.value })}
                placeholder="e.g., Q2 SaaS Prospects"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  formErrors.crmObjectName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.crmObjectName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.crmObjectName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={formData.exportFormat}
                onChange={(event) => setFormData({ ...formData, exportFormat: event.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="email_only">Email Only</option>
                <option value="email_phone">Email + Phone</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <input
                type="text"
                value={formData.searchCriteria.industry}
                onChange={(event) => setFormData({
                  ...formData,
                  searchCriteria: { ...formData.searchCriteria, industry: event.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={formData.searchCriteria.company}
                onChange={(event) => setFormData({
                  ...formData,
                  searchCriteria: { ...formData.searchCriteria, company: event.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Segment</label>
              <input
                type="text"
                value={formData.searchCriteria.companySegment}
                onChange={(event) => setFormData({
                  ...formData,
                  searchCriteria: { ...formData.searchCriteria, companySegment: event.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={formData.searchCriteria.location}
                onChange={(event) => setFormData({
                  ...formData,
                  searchCriteria: { ...formData.searchCriteria, location: event.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Leads</h3>
              <p className="text-sm text-gray-600">{formData.leads.length} row{formData.leads.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={addLead}
              className="inline-flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          </div>

          <div
            className="overflow-auto max-h-[34rem] crm-list-scroll"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}
          >
            <table className="min-w-[980px] w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.leads.map((lead, index) => (
                  <tr key={index} className="bg-white">
                    {[
                      ['firstName', 'First name'],
                      ['lastName', 'Last name'],
                      ['email', 'email@example.com'],
                      ['phone', 'Phone'],
                      ['company', 'Company'],
                      ['jobTitle', 'Job title'],
                      ['industry', 'Industry'],
                      ['country', 'Country']
                    ].map(([field, placeholder]) => (
                      <td key={field} className="px-3 py-3 min-w-32">
                        <input
                          type={field === 'email' ? 'email' : 'text'}
                          value={lead[field]}
                          onChange={(event) => updateLead(index, field, event.target.value)}
                          placeholder={placeholder}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-3">
                      <button
                        onClick={() => removeLead(index)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {formErrors.leads && (
            <div className="flex items-center space-x-2 text-red-600 px-6 py-3 border-t border-red-100 bg-red-50">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{formErrors.leads}</span>
            </div>
          )}
        </div>

        {formErrors.submit && (
          <div className="flex items-center space-x-2 text-red-600 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{formErrors.submit}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="h-full overflow-y-auto pb-8 crm-list-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}>
        {activeView === 'list' && renderListView()}
        {activeView === 'form' && renderFormView()}

        {previewList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[88vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{previewList.crmObjectName}</h3>
                  <p className="text-sm text-gray-600">
                    {previewList.emailLeadCount || 0} email ready of {previewList.totalLeads || 0} leads
                  </p>
                </div>
                <button
                  onClick={() => setPreviewList(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                className="overflow-auto crm-list-scroll"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}
              >
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(previewList.leads || []).map((lead, index) => (
                      <tr key={lead.leadId || `${lead.email}-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{getLeadName(lead)}</div>
                          <div className="text-sm text-gray-500">{lead.title || lead.jobTitle || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{lead.email || 'No email'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.phone || lead.mobile || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.company || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.industry || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.country || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    hydrateFormFromList(previewList);
                    setPreviewList(null);
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit List</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
