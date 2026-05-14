'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Copy,
  Save,
  Search,
  Tag,
  RefreshCw,
  X,
  ArrowLeft,
  Code,
  Type,
  AlertTriangle,
  Bold,
  Italic,
  Link,
  Image as ImageIcon,
  Heading,
  Minus,
  MousePointerClick,
  Paperclip,
  FileText,
  Loader2
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

const defaultTemplateSettings = {
  contentType: 'html',
  trackOpens: true,
  trackClicks: true,
  enableUnsubscribe: true
};

const getTemplateSettings = (template = {}) => ({
  ...defaultTemplateSettings,
  ...(template.settings || {})
});

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const detectContentType = (body = '') => /<\/?[a-z][\s\S]*>/i.test(body) ? 'html' : 'text';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const MAX_ATTACHMENTS_PER_TEMPLATE = 5;
const MAX_ATTACHMENT_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENT_TOTAL_SIZE = 20 * 1024 * 1024;
const ALLOWED_ATTACHMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.csv'];
const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
  'text/csv'
];

const getFileExtension = (fileName = '') => {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : '';
};

const isAllowedAttachmentFile = (file) => (
  ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.type) ||
  ALLOWED_ATTACHMENT_EXTENSIONS.includes(getFileExtension(file.name))
);

const formatFileSize = (bytes = 0) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

export default function EmailTemplateBuilder({ onBack, onCollapseSidebar }) {
  const attachmentInputRef = useRef(null);
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
    tags: [],
    attachments: [],
    settings: defaultTemplateSettings
  });

  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [attachmentUploading, setAttachmentUploading] = useState(false);

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
      const response = await fetch(`${API_BASE_URL}/email-templates`, {
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
    tags: [],
    attachments: [],
    settings: defaultTemplateSettings
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

    const totalAttachmentSize = (formData.attachments || []).reduce((sum, attachment) => sum + (attachment.size || 0), 0);
    if ((formData.attachments || []).length > MAX_ATTACHMENTS_PER_TEMPLATE) {
      errors.attachments = `You can attach up to ${MAX_ATTACHMENTS_PER_TEMPLATE} files`;
    } else if (totalAttachmentSize > MAX_ATTACHMENT_TOTAL_SIZE) {
      errors.attachments = `Total attachment size cannot exceed ${formatFileSize(MAX_ATTACHMENT_TOTAL_SIZE)}`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const url = selectedTemplate
        ? `${API_BASE_URL}/email-templates/${selectedTemplate._id}`
        : `${API_BASE_URL}/email-templates`;

      const method = selectedTemplate ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        settings: {
          ...defaultTemplateSettings,
          ...(formData.settings || {}),
          contentType: detectContentType(formData.emailBody)
        }
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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
      tags: template.tags || [],
      attachments: template.attachments || [],
      settings: getTemplateSettings(template)
    });
    setActiveView('create');
  };

  const handleDelete = async (templateId, templateName) => {
    if (!confirm(`Are you sure you want to delete "${templateName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/email-templates/${templateId}`, {
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
      tags: template.tags || [],
      attachments: template.attachments || [],
      settings: getTemplateSettings(template)
    });
    setSelectedTemplate(null);
    setActiveView('create');
  };

  const handlePreview = async (template) => {
    try {
      const response = await fetch(`${API_BASE_URL}/email-templates/${template._id}/preview`, {
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
        setPreviewData({
          ...data.data,
          attachments: data.data.attachments || template.attachments || [],
          contentType: template.settings?.contentType || 'html'
        });
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
    insertIntoEmailBody(variable);
  };

  const insertIntoEmailBody = (value) => {
    const textarea = document.getElementById('emailBody');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.emailBody;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);

      setFormData({
        ...formData,
        emailBody: before + value + after
      });

      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + value.length;
        textarea.focus();
      }, 0);
    }
  };

  const wrapEmailBodySelection = (prefix, suffix, fallbackText = '') => {
    const textarea = document.getElementById('emailBody');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.emailBody.substring(start, end);
    const innerText = selectedText || fallbackText;
    const before = formData.emailBody.substring(0, start);
    const after = formData.emailBody.substring(end);
    const wrappedValue = `${prefix}${innerText}${suffix}`;

    setFormData({
      ...formData,
      emailBody: before + wrappedValue + after
    });

    setTimeout(() => {
      if (selectedText) {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + wrappedValue.length;
      } else {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = start + prefix.length + fallbackText.length;
      }
      textarea.focus();
    }, 0);
  };

  const insertHtmlBlock = (blockType) => {
    let snippet = '';

    if (blockType === 'bold') {
      wrapEmailBodySelection('<strong>', '</strong>', 'bold text');
      return;
    }

    if (blockType === 'italic') {
      wrapEmailBodySelection('<em>', '</em>', 'italic text');
      return;
    }

    if (blockType === 'heading') {
      wrapEmailBodySelection(
        '<h2 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#111827;">',
        '</h2>',
        'Section heading'
      );
      return;
    }

    if (blockType === 'divider') {
      snippet = '<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />';
    }

    if (blockType === 'link') {
      const textarea = document.getElementById('emailBody');
      const selectedText = textarea
        ? formData.emailBody.substring(textarea.selectionStart, textarea.selectionEnd)
        : '';
      const linkText = window.prompt('Link text', selectedText || 'View details');
      if (!linkText) return;
      const url = window.prompt('Link URL', 'https://');
      if (!url) return;
      if (selectedText) {
        wrapEmailBodySelection(
          `<a href="${escapeHtml(url)}" style="color:#4f46e5;text-decoration:underline;">`,
          '</a>',
          linkText
        );
        return;
      }
      snippet = `<a href="${escapeHtml(url)}" style="color:#4f46e5;text-decoration:underline;">${escapeHtml(linkText)}</a>`;
    }

    if (blockType === 'button') {
      const textarea = document.getElementById('emailBody');
      const selectedText = textarea
        ? formData.emailBody.substring(textarea.selectionStart, textarea.selectionEnd)
        : '';
      const buttonText = window.prompt('Button text', selectedText || 'Book a demo');
      if (!buttonText) return;
      const url = window.prompt('Button URL', 'https://');
      if (!url) return;
      if (selectedText) {
        wrapEmailBodySelection(
          `<a href="${escapeHtml(url)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:600;">`,
          '</a>',
          buttonText
        );
        return;
      }
      snippet = `<a href="${escapeHtml(url)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:600;">${escapeHtml(buttonText)}</a>`;
    }

    if (blockType === 'image') {
      const imageUrl = window.prompt('Image URL', 'https://');
      if (!imageUrl) return;
      const altText = window.prompt('Image alt text', 'Email image') || 'Email image';
      snippet = `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(altText)}" style="display:block;max-width:100%;height:auto;border:0;border-radius:6px;" />`;
    }

    insertIntoEmailBody(snippet);
  };

  const handleAttachmentButtonClick = () => {
    attachmentInputRef.current?.click();
  };

  const handleAttachmentUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (files.length === 0) return;

    const currentAttachments = formData.attachments || [];
    if (currentAttachments.length + files.length > MAX_ATTACHMENTS_PER_TEMPLATE) {
      setFormErrors((prev) => ({
        ...prev,
        attachments: `You can attach up to ${MAX_ATTACHMENTS_PER_TEMPLATE} files`
      }));
      return;
    }

    const existingTotalSize = currentAttachments.reduce((sum, attachment) => sum + (attachment.size || 0), 0);
    const selectedTotalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (existingTotalSize + selectedTotalSize > MAX_ATTACHMENT_TOTAL_SIZE) {
      setFormErrors((prev) => ({
        ...prev,
        attachments: `Total attachment size cannot exceed ${formatFileSize(MAX_ATTACHMENT_TOTAL_SIZE)}`
      }));
      return;
    }

    const invalidFile = files.find((file) => file.size > MAX_ATTACHMENT_FILE_SIZE || !isAllowedAttachmentFile(file));
    if (invalidFile) {
      setFormErrors((prev) => ({
        ...prev,
        attachments: `${invalidFile.name} is not supported or is larger than ${formatFileSize(MAX_ATTACHMENT_FILE_SIZE)}`
      }));
      return;
    }

    try {
      setAttachmentUploading(true);
      setFormErrors((prev) => ({ ...prev, attachments: undefined }));

      const uploadedAttachments = [];

      for (const file of files) {
        const uploadData = new window.FormData();
        uploadData.append('attachment', file);

        const response = await fetch(`${API_BASE_URL}/email-templates/attachments/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: uploadData
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || `Failed to upload ${file.name}`);
        }

        uploadedAttachments.push(data.data);
      }

      setFormData((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...uploadedAttachments]
      }));
    } catch (error) {
      console.error('Error uploading attachment:', error);
      setFormErrors((prev) => ({
        ...prev,
        attachments: error.message || 'Failed to upload attachment'
      }));
    } finally {
      setAttachmentUploading(false);
    }
  };

  const removeAttachment = (blobName) => {
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((attachment) => attachment.blobName !== blobName)
    }));
    setFormErrors((prev) => ({ ...prev, attachments: undefined }));
  };

  const renderEmailPreviewBody = (body, contentType = 'html') => {
    if (contentType === 'text') {
      return (
        <div className="p-3 bg-white rounded border text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
          {body}
        </div>
      );
    }

    return (
      <iframe
        title="Email body preview"
        sandbox=""
        srcDoc={`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#111827;margin:0;padding:12px;} img{max-width:100%;height:auto;}</style></head><body>${body || ''}</body></html>`}
        className="w-full h-48 bg-white rounded border"
      />
    );
  };

  const buildLivePreview = () => ({
    preview: {
      subject: formData.subject || 'Subject preview',
      body: formData.emailBody || ''
    },
    attachments: formData.attachments || [],
    contentType: detectContentType(formData.emailBody)
  });

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
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{template.category}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {(template.settings?.contentType || 'html').toUpperCase()}
                    </span>
                    {(template.attachments || []).length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded">
                        <Paperclip className="w-3 h-3" />
                        {(template.attachments || []).length}
                      </span>
                    )}
                  </div>
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
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Body *
                </label>

                <div className="flex flex-wrap items-center gap-1">
                  <button type="button" onClick={() => insertHtmlBlock('bold')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded" title="Bold">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => insertHtmlBlock('italic')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded" title="Italic">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => insertHtmlBlock('heading')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded" title="Heading">
                    <Heading className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => insertHtmlBlock('link')} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Link">
                    <Link className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => insertHtmlBlock('button')} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Button link">
                    <MousePointerClick className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => insertHtmlBlock('image')} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Image">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => insertHtmlBlock('divider')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded" title="Divider">
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleAttachmentButtonClick}
                    disabled={attachmentUploading}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-50"
                    title="Attach file"
                  >
                    {attachmentUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_ATTACHMENT_EXTENSIONS.join(',')}
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                </div>
              </div>
              <textarea
                id="emailBody"
                value={formData.emailBody}
                onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                placeholder="Hi {firstName},&#10;&#10;I hope this email finds you well...&#10;&#10;Or use HTML like <p>Hi {firstName},</p>"
                rows={12}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm ${
                  formErrors.emailBody ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.emailBody && (
                <p className="mt-1 text-sm text-red-600">{formErrors.emailBody}</p>
              )}

              <div className="mt-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span>Attachments</span>
                    {(formData.attachments || []).length > 0 && (
                      <span className="text-xs text-gray-500">
                        {(formData.attachments || []).length}/{MAX_ATTACHMENTS_PER_TEMPLATE}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAttachmentButtonClick}
                    disabled={attachmentUploading}
                    className="text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400"
                  >
                    {attachmentUploading ? 'Uploading...' : 'Add file'}
                  </button>
                </div>

                {(formData.attachments || []).length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500">
                    No files attached.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {(formData.attachments || []).map((attachment) => (
                      <div key={attachment.blobName} className="flex items-center justify-between gap-3 px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800 truncate">
                              {attachment.originalName || attachment.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.blobName)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Remove attachment"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formErrors.attachments && (
                <p className="mt-1 text-sm text-red-600">{formErrors.attachments}</p>
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
                  <strong>Tip:</strong> Use variables to personalize your emails. They will be automatically replaced with actual lead data when sending.
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

      {/* Email Preview */}
      {(activeView === 'create' || (showPreview && previewData)) && (
        <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900">
              Email Preview
            </h4>
            {showPreview && previewData && activeView !== 'create' && (
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {(() => {
            const currentPreview = activeView === 'create'
              ? buildLivePreview()
              : previewData;

            return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
              <div className="p-3 bg-white rounded border text-sm">
                {currentPreview.preview.subject}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Body:</label>
              {renderEmailPreviewBody(currentPreview.preview.body, currentPreview.contentType)}
            </div>

            {(currentPreview.attachments || []).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments:</label>
                <div className="bg-white rounded border divide-y divide-gray-100">
                  {(currentPreview.attachments || []).map((attachment) => (
                    <div key={attachment.blobName} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <span className="truncate">{attachment.originalName || attachment.fileName}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatFileSize(attachment.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showPreview && previewData && activeView !== 'create' && (
              <div className="flex items-center justify-end pt-3 border-t border-gray-200">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                >
                  Close Preview
                </button>
              </div>
            )}
          </div>
            );
          })()}
        </div>
      )}
    </div>
    </>
  );
}
