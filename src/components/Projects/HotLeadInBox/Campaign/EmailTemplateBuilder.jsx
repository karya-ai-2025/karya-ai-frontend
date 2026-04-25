'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Copy,
  Save,
  Search,
  Filter,
  Tag,
  RefreshCw,
  X,
  ArrowLeft,
  Code,
  Type,
  AlertTriangle
} from 'lucide-react';

// Enhanced scrollbar styles for the email template builder
const scrollbarStyles = `
  .template-builder-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .template-builder-scroll::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }

  .template-builder-scroll::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 4px;
  }

  .template-builder-scroll::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }

  .template-builder-scroll::-webkit-scrollbar-corner {
    background: #f3f4f6;
  }
`;

export default function EmailTemplateBuilder({ onBack, onCollapseSidebar }) {
  const [activeView, setActiveView] = useState('list'); // 'list', 'create', 'edit'
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Template form data
  const [formData, setFormData] = useState({
    templateName: '',
    description: '',
    subject: '',
    emailBody: '',
    category: 'general',
    templateType: 'campaign',
    tags: []
  });

  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Auto-collapse sidebar for better space
  useEffect(() => {
    if (onCollapseSidebar) {
      onCollapseSidebar();
    }
  }, [onCollapseSidebar]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/email-templates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(data.data || []);
      } else {
        console.error('Failed to fetch templates:', data.message);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Form handlers
  const resetForm = () => {
    setFormData({
      templateName: '',
      description: '',
      subject: '',
      emailBody: '',
      category: 'general',
      templateType: 'campaign',
      tags: []
    });
    setFormErrors({});
    setSelectedTemplate(null);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.templateName.trim()) {
      errors.templateName = 'Template name is required';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formData.emailBody.trim()) {
      errors.emailBody = 'Email body is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const url = selectedTemplate
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/email-templates/${selectedTemplate._id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/email-templates`;

      const method = selectedTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        await fetchTemplates();

        // If onBack is provided (e.g., from campaign creation), call it immediately to return to campaign flow
        if (onBack) {
          onBack();
        } else {
          // Only set to list view if not in campaign creation context
          setActiveView('list');
        }

        resetForm();
      } else {
        setFormErrors({ submit: data.message || 'Failed to save template' });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setFormErrors({ submit: 'Failed to save template. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setFormData({
      templateName: template.templateName,
      description: template.description || '',
      subject: template.subject,
      emailBody: template.emailBody,
      category: template.category,
      templateType: template.templateType,
      tags: template.tags || []
    });
    setActiveView('create');
  };

  const handleDelete = async (templateId, templateName) => {
    if (!confirm(`Are you sure you want to delete "${templateName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/email-templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchTemplates();
      } else {
        alert(`Failed to delete template: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleDuplicate = async (template) => {
    setFormData({
      templateName: `${template.templateName} (Copy)`,
      description: template.description || '',
      subject: template.subject,
      emailBody: template.emailBody,
      category: template.category,
      templateType: template.templateType,
      tags: template.tags || []
    });
    setSelectedTemplate(null);
    setActiveView('create');
  };

  const handlePreview = async (template) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/email-templates/${template._id}/preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadData: {
            firstName: 'John',
            lastName: 'Smith',
            company: 'Microsoft',
            jobTitle: 'Software Engineer',
            industry: 'Technology'
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setPreviewData(data.data);
        setShowPreview(true);
      } else {
        alert('Failed to generate preview');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Failed to generate preview. Please try again.');
    }
  };

  // Insert variable into email body
  const insertVariable = (variable) => {
    const textarea = document.getElementById('emailBody');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.emailBody;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);

      setFormData({
        ...formData,
        emailBody: before + variable + after
      });

      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
        textarea.focus();
      }, 0);
    }
  };

  // Available variables
  const availableVariables = [
    { variable: '{firstName}', description: 'Lead\'s first name' },
    { variable: '{lastName}', description: 'Lead\'s last name' },
    { variable: '{fullName}', description: 'Lead\'s full name' },
    { variable: '{company}', description: 'Lead\'s company' },
    { variable: '{jobTitle}', description: 'Lead\'s job title' },
    { variable: '{industry}', description: 'Lead\'s industry' },
    { variable: '{email}', description: 'Lead\'s email address' },
  ];

  // Render template list view
  const renderTemplateList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-gray-600 mt-1">Create and manage reusable email templates for your campaigns</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setActiveView('create');
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          <option value="sales">Sales</option>
          <option value="marketing">Marketing</option>
          <option value="support">Support</option>
          <option value="onboarding">Onboarding</option>
          <option value="follow-up">Follow-up</option>
          <option value="general">General</option>
        </select>

        <button
          onClick={fetchTemplates}
          className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading templates...</span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {templates.length === 0 ? 'No templates yet' : 'No templates match your search'}
          </h3>
          <p className="text-gray-600 mb-6">
            {templates.length === 0
              ? 'Create your first email template to get started with campaigns.'
              : 'Try adjusting your search criteria or create a new template.'
            }
          </p>
          <button
            onClick={() => {
              resetForm();
              setActiveView('create');
            }}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template._id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{template.templateName}</h3>
                  <p className="text-sm text-gray-600">{template.category}</p>
                </div>

                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => handlePreview(template)}
                    className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleEdit(template)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-1 text-gray-400 hover:text-green-600 rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(template._id, template.templateName)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Subject:</p>
                <p className="text-sm text-gray-600 line-clamp-2">{template.subject}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Used {template.usageStats?.timesUsed || 0} times</span>
                <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
              </div>

              {template.tags && template.tags.length > 0 && (
                <div className="flex items-center mt-2">
                  <Tag className="w-3 h-3 text-gray-400 mr-1" />
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 2 && (
                      <span className="text-xs text-gray-500">+{template.tags.length - 2} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render template form view
  const renderTemplateForm = () => (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setActiveView('list');
              resetForm();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedTemplate ? 'Edit Template' : 'Create Template'}
            </h2>
            <p className="text-gray-600">
              {selectedTemplate ? 'Update your email template' : 'Create a new email template for your campaigns'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setActiveView('list');
              resetForm();
            }}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{selectedTemplate ? 'Update' : 'Save'} Template</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.templateName}
                  onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                  placeholder="e.g., Demo Invitation"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.templateName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.templateName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.templateName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="general">General</option>
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                  <option value="support">Support</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this template..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Email Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Content</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Demo invitation for {company}"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  formErrors.subject ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.subject && (
                <p className="mt-1 text-sm text-red-600">{formErrors.subject}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body *
              </label>
              <textarea
                id="emailBody"
                value={formData.emailBody}
                onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                placeholder="Hi {firstName},&#10;&#10;I hope this email finds you well..."
                rows={12}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm ${
                  formErrors.emailBody ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.emailBody && (
                <p className="mt-1 text-sm text-red-600">{formErrors.emailBody}</p>
              )}
            </div>
          </div>

          {formErrors.submit && (
            <div className="flex items-center space-x-2 text-red-600 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{formErrors.submit}</span>
            </div>
          )}
        </div>

        {/* Variables Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Variables</h3>
            <p className="text-sm text-gray-600 mb-4">
              Click to insert personalization variables into your email.
            </p>

            <div className="space-y-2">
              {availableVariables.map((variable) => (
                <button
                  key={variable.variable}
                  onClick={() => insertVariable(variable.variable)}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 rounded border border-gray-200 hover:border-indigo-300 transition-colors"
                >
                  <div className="font-mono text-indigo-600 mb-1">
                    {variable.variable}
                  </div>
                  <div className="text-xs text-gray-500">
                    {variable.description}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-start space-x-2">
                <Type className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Tip:</strong> Use variables to personalize your emails. They'll be automatically replaced with actual lead data when sending.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
    <div className="h-full overflow-y-auto pb-8 template-builder-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}>
      {activeView === 'list' && renderTemplateList()}
      {activeView === 'create' && renderTemplateForm()}

      {/* Preview Inline */}
      {showPreview && previewData && (
        <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900">
              Email Preview
            </h4>
            <button
              onClick={() => setShowPreview(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
              <div className="p-3 bg-white rounded border text-sm">
                {previewData.preview.subject}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Body:</label>
              <div className="p-3 bg-white rounded border text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
                {previewData.preview.body}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}