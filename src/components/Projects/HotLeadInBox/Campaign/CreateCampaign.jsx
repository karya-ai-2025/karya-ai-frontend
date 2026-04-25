'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Mail,
  Edit3,
  Settings,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Eye,
  X,
  AlertTriangle,
  Database,
  Upload,
  Trash2,
  UserPlus,
  Save,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import EmailTemplateBuilder from './EmailTemplateBuilder';

const scrollbarStyles = `
  .campaign-form-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .campaign-form-scroll::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }

  .campaign-form-scroll::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 4px;
  }

  .campaign-form-scroll::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;

export default function CreateCampaign({ onCampaignCreated, onCancel, onCollapseSidebar }) {
  const { getAuthHeader } = useAuth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { number: 1, title: 'Basic Info', icon: Edit3 },
    { number: 2, title: 'Select Leads', icon: Users },
    { number: 3, title: 'Email Template', icon: Mail },
    { number: 4, title: 'Settings & Review', icon: Settings }
  ];

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
    },
    scheduledAt: null
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [availableLeads, setAvailableLeads] = useState([]);
  const [crmObjects, setCrmObjects] = useState([]);
  const [crmObjectsLoading, setCrmObjectsLoading] = useState(false);
  const [selectedLeadSource, setSelectedLeadSource] = useState(null);
  const [selectedCrmObject, setSelectedCrmObject] = useState(null);

  const [emailTemplates, setEmailTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState(null);

  // Upload leads state
  const [uploadStep, setUploadStep] = useState('name'); // 'name' | 'entry'
  const [uploadCrmName, setUploadCrmName] = useState('');
  const [manualLeads, setManualLeads] = useState([]);
  const [newLead, setNewLead] = useState({ firstName: '', email: '', lastName: '', company: '', jobTitle: '', industry: '' });
  const [leadErrors, setLeadErrors] = useState({});
  const [savingCrm, setSavingCrm] = useState(false);

  useEffect(() => {
    if (onCollapseSidebar) {
      onCollapseSidebar();
    }
  }, [onCollapseSidebar]);

  useEffect(() => {
    if (currentStep === 3 && emailTemplates.length === 0) {
      fetchEmailTemplates();
    }
  }, [currentStep]);

  const validateCurrentStep = () => {
    const newErrors = {};

    if (currentStep === 1 && !campaignData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (currentStep === 2) {
      const validLeads = campaignData.selectedLeads.filter(
        (lead) => lead.email && lead.email.includes('@')
      );
      if (validLeads.length === 0) {
        newErrors.leads = 'Select a CRM object with at least one valid email address.';
      }
    }

    if (currentStep === 3 && !campaignData.emailTemplateId && !showTemplateBuilder) {
      newErrors.template = 'Email template is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
      setErrors({});
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    setErrors({});
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

  const fetchUserCrmObjects = async () => {
    try {
      setCrmObjectsLoading(true);
      setErrors((prev) => ({ ...prev, leads: undefined }));

      const response = await fetch(`${apiBaseUrl}/user-crm`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCrmObjects(data.data || []);
      } else {
        setCrmObjects([]);
        setErrors((prev) => ({
          ...prev,
          leads: data.message || 'Failed to load your CRM objects.'
        }));
      }
    } catch (error) {
      console.error('Error fetching CRM objects:', error);
      setCrmObjects([]);
      setErrors((prev) => ({
        ...prev,
        leads: 'Failed to load your CRM objects. Please try again.'
      }));
    } finally {
      setCrmObjectsLoading(false);
    }
  };

  const handleLeadSourceSelection = async (source) => {
    setErrors((prev) => ({ ...prev, leads: undefined }));

    if (source === 'upload') {
      setSelectedLeadSource('upload');
      setUploadStep('name');
      setUploadCrmName('');
      setManualLeads([]);
      setNewLead({ firstName: '', email: '', lastName: '', company: '', jobTitle: '', industry: '' });
      return;
    }

    if (source === 'karya-ai-crm') {
      setSelectedLeadSource('karya-ai-crm');
      await fetchUserCrmObjects();
    }
  };

  const handleAddLead = () => {
    const errs = {};
    if (!newLead.firstName.trim()) errs.firstName = 'First name is required';
    if (!newLead.email.trim()) errs.email = 'Email is required';
    else if (!newLead.email.includes('@')) errs.email = 'Enter a valid email';
    if (manualLeads.some((l) => l.email.toLowerCase() === newLead.email.trim().toLowerCase())) {
      errs.email = 'This email is already added';
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
      fullName: `${newLead.firstName.trim()} ${newLead.lastName.trim()}`.trim()
    };

    setManualLeads((prev) => [...prev, lead]);
    setNewLead({ firstName: '', email: '', lastName: '', company: '', jobTitle: '', industry: '' });
    setLeadErrors({});
  };

  const handleRemoveManualLead = (index) => {
    setManualLeads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveManualLeadsToCrm = async () => {
    if (manualLeads.length === 0) {
      setErrors((prev) => ({ ...prev, leads: 'Add at least one lead before saving' }));
      return;
    }
    if (!uploadCrmName.trim()) {
      setErrors((prev) => ({ ...prev, leads: 'CRM name is required' }));
      return;
    }

    try {
      setSavingCrm(true);
      setErrors((prev) => ({ ...prev, leads: undefined }));

      const response = await fetch(`${apiBaseUrl}/user-crm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        credentials: 'include',
        body: JSON.stringify({
          crmObjectName: uploadCrmName.trim(),
          exportFormat: 'email_only',
          source: 'manual',
          leads: manualLeads.map((l) => ({
            firstName: l.firstName,
            lastName: l.lastName,
            email: l.email,
            company: l.company,
            title: l.jobTitle,
            industry: l.industry
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        const formattedLeads = manualLeads.map(formatCrmLead);
        setSelectedCrmObject({
          id: data.data.id,
          crmObjectName: data.data.crmObjectName,
          totalLeads: data.data.totalLeads,
          emailLeadCount: manualLeads.filter((l) => l.email.includes('@')).length
        });
        setAvailableLeads(formattedLeads);
        setCampaignData((prev) => ({ ...prev, selectedLeads: formattedLeads }));
      } else {
        setErrors((prev) => ({ ...prev, leads: data.message || 'Failed to save leads' }));
      }
    } catch (error) {
      console.error('Error saving leads to CRM:', error);
      setErrors((prev) => ({ ...prev, leads: 'Failed to save leads. Please try again.' }));
    } finally {
      setSavingCrm(false);
    }
  };

  const handleCrmObjectSelect = (crmObject) => {
    const formattedLeads = (crmObject.leads || []).map(formatCrmLead);

    setSelectedCrmObject(crmObject);
    setAvailableLeads(formattedLeads);
    setCampaignData((prev) => ({
      ...prev,
      selectedLeads: formattedLeads
    }));
    setErrors((prev) => ({ ...prev, leads: undefined }));
  };

  const handleResetLeadSource = () => {
    setSelectedLeadSource(null);
    setSelectedCrmObject(null);
    setAvailableLeads([]);
    setCampaignData((prev) => ({
      ...prev,
      selectedLeads: []
    }));
    setUploadStep('name');
    setUploadCrmName('');
    setManualLeads([]);
    setNewLead({ firstName: '', email: '', lastName: '', company: '', jobTitle: '', industry: '' });
    setLeadErrors({});
    setErrors((prev) => ({ ...prev, leads: undefined }));
  };

  const fetchEmailTemplates = async () => {
    try {
      setTemplatesLoading(true);

      const response = await fetch(`${apiBaseUrl}/email-templates`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setEmailTemplates(data.data || []);
      } else {
        console.error('Failed to fetch templates:', data.message);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const selectTemplate = (template) => {
    setCampaignData((prev) => ({
      ...prev,
      emailTemplateId: template._id,
      emailTemplate: template
    }));
  };

  const editTemplate = (template) => {
    setSelectedTemplateForEdit(template);
    setShowTemplateBuilder(true);
  };

  const previewEmailTemplate = (template) => {
    setPreviewTemplate(template);
    setShowTemplatePreview(true);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);

      const response = await fetch(`${apiBaseUrl}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
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
              phoneNumber: lead.phone || ''
            })),
          settings: campaignData.settings
        })
      });

      const data = await response.json();

      if (data.success) {
        onCampaignCreated(data.data);
      } else {
        setErrors({ submit: data.message || 'Failed to create campaign' });
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setErrors({ submit: 'Failed to create campaign. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              value={campaignData.name}
              onChange={(e) => setCampaignData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Q1 Demo Outreach"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={campaignData.description}
              onChange={(e) => setCampaignData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this campaign..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const validEmailCount = campaignData.selectedLeads.filter(
      (lead) => lead.email && lead.email.includes('@')
    ).length;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Leads</h3>

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              {campaignData.selectedLeads.length} leads ready for this campaign
            </div>
            {selectedLeadSource && (
              <button
                onClick={handleResetLeadSource}
                className="text-sm text-indigo-600 hover:text-indigo-700 underline"
              >
                Change Lead Source
              </button>
            )}
          </div>

          {!selectedLeadSource && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <button
                onClick={() => handleLeadSourceSelection('upload')}
                className="flex items-center justify-center space-x-3 px-5 py-5 bg-white border border-gray-300 hover:border-gray-400 rounded-xl transition-colors"
              >
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Upload Your Leads</span>
              </button>

              <button
                onClick={() => handleLeadSourceSelection('karya-ai-crm')}
                className="flex items-center justify-center space-x-3 px-5 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
              >
                <Database className="w-5 h-5" />
                <span className="font-medium">Karya AI CRM</span>
              </button>
            </div>
          )}

          {selectedLeadSource === 'upload' && !selectedCrmObject && (
            <div className="space-y-5">
              {/* Step 1: CRM Name */}
              {uploadStep === 'name' && (
                <div className="border border-gray-200 rounded-xl p-5 bg-white">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Name Your Lead List</h4>
                  <p className="text-sm text-gray-500 mb-4">This will be saved to your CRM for future use.</p>
                  <input
                    type="text"
                    value={uploadCrmName}
                    onChange={(e) => setUploadCrmName(e.target.value)}
                    placeholder="e.g., Demo Outreach Q1, Test Leads"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        if (!uploadCrmName.trim()) {
                          setErrors((prev) => ({ ...prev, leads: 'Please enter a name for your lead list' }));
                          return;
                        }
                        setErrors((prev) => ({ ...prev, leads: undefined }));
                        setUploadStep('entry');
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="font-medium">Add Leads One by One</span>
                    </button>
                    <button
                      disabled
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed border border-gray-200"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="font-medium">Bulk Upload (Coming Soon)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Lead Entry */}
              {uploadStep === 'entry' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">Add Leads to "{uploadCrmName}"</h4>
                      <p className="text-sm text-gray-500">{manualLeads.length} lead{manualLeads.length !== 1 ? 's' : ''} added</p>
                    </div>
                    <button
                      onClick={() => setUploadStep('name')}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Back
                    </button>
                  </div>

                  {/* Lead Entry Form */}
                  <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          value={newLead.firstName}
                          onChange={(e) => setNewLead((p) => ({ ...p, firstName: e.target.value }))}
                          placeholder="John"
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                        <input
                          type="text"
                          value={newLead.company}
                          onChange={(e) => setNewLead((p) => ({ ...p, company: e.target.value }))}
                          placeholder="Acme Inc"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
                        <input
                          type="text"
                          value={newLead.industry}
                          onChange={(e) => setNewLead((p) => ({ ...p, industry: e.target.value }))}
                          placeholder="Technology"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddLead}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Lead</span>
                    </button>
                  </div>

                  {/* Added Leads List */}
                  {manualLeads.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{manualLeads.length} Lead{manualLeads.length !== 1 ? 's' : ''} Added</span>
                      </div>
                      <div
                        className="max-h-48 overflow-y-auto campaign-form-scroll"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}
                      >
                        {manualLeads.map((lead, index) => (
                          <div key={lead.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{lead.firstName} {lead.lastName}</div>
                              <div className="text-xs text-gray-500 truncate">{lead.email}{lead.company ? ` · ${lead.company}` : ''}</div>
                            </div>
                            <button
                              onClick={() => handleRemoveManualLead(index)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save to CRM button */}
                  {manualLeads.length > 0 && (
                    <button
                      onClick={handleSaveManualLeadsToCrm}
                      disabled={savingCrm}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl transition-colors font-medium"
                    >
                      {savingCrm ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving to CRM...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save {manualLeads.length} Lead{manualLeads.length !== 1 ? 's' : ''} to CRM & Continue</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedLeadSource === 'karya-ai-crm' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Choose a CRM Object</h4>
                  <p className="text-sm text-gray-600">Select one saved CRM object to use as your campaign audience.</p>
                </div>
                <button
                  onClick={fetchUserCrmObjects}
                  disabled={crmObjectsLoading}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {crmObjectsLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {crmObjectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-gray-600">Loading CRM objects...</span>
                </div>
              ) : crmObjects.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No CRM objects found</h4>
                  <p className="text-sm text-gray-600">
                    Save an exported lead list to CRM first, then use it here for campaigns.
                  </p>
                </div>
              ) : (
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-1 campaign-form-scroll"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}
                >
                  {crmObjects.map((crmObject) => {
                    const isSelected = selectedCrmObject?.id === crmObject.id;

                    return (
                      <button
                        key={crmObject.id}
                        onClick={() => handleCrmObjectSelect(crmObject)}
                        className={`text-left border rounded-xl p-4 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-base font-semibold text-gray-900">{crmObject.crmObjectName}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {crmObject.emailLeadCount} email{crmObject.emailLeadCount !== 1 ? 's' : ''} ready
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>Total Leads: <span className="font-medium text-gray-900">{crmObject.totalLeads}</span></div>
                          <div>Format: <span className="font-medium text-gray-900">{crmObject.exportFormat === 'email_phone' ? 'Email + Phone' : 'Email Only'}</span></div>
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                          Saved {crmObject.createdAt ? new Date(crmObject.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedCrmObject && availableLeads.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-green-900">{selectedCrmObject.crmObjectName}</div>
                    <div className="text-sm text-green-800 mt-1">
                      {campaignData.selectedLeads.length} total leads loaded, {validEmailCount} with valid email addresses.
                    </div>
                  </div>
                  <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    Campaign Source Ready
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-700">
                    Preview of selected CRM leads
                  </div>
                </div>
                <div
                  className="max-h-56 overflow-y-auto campaign-form-scroll"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}
                >
                  {availableLeads.slice(0, 4).map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center p-4 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {lead.fullName || `${lead.firstName} ${lead.lastName}`.trim() || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">{lead.jobTitle} at {lead.company}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-900">{lead.email || 'No email'}</div>
                            <div className="text-xs text-gray-500">{lead.industry}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {availableLeads.length > 4 && (
                  <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-200">
                    Showing 4 of {availableLeads.length} leads from this CRM object.
                  </div>
                )}
              </div>
            </div>
          )}

          {errors.leads && (
            <div className="flex items-center space-x-2 text-red-600 mt-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{errors.leads}</span>
            </div>
          )}
        </div>
      </div>
    );
  };
  const renderStep3 = () => {
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

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Email Template</h3>

          {templatesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading templates...</span>
            </div>
          ) : emailTemplates.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No templates available</h4>
              <p className="text-gray-600 mb-4">Create your first email template to get started.</p>
              <button
                onClick={() => setShowTemplateBuilder(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setSelectedTemplateForEdit(null);
                    setShowTemplateBuilder(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emailTemplates.map((template) => (
                  <div
                    key={template._id}
                    className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
                      campaignData.emailTemplateId === template._id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{template.templateName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.category}</p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            previewEmailTemplate(template);
                          }}
                          className="p-1 text-gray-400 hover:text-indigo-600"
                          title="Preview template"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editTemplate(template);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit template"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 mb-2">
                      <strong>Subject:</strong> {template.subject}
                    </div>

                    <div className="text-xs text-gray-500">
                      Used {template.usageStats?.timesUsed || 0} times
                    </div>

                    {campaignData.emailTemplateId === template._id && (
                      <div className="flex items-center mt-2 text-indigo-600">
                        <Check className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.template && (
            <div className="flex items-center space-x-2 text-red-600 mt-4">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{errors.template}</span>
            </div>
          )}

          {showTemplatePreview && previewTemplate && (
            <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-900">
                  Preview: {previewTemplate.templateName}
                </h4>
                <button
                  onClick={() => setShowTemplatePreview(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
                  <div className="p-3 bg-white rounded border text-sm">
                    {previewTemplate.subject}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Body:</label>
                  <div className="p-3 bg-white rounded border text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {previewTemplate.emailBody}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Category: {previewTemplate.category} | Used {previewTemplate.usageStats?.timesUsed || 0} times
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setShowTemplatePreview(false)}
                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => {
                      selectTemplate(previewTemplate);
                      setShowTemplatePreview(false);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                  >
                    Select This Template
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    const validLeadsCount = campaignData.selectedLeads.filter(
      (lead) => lead.email && lead.email.includes('@')
    ).length;
    const invalidLeadsCount = campaignData.selectedLeads.length - validLeadsCount;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Review</h3>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Campaign Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Campaign Name:</span>
                <div className="font-medium">{campaignData.name}</div>
              </div>
              <div>
                <span className="text-gray-600">Leads with Email:</span>
                <div className="font-medium">{validLeadsCount} leads</div>
                {invalidLeadsCount > 0 && (
                  <div className="text-xs text-amber-600">
                    {invalidLeadsCount} leads excluded (no email)
                  </div>
                )}
              </div>
              <div>
                <span className="text-gray-600">Email Template:</span>
                <div className="font-medium">{campaignData.emailTemplate?.templateName}</div>
              </div>
              <div>
                <span className="text-gray-600">Estimated Credits:</span>
                <div className="font-medium">{validLeadsCount} credits</div>
              </div>
            </div>
          </div>

          {invalidLeadsCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-amber-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Notice</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                {invalidLeadsCount} lead{invalidLeadsCount > 1 ? 's' : ''} without email addresses will be excluded from this campaign.
                Only leads with valid email addresses can receive email campaigns.
              </p>
            </div>
          )}
        </div>

        {errors.submit && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{errors.submit}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : isCompleted
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    Step {step.number}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    {step.title}
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-400 mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 pt-6 pb-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>
      </div>

      {!(currentStep === 3 && showTemplateBuilder) && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-2 py-4 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Create Campaign</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
