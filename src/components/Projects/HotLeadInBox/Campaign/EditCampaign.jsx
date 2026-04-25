'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Mail,
  Edit3,
  Settings,
  ArrowLeft,
  Check,
  Plus,
  Eye,
  X,
  AlertTriangle,
  Database,
  Save,
  RefreshCw,
  Trash2,
  Upload,
  UserPlus,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import EmailTemplateBuilder from './EmailTemplateBuilder';

const scrollbarStyles = `
  .edit-campaign-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .edit-campaign-scroll::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }
  .edit-campaign-scroll::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 4px;
  }
  .edit-campaign-scroll::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;

export default function EditCampaign({ campaign, onCampaignUpdated, onCancel, onCollapseSidebar }) {
  const { getAuthHeader } = useAuth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const [activeSection, setActiveSection] = useState('info');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    selectedLeads: [],
    emailTemplateId: null,
    emailTemplate: null,
    settings: {
      sendingRate: 100,
      followUpEnabled: false,
      followUpDelayHours: 72,
      timeZone: 'UTC',
      sendingHours: { start: 9, end: 17 }
    }
  });

  const [emailTemplates, setEmailTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState(null);

  const [crmObjects, setCrmObjects] = useState([]);
  const [crmObjectsLoading, setCrmObjectsLoading] = useState(false);
  const [selectedCrmObject, setSelectedCrmObject] = useState(null);
  const [showLeadSourcePicker, setShowLeadSourcePicker] = useState(false);

  // Manual lead add state
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [newLead, setNewLead] = useState({ firstName: '', email: '', lastName: '', company: '', jobTitle: '', industry: '' });
  const [leadErrors, setLeadErrors] = useState({});

  useEffect(() => {
    if (onCollapseSidebar) onCollapseSidebar();
  }, [onCollapseSidebar]);

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaign]);

  const fetchCampaignDetails = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${apiBaseUrl}/campaigns/${campaign._id || campaign.id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        const c = data.data;
        const template = c.emailTemplateId;
        setCampaignData({
          name: c.name || '',
          description: c.description || '',
          selectedLeads: c.selectedLeads || [],
          emailTemplateId: typeof template === 'object' ? template._id : template,
          emailTemplate: typeof template === 'object' ? template : null,
          settings: {
            sendingRate: c.settings?.sendingRate || 100,
            followUpEnabled: c.settings?.followUpEnabled || false,
            followUpDelayHours: c.settings?.followUpDelayHours || 72,
            timeZone: c.settings?.timeZone || 'UTC',
            sendingHours: c.settings?.sendingHours || { start: 9, end: 17 }
          }
        });
      } else {
        setErrors({ fetch: data.message || 'Failed to load campaign details' });
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      setErrors({ fetch: 'Failed to load campaign details' });
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const response = await fetch(`${apiBaseUrl}/email-templates`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) setEmailTemplates(data.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const fetchUserCrmObjects = async () => {
    try {
      setCrmObjectsLoading(true);
      const response = await fetch(`${apiBaseUrl}/user-crm`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setCrmObjects(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching CRM objects:', error);
    } finally {
      setCrmObjectsLoading(false);
    }
  };

  const formatCrmLead = (lead, index) => {
    const firstName = lead.firstName || lead.rawData?.First_Name || '';
    const lastName = lead.lastName || lead.rawData?.Last_Name || '';
    return {
      id: lead.leadId || lead.id || `crm-lead-${index}`,
      leadId: lead.leadId || lead.id || `crm-lead-${index}`,
      email: lead.email || '',
      firstName: firstName || 'N/A',
      lastName,
      fullName: lead.fullName || `${firstName} ${lastName}`.trim(),
      company: lead.company || lead.rawData?.Account_Name || 'N/A',
      phone: lead.phone || lead.mobile || lead.rawData?.phone || lead.rawData?.mobile || '',
      industry: lead.industry || lead.rawData?.GTM_Industry || 'N/A',
      jobTitle: lead.title || lead.jobTitle || lead.rawData?.title || 'N/A'
    };
  };

  const handleCrmObjectSelect = (crmObject) => {
    const formattedLeads = (crmObject.leads || []).map(formatCrmLead);
    setSelectedCrmObject(crmObject);
    setCampaignData((prev) => ({ ...prev, selectedLeads: formattedLeads }));
    setShowLeadSourcePicker(false);
  };

  const handleRemoveLead = (leadIndex) => {
    setCampaignData((prev) => ({
      ...prev,
      selectedLeads: prev.selectedLeads.filter((_, i) => i !== leadIndex)
    }));
  };

  const handleAddLead = () => {
    const errs = {};
    if (!newLead.firstName.trim()) errs.firstName = 'First name is required';
    if (!newLead.email.trim()) errs.email = 'Email is required';
    else if (!newLead.email.includes('@')) errs.email = 'Enter a valid email';
    if (campaignData.selectedLeads.some((l) => l.email?.toLowerCase() === newLead.email.trim().toLowerCase())) {
      errs.email = 'This email is already in the leads list';
    }
    setLeadErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const lead = {
      id: `manual-${Date.now()}`,
      leadId: `manual-${Date.now()}`,
      firstName: newLead.firstName.trim(),
      lastName: newLead.lastName.trim(),
      email: newLead.email.trim().toLowerCase(),
      company: newLead.company.trim(),
      jobTitle: newLead.jobTitle.trim(),
      industry: newLead.industry.trim(),
      fullName: `${newLead.firstName.trim()} ${newLead.lastName.trim()}`.trim(),
      phoneNumber: ''
    };

    setCampaignData((prev) => ({
      ...prev,
      selectedLeads: [...prev.selectedLeads, lead]
    }));
    setNewLead({ firstName: '', email: '', lastName: '', company: '', jobTitle: '', industry: '' });
    setLeadErrors({});
  };

  const selectTemplate = (template) => {
    setCampaignData((prev) => ({
      ...prev,
      emailTemplateId: template._id,
      emailTemplate: template
    }));
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!campaignData.name.trim()) newErrors.name = 'Campaign name is required';
    const validLeads = campaignData.selectedLeads.filter((l) => l.email && l.email.includes('@'));
    if (validLeads.length === 0) newErrors.leads = 'At least one lead with a valid email is required';
    if (!campaignData.emailTemplateId) newErrors.template = 'An email template is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/campaigns/${campaign._id || campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        credentials: 'include',
        body: JSON.stringify({
          name: campaignData.name,
          description: campaignData.description,
          emailTemplateId: campaignData.emailTemplateId,
          selectedLeads: campaignData.selectedLeads
            .filter((lead) => lead.email && lead.email.includes('@'))
            .map((lead) => ({
              leadId: lead.leadId || lead.id,
              email: lead.email,
              firstName: lead.firstName,
              lastName: lead.lastName,
              company: lead.company,
              industry: lead.industry,
              jobTitle: lead.jobTitle,
              phoneNumber: lead.phone || lead.phoneNumber || ''
            })),
          settings: campaignData.settings
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Campaign updated successfully!');
        setTimeout(() => {
          onCampaignUpdated(data.data);
        }, 800);
      } else {
        setErrors({ submit: data.message || 'Failed to update campaign' });
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      setErrors({ submit: 'Failed to update campaign. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { key: 'info', label: 'Basic Info', icon: Edit3 },
    { key: 'leads', label: 'Leads', icon: Users },
    { key: 'template', label: 'Template', icon: Mail },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading campaign details...</span>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <p className="text-red-600">{errors.fetch}</p>
        <button onClick={onCancel} className="mt-4 text-indigo-600 hover:underline">Go Back</button>
      </div>
    );
  }

  if (showTemplateBuilder) {
    return (
      <EmailTemplateBuilder
        selectedTemplate={selectedTemplateForEdit}
        onBack={() => {
          setShowTemplateBuilder(false);
          setSelectedTemplateForEdit(null);
          fetchEmailTemplates();
        }}
        onCollapseSidebar={onCollapseSidebar}
      />
    );
  }

  const validEmailCount = campaignData.selectedLeads.filter(
    (l) => l.email && l.email.includes('@')
  ).length;

  const renderInfoSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
        <input
          type="text"
          value={campaignData.name}
          onChange={(e) => setCampaignData((prev) => ({ ...prev, name: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={campaignData.description}
          onChange={(e) => setCampaignData((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );

  const renderLeadsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-700">
            {campaignData.selectedLeads.length} leads ({validEmailCount} with email)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setShowAddLeadForm((prev) => !prev);
              setShowLeadSourcePicker(false);
            }}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
          <button
            onClick={() => {
              setShowLeadSourcePicker(true);
              setShowAddLeadForm(false);
              fetchUserCrmObjects();
            }}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Database className="w-4 h-4" />
            <span>Change CRM Object</span>
          </button>
        </div>
      </div>

      {errors.leads && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">{errors.leads}</span>
        </div>
      )}

      {/* Add Lead Form */}
      {showAddLeadForm && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Add a New Lead</h4>
            <button
              onClick={() => { setShowAddLeadForm(false); setLeadErrors({}); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                value={newLead.firstName}
                onChange={(e) => setNewLead((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="John"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  leadErrors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {leadErrors.firstName && <p className="text-xs text-red-500 mt-0.5">{leadErrors.firstName}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead((p) => ({ ...p, email: e.target.value }))}
                placeholder="john@company.com"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  leadErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {leadErrors.email && <p className="text-xs text-red-500 mt-0.5">{leadErrors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={newLead.lastName}
                onChange={(e) => setNewLead((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={newLead.company}
                onChange={(e) => setNewLead((p) => ({ ...p, company: e.target.value }))}
                placeholder="Acme Inc"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={newLead.jobTitle}
                onChange={(e) => setNewLead((p) => ({ ...p, jobTitle: e.target.value }))}
                placeholder="CTO"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
              <input
                type="text"
                value={newLead.industry}
                onChange={(e) => setNewLead((p) => ({ ...p, industry: e.target.value }))}
                placeholder="Technology"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <button
            onClick={handleAddLead}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      )}

      {/* CRM Object Picker */}
      {showLeadSourcePicker && (
        <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Select a CRM Object</h4>
            <button
              onClick={() => setShowLeadSourcePicker(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {crmObjectsLoading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="ml-2 text-sm text-gray-600">Loading...</span>
            </div>
          ) : crmObjects.length === 0 ? (
            <p className="text-sm text-gray-600 py-2">No CRM objects found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto edit-campaign-scroll">
              {crmObjects.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => handleCrmObjectSelect(obj)}
                  className="text-left border border-gray-200 bg-white rounded-lg p-3 hover:border-indigo-400 hover:shadow-sm transition-all"
                >
                  <div className="text-sm font-medium text-gray-900">{obj.crmObjectName}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {obj.emailLeadCount} emails | {obj.totalLeads} total leads
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Leads List */}
      {campaignData.selectedLeads.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Current Leads</span>
          </div>
          <div className="max-h-64 overflow-y-auto edit-campaign-scroll">
            {campaignData.selectedLeads.map((lead, index) => (
              <div
                key={lead.leadId || lead.id || index}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {lead.firstName} {lead.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{lead.email}</div>
                </div>
                <div className="text-xs text-gray-500 mx-3 hidden sm:block">{lead.company || 'N/A'}</div>
                <button
                  onClick={() => handleRemoveLead(index)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  title="Remove lead"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {campaignData.selectedLeads.length === 0 && !showAddLeadForm && (
        <div className="text-center py-8 border border-dashed border-gray-300 rounded-xl bg-gray-50">
          <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h4 className="text-sm font-medium text-gray-900 mb-1">No leads in this campaign</h4>
          <p className="text-xs text-gray-500">Add leads manually or select a CRM object above.</p>
        </div>
      )}
    </div>
  );

  const renderTemplateSection = () => {
    if (emailTemplates.length === 0 && !templatesLoading) {
      fetchEmailTemplates();
    }

    return (
      <div className="space-y-4">
        {campaignData.emailTemplate && (
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-green-900">
                  Current: {campaignData.emailTemplate.templateName}
                </div>
                <div className="text-xs text-green-700 mt-1">
                  Subject: {campaignData.emailTemplate.subject}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setPreviewTemplate(campaignData.emailTemplate);
                    setShowTemplatePreview(true);
                  }}
                  className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Selected</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Change Template</h4>
          <button
            onClick={() => {
              setSelectedTemplateForEdit(null);
              setShowTemplateBuilder(true);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Template</span>
          </button>
        </div>

        {errors.template && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{errors.template}</span>
          </div>
        )}

        {templatesLoading ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
            <span className="ml-2 text-sm text-gray-600">Loading templates...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto edit-campaign-scroll">
            {emailTemplates.map((template) => (
              <div
                key={template._id}
                className={`border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${
                  campaignData.emailTemplateId === template._id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectTemplate(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{template.templateName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{template.category}</p>
                  </div>
                  <div className="flex space-x-1 flex-shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                        setShowTemplatePreview(true);
                      }}
                      className="p-1 text-gray-400 hover:text-indigo-600"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplateForEdit(template);
                        setShowTemplateBuilder(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 truncate">
                  <strong>Subject:</strong> {template.subject}
                </div>
                {campaignData.emailTemplateId === template._id && (
                  <div className="flex items-center mt-2 text-indigo-600">
                    <Check className="w-3.5 h-3.5 mr-1" />
                    <span className="text-xs font-medium">Selected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showTemplatePreview && previewTemplate && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">Preview: {previewTemplate.templateName}</h4>
              <button onClick={() => setShowTemplatePreview(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject:</label>
                <div className="p-2 bg-white rounded border text-sm">{previewTemplate.subject}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Body:</label>
                <div className="p-2 bg-white rounded border text-sm max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {previewTemplate.emailBody}
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    selectTemplate(previewTemplate);
                    setShowTemplatePreview(false);
                  }}
                  className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettingsSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sending Rate (emails per hour)
        </label>
        <input
          type="number"
          value={campaignData.settings.sendingRate}
          onChange={(e) =>
            setCampaignData((prev) => ({
              ...prev,
              settings: { ...prev.settings, sendingRate: Math.min(500, Math.max(1, parseInt(e.target.value) || 1)) }
            }))
          }
          min={1}
          max={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-1">Min: 1, Max: 500 emails per hour</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          value={campaignData.settings.timeZone}
          onChange={(e) =>
            setCampaignData((prev) => ({
              ...prev,
              settings: { ...prev.settings, timeZone: e.target.value }
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Asia/Kolkata">India (IST)</option>
          <option value="Europe/London">London (GMT)</option>
          <option value="Asia/Tokyo">Tokyo (JST)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sending Start Hour</label>
          <input
            type="number"
            value={campaignData.settings.sendingHours.start}
            onChange={(e) =>
              setCampaignData((prev) => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  sendingHours: { ...prev.settings.sendingHours, start: Math.min(23, Math.max(0, parseInt(e.target.value) || 0)) }
                }
              }))
            }
            min={0}
            max={23}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sending End Hour</label>
          <input
            type="number"
            value={campaignData.settings.sendingHours.end}
            onChange={(e) =>
              setCampaignData((prev) => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  sendingHours: { ...prev.settings.sendingHours, end: Math.min(23, Math.max(0, parseInt(e.target.value) || 0)) }
                }
              }))
            }
            min={0}
            max={23}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="followUpEnabled"
          checked={campaignData.settings.followUpEnabled}
          onChange={(e) =>
            setCampaignData((prev) => ({
              ...prev,
              settings: { ...prev.settings, followUpEnabled: e.target.checked }
            }))
          }
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="followUpEnabled" className="text-sm text-gray-700">
          Enable follow-up emails
        </label>
      </div>

      {campaignData.settings.followUpEnabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Follow-up delay (hours)
          </label>
          <input
            type="number"
            value={campaignData.settings.followUpDelayHours}
            onChange={(e) =>
              setCampaignData((prev) => ({
                ...prev,
                settings: { ...prev.settings, followUpDelayHours: Math.min(720, Math.max(1, parseInt(e.target.value) || 1)) }
              }))
            }
            min={1}
            max={720}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Campaign</h2>
              <p className="text-sm text-gray-500">{campaignData.name}</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        {/* Success / Error messages */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2 text-green-800">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}
        {errors.submit && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{errors.submit}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeSection === 'info' && renderInfoSection()}
          {activeSection === 'leads' && renderLeadsSection()}
          {activeSection === 'template' && renderTemplateSection()}
          {activeSection === 'settings' && renderSettingsSection()}
        </div>
      </div>
    </>
  );
}
