'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  Target,
  MapPin,
  Mail,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
  Download,
  X
} from 'lucide-react';
import { getIndustries } from '../../../services/industriesApi';
import { useAuth } from '@/contexts/AuthContext';

export default function LeadGeneration({ onCollapseSidebar, onExpandSidebar }) {
  const { user, getAuthHeader } = useAuth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const [searchCriteria, setSearchCriteria] = useState({
    industry: '',
    company: '',
    companySegment: '',
    location: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [leads, setLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]); // Store all leads for client-side pagination
  const [showResults, setShowResults] = useState(false);
  const [searchStats, setSearchStats] = useState({ matched: 0, available: 0 });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20); // Fixed at 20 items per page
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);



  // Recalculate pagination when data changes
  useEffect(() => {
    if (allLeads.length > 0) {
      const newTotalPages = Math.ceil(allLeads.length / itemsPerPage);
      setTotalPages(newTotalPages);

      // Adjust current page if it exceeds new total pages
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }

      // Update displayed leads for current page
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentPageLeads = allLeads.slice(startIndex, endIndex);
      setLeads(currentPageLeads);

      // Clear selections when page changes
      setSelectedLeads(new Set());
      setSelectAll(false);
    }
  }, [allLeads, currentPage]);

  // Credit management state
  const [creditCosts, setCreditCosts] = useState({
    VIEW_EMAIL: { credits: 1 },
    VIEW_PHONE: { credits: 3 },
    DOWNLOAD_LEADS: { credits: 1 }
  });
  const [remainingCredits, setRemainingCredits] = useState(0);
  const [visibleEmails, setVisibleEmails] = useState(new Set());
  const [visiblePhones, setVisiblePhones] = useState(new Set());
  const [creditLoading, setCreditLoading] = useState(false);

  // Selected leads for actions
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Download leads state
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('email_only'); // 'email_only' or 'email_phone'
  const [downloadCount, setDownloadCount] = useState('all'); // 'all' or 'custom'
  const [customCount, setCustomCount] = useState('');
  const [downloadCostBreakdown, setDownloadCostBreakdown] = useState({
    totalToDownload: 0,
    emailOnlyCost: 0,
    emailPhoneCost: 0,
    totalAvailable: 0,
    currentlyShowing: 0
  });
  const [showCrmNameInput, setShowCrmNameInput] = useState(false);
  const [crmObjectName, setCrmObjectName] = useState('');
  const [crmSaveLoading, setCrmSaveLoading] = useState(false);
  const [crmStatus, setCrmStatus] = useState(null);
  const [savedCrmSelectionKey, setSavedCrmSelectionKey] = useState(null);

  // Industries state
  const [industries, setIndustries] = useState([]);
  const [industriesLoading, setIndustriesLoading] = useState(true);
  const [industriesError, setIndustriesError] = useState(null);
  const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);

  // Company suggestions state
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);

  // Company segments state
  const [companySegments, setCompanySegments] = useState([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [segmentDropdownOpen, setSegmentDropdownOpen] = useState(false);
  const [segmentAutoSelected, setSegmentAutoSelected] = useState(false);

  // Locations state
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsLoaded, setLocationsLoaded] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIndustryDropdownOpen(false);
        setSegmentDropdownOpen(false);
        setLocationDropdownOpen(false);
        setShowCompanySuggestions(false);
        setPageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch industries and locations on component mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIndustriesLoading(true);
        setIndustriesError(null);

        const response = await getIndustries();

        if (response.success) {
          setIndustries(response.data);
          console.log('Industries loaded:', response.data.length);
        } else {
          setIndustriesError('Failed to load industries');
        }
      } catch (error) {
        console.error('Error fetching industries:', error);
        setIndustriesError('Failed to load industries');
      } finally {
        setIndustriesLoading(false);
      }
    };

    fetchIndustries();

    // Fetch credit costs and remaining credits
    fetchCreditCosts();
    fetchRemainingCredits();
  }, []);

  // Fetch credit costs from API
  const fetchCreditCosts = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/leads/credits/costs`);
      const data = await response.json();

      if (data.success) {
        setCreditCosts(data.data);
        console.log('Credit costs loaded:', data.data);
      }
    } catch (error) {
      console.error('Error fetching credit costs:', error);
      // Keep default costs if API fails
    }
  };

  // Fetch user's remaining credits
  const fetchRemainingCredits = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${apiBaseUrl}/leads/credits/balance/${user.id}`);
      const data = await response.json();

      if (data.success) {
        setRemainingCredits(data.remainingCredits || 0);
        console.log('Remaining credits:', data.remainingCredits);
      }
    } catch (error) {
      console.error('Error fetching remaining credits:', error);
    }
  };

  // Handle email view with credit consumption - Direct consumption without modal
  const handleViewEmail = async (lead) => {
    const cost = creditCosts.VIEW_EMAIL?.credits || 1;

    // Check if already viewed
    if (visibleEmails.has(lead.id)) {
      return; // Already visible
    }

    // Check sufficient credits
    if (remainingCredits < cost) {
      alert(`Insufficient credits. You need ${cost} credits to view email addresses. You have ${remainingCredits} credits remaining. Please upgrade your plan.`);
      return;
    }

    // Directly consume credits
    await consumeCredits('VIEW_EMAIL', lead, cost);
  };

  // Handle phone view with credit consumption - Direct consumption without modal
  const handleViewPhone = async (lead) => {
    const cost = creditCosts.VIEW_PHONE?.credits || 3;

    // Check if already viewed
    if (visiblePhones.has(lead.id)) {
      return; // Already visible
    }

    // Check sufficient credits
    if (remainingCredits < cost) {
      alert(`Insufficient credits. You need ${cost} credits to view phone numbers. You have ${remainingCredits} credits remaining. Please upgrade your plan.`);
      return;
    }

    // Directly consume credits
    await consumeCredits('VIEW_PHONE', lead, cost);
  };

  // Credit consumption function
  const consumeCredits = async (actionType, lead, cost) => {
    try {
      setCreditLoading(true);

      const requestBody = {
        actionType: actionType,
        leadId: lead.id.toString(),
        leadName: `${lead.First_Name || ''} ${lead.Last_Name || ''}`.trim() || 'N/A',
        leadCompany: lead.Account_Name || '',
        userId: user.id // This should be handled by auth middleware in production
      };

      if (actionType === 'VIEW_EMAIL') {
        requestBody.leadEmail = lead.email;
      } else if (actionType === 'VIEW_PHONE') {
        requestBody.leadPhone = lead.phone || lead.mobile;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/leads/credits/consume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.success) {
        // Update remaining credits
        setRemainingCredits(result.remainingCredits);

        // Update visibility
        if (actionType === 'VIEW_EMAIL') {
          setVisibleEmails(prev => new Set([...prev, lead.id]));
        } else if (actionType === 'VIEW_PHONE') {
          setVisiblePhones(prev => new Set([...prev, lead.id]));
        }

        // Emit event to update navbar credits
        window.dispatchEvent(new CustomEvent('creditsUpdated', {
          detail: { remainingCredits: result.remainingCredits }
        }));

        console.log(`${actionType} successful. Remaining credits: ${result.remainingCredits}`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error consuming credits:', error);
      alert('Failed to consume credits. Please try again.');
    } finally {
      setCreditLoading(false);
    }
  };

  // Calculate how many leads to download
  const getDownloadCount = () => {
    if (downloadCount === 'all') {
      return searchStats.matched; // Total matched from search
    } else {
      const custom = parseInt(customCount) || 0;
      return Math.min(custom, searchStats.matched);
    }
  };

  // Calculate bulk download cost breakdown
  const calculateDownloadCost = () => {
    const totalToDownload = getDownloadCount();

    if (totalToDownload === 0) {
      return {
        totalToDownload: 0,
        emailOnlyCost: 0,
        emailPhoneCost: 0,
        totalAvailable: searchStats.matched,
        currentlyShowing: leads.length
      };
    }

    // Simple cost calculation:
    // Email Only: 1 credit per lead
    // Email + Phone: 4 credits per lead
    // Backend will handle smart pricing for already viewed leads during actual consumption
    const emailOnlyCost = totalToDownload * 1; // 1 credit per lead for email only
    const emailPhoneCost = totalToDownload * 4; // 4 credits per lead for email + phone

    return {
      totalToDownload,
      emailOnlyCost,
      emailPhoneCost,
      totalAvailable: searchStats.matched,
      currentlyShowing: leads.length
    };
  };

  const getCurrentSelectionKey = () => JSON.stringify({
    searchCriteria,
    format: downloadFormat,
    requestedCount: getDownloadCount()
  });

  const saveLeadsToCRM = async ({ leadsArray, crmName = '', source = 'export', creditsConsumed = 0, remainingCreditsAfter }) => {
    const response = await fetch(`${apiBaseUrl}/user-crm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      credentials: 'include',
      body: JSON.stringify({
        crmObjectName: crmName,
        exportFormat: downloadFormat,
        source,
        searchCriteria,
        leads: leadsArray,
        metadata: {
          requestedCount: getDownloadCount(),
          matchedCount: searchStats.matched,
          creditsConsumed,
          remainingCreditsAfter,
          exportedAt: new Date().toISOString(),
          exportedBy: 'hotlead-inbox'
        }
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to save CRM object');
    }

    return result;
  };

  // Handle download leads button click
  const handleDownloadLeads = () => {
    if (leads.length === 0 || searchStats.matched === 0) {
      alert('No leads to download. Please search for leads first.');
      return;
    }

    // Initialize with default values
    setDownloadCount('all');
    setCustomCount('');
    setDownloadFormat('email_only');
    setShowCrmNameInput(false);
    setCrmObjectName('');
    setCrmStatus(null);
    setSavedCrmSelectionKey(null);
    setShowDownloadModal(true);
  };

  // Confirm download and consume credits
  const confirmDownload = async () => {
    try {
      setDownloadLoading(true);
      setCrmStatus(null);

      const totalCost = downloadFormat === 'email_only' ? downloadCostBreakdown.emailOnlyCost : downloadCostBreakdown.emailPhoneCost;
      const downloadCount = getDownloadCount();
      const currentSelectionKey = getCurrentSelectionKey();
      let updatedRemainingCredits = remainingCredits;

      if (!user?.id) {
        alert('Please log in to export leads.');
        return;
      }

      // Check if user has sufficient credits
      if (totalCost > remainingCredits) {
        alert(`Insufficient credits. You need ${totalCost} credits to download ${downloadCount} leads. You have ${remainingCredits} credits remaining.`);
        return;
      }

      // If there are credits to consume
      if (totalCost > 0) {
        // Consume credits for bulk download
        const response = await fetch(`${apiBaseUrl}/leads/credits/consume-bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            actionType: 'DOWNLOAD_LEADS',
            downloadFormat: downloadFormat,
            downloadCount: downloadCount,
            totalCost: totalCost,
            searchCriteria: searchCriteria,
            userId: user.id
          })
        });

        const result = await response.json();

        if (result.success) {
          // Update remaining credits
          setRemainingCredits(result.remainingCredits);
          updatedRemainingCredits = result.remainingCredits;

          // Emit event to update navbar credits
          window.dispatchEvent(new CustomEvent('creditsUpdated', {
            detail: { remainingCredits: result.remainingCredits }
          }));

          console.log(`Download credits consumed: ${totalCost}. Remaining: ${result.remainingCredits}`);
        } else {
          alert(`Error: ${result.message}`);
          return;
        }
      }

      const leadsToExport = await fetchLeadsForExport();

      if (savedCrmSelectionKey !== currentSelectionKey) {
        await saveLeadsToCRM({
          leadsArray: leadsToExport,
          crmName: crmObjectName.trim(),
          source: 'export',
          creditsConsumed: totalCost,
          remainingCreditsAfter: updatedRemainingCredits
        });
        setSavedCrmSelectionKey(currentSelectionKey);
      }

      downloadCSV(leadsToExport);

      setShowDownloadModal(false);

    } catch (error) {
      console.error('Error during download:', error);
      alert('Failed to download leads. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleSaveToCRM = async () => {
    if (!showCrmNameInput) {
      setShowCrmNameInput(true);
      setCrmStatus(null);
      return;
    }

    if (!crmObjectName.trim()) {
      setCrmStatus({
        type: 'error',
        message: 'First please name your CRM object.'
      });
      return;
    }

    if (!user?.id) {
      setCrmStatus({
        type: 'error',
        message: 'Please log in to save this CRM object.'
      });
      return;
    }

    try {
      setCrmSaveLoading(true);
      setCrmStatus(null);

      const leadsToSave = await fetchLeadsForExport();
      await saveLeadsToCRM({
        leadsArray: leadsToSave,
        crmName: crmObjectName.trim(),
        source: 'manual',
        remainingCreditsAfter: remainingCredits
      });

      setSavedCrmSelectionKey(getCurrentSelectionKey());
      setCrmStatus({
        type: 'success',
        message: `Saved to CRM as "${crmObjectName.trim()}".`
      });
    } catch (error) {
      console.error('Error saving CRM object:', error);
      setCrmStatus({
        type: 'error',
        message: error.message || 'Failed to save CRM object.'
      });
    } finally {
      setCrmSaveLoading(false);
    }
  };

  // Fetch the exact leads payload for CRM save and export
  const fetchLeadsForExport = async () => {
    try {
      const requestedCount = getDownloadCount();

      const response = await fetch(`${apiBaseUrl}/leads/generate-for-download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...searchCriteria,
          downloadFormat: downloadFormat,
          downloadCount: requestedCount,
          userId: user.id
        })
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching leads for download:', error);
    }

    return leads.slice(0, Math.min(getDownloadCount(), leads.length));
  };

  // Generate and download CSV file
  const downloadCSV = (leadsArray) => {
    try {
      // Prepare CSV headers based on format
      const headers = [
        'First Name',
        'Last Name',
        'Title',
        'Company',
        'Email'
      ];

      if (downloadFormat === 'email_phone') {
        headers.push('Phone');
      }

      headers.push('Industry', 'Segment', 'Country');

      // Prepare CSV data
      const csvData = leadsArray.map(lead => {
        const row = [
          lead.First_Name || '',
          lead.Last_Name || '',
          lead.title || '',
          lead.Account_Name || '',
          lead.email || ''
        ];

        if (downloadFormat === 'email_phone') {
          row.push(lead.phone || lead.mobile || '');
        }

        row.push(
          lead.GTM_Industry || '',
          lead.Account_Sub_Segment || '',
          lead.Mailing_Country || ''
        );

        return row;
      });

      // Combine headers and data
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        const formatSuffix = downloadFormat === 'email_phone' ? '_with_phone' : '_email_only';
        const countSuffix = getDownloadCount();
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_${countSuffix}${formatSuffix}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      console.log(`Downloaded ${leadsArray.length} leads to CSV (${downloadFormat})`);

    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Failed to generate CSV file. Please try again.');
    }
  };

  // Fetch company segments when industry changes
  useEffect(() => {
    if (searchCriteria.industry) {
      fetchCompanySegments(searchCriteria.industry);
    } else {
      setCompanySegments([]);
    }
  }, [searchCriteria.industry]);

  // Auto-recalculate download cost when dependencies change
  useEffect(() => {
    if (showDownloadModal) {
      setDownloadCostBreakdown(calculateDownloadCost());
    }
  }, [downloadCount, customCount, downloadFormat, searchStats.matched, showDownloadModal]);

  // Fetch company suggestions
  const fetchCompanySuggestions = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setCompanySuggestions([]);
      setShowCompanySuggestions(false);
      return;
    }

    try {
      setCompanyLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/leads/companies/suggestions?search=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (data.success) {
        setCompanySuggestions(data.data);
        setShowCompanySuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching company suggestions:', error);
    } finally {
      setCompanyLoading(false);
    }
  };

  // Fetch company segments for selected industry
  const fetchCompanySegments = async (industryValue) => {
    try {
      setSegmentsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/leads/segments?industry=${encodeURIComponent(industryValue)}`);
      const data = await response.json();

      if (data.success) {
        setCompanySegments(data.data);
      }
    } catch (error) {
      console.error('Error fetching company segments:', error);
    } finally {
      setSegmentsLoading(false);
    }
  };

  // Lazy load locations when dropdown is opened
  const fetchLocations = async () => {
    if (locationsLoaded) return; // Don't fetch if already loaded

    try {
      setLocationsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/leads/locations`);
      const data = await response.json();

      if (data.success) {
        setLocations(data.data);
        setLocationsLoaded(true);
        console.log('Locations loaded:', data.data.length);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLocationsLoading(false);
    }
  };


  // Handle company input changes with debounced suggestions
  const handleCompanyInputChange = (value) => {
    setSearchCriteria({...searchCriteria, company: value});

    // Debounce the API call
    clearTimeout(window.companySearchTimeout);
    window.companySearchTimeout = setTimeout(() => {
      fetchCompanySuggestions(value);
    }, 300);
  };

  // Handle company suggestion selection
  const selectCompanySuggestion = async (companyName) => {
    // Set the company name immediately
    setSearchCriteria({...searchCriteria, company: companyName});
    setShowCompanySuggestions(false);
    setCompanySuggestions([]);

    // Fetch and auto-set the company segment
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/leads/company-segment?companyName=${encodeURIComponent(companyName)}`
      );
      const data = await response.json();

      if (data.success && data.data.segment) {
        // Auto-set the segment for the selected company
        setSearchCriteria(prev => ({
          ...prev,
          company: companyName,
          companySegment: data.data.segment
        }));
        setSegmentAutoSelected(true);
        console.log(`Auto-selected segment "${data.data.segment}" for company "${companyName}"`);

        // Clear the auto-selected flag after 3 seconds
        setTimeout(() => {
          setSegmentAutoSelected(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error fetching company segment:', error);
      // Don't show error to user as this is a convenience feature
    }
  };

  const fetchLeadsWithPagination = async (page = 1) => {
    setIsGenerating(true);

    try {
      // For page 1, fetch from API. For other pages, use client-side pagination
      if (page === 1) {
        console.log('Fetching fresh data from API...');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/leads/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchCriteria),
        });

        const data = await response.json();
        console.log('API Response received:', data);

        if (data.success) {
          // Store all leads for client-side pagination
          setAllLeads(data.data);

          // Calculate pagination based on total leads received
          const totalLeads = data.data.length;
          const pages = Math.ceil(totalLeads / itemsPerPage);
          setTotalPages(pages);

          // Set current page leads (first page)
          const currentPageLeads = data.data.slice(0, itemsPerPage);
          setLeads(currentPageLeads);

          setSearchStats({
            matched: data.pagination?.totalMatched || totalLeads,
            available: data.pagination?.totalAvailable || totalLeads
          });

          setCurrentPage(1);
          setVisibleEmails(new Set());
          setVisiblePhones(new Set());
          setSelectedLeads(new Set());
          setSelectAll(false);
          setShowResults(true);

          console.log(`Loaded ${totalLeads} total leads, created ${pages} pages, showing first ${currentPageLeads.length} leads`);
        } else {
          console.error('Failed to generate leads:', data.message);
        }
      } else {
        // Client-side pagination for pages > 1
        console.log(`Switching to page ${page} using client-side pagination...`);

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPageLeads = allLeads.slice(startIndex, endIndex);

        setLeads(currentPageLeads);
        setCurrentPage(page);

        console.log(`Page ${page}: Showing leads ${startIndex + 1}-${Math.min(endIndex, allLeads.length)} of ${allLeads.length} total`);
      }
    } catch (error) {
      console.error('Error generating leads:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLeads = async () => {
    // Auto-collapse sidebar for better table viewing experience
    if (onCollapseSidebar) {
      onCollapseSidebar();
    }

    // Reset to first page for new search
    await fetchLeadsWithPagination(1);
  };

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      fetchLeadsWithPagination(newPage);
    }
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Helper function to truncate company names
  const truncateCompanyName = (companyName) => {
    if (!companyName || companyName === 'N/A') return companyName;

    const words = companyName.trim().split(/\s+/);
    if (words.length <= 10) return companyName;

    return words.slice(0, 10).join(' ') + '...';
  };

  // Handle individual lead selection
  const handleLeadSelection = (leadId, isSelected) => {
    const newSelectedLeads = new Set(selectedLeads);
    if (isSelected) {
      newSelectedLeads.add(leadId);
    } else {
      newSelectedLeads.delete(leadId);
      setSelectAll(false);
    }
    setSelectedLeads(newSelectedLeads);
  };

  // Handle select all leads on current page
  const handleSelectAll = (isSelected) => {
    setSelectAll(isSelected);
    if (isSelected) {
      const newSelectedLeads = new Set(selectedLeads);
      leads.forEach(lead => newSelectedLeads.add(lead.id));
      setSelectedLeads(newSelectedLeads);
    } else {
      const newSelectedLeads = new Set(selectedLeads);
      leads.forEach(lead => newSelectedLeads.delete(lead.id));
      setSelectedLeads(newSelectedLeads);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6 relative">
      {/* Search Criteria */}
      <div className="w-64 min-w-64 max-w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-3 h-fit overflow-visible">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Lead Search Criteria</h2>

        <div className="grid grid-cols-1 gap-2 mb-3">
          {/* Industry Dropdown */}
          <div className="relative dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Target className="w-4 h-4 inline mr-1" />
              Industry
              {industriesLoading && (
                <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
              )}
              {industriesError && (
                <span className="ml-2 text-xs text-red-500">⚠ Using fallback data</span>
              )}
            </label>
            <div className="relative">
              <button
                onClick={() => setIndustryDropdownOpen(!industryDropdownOpen)}
                disabled={industriesLoading}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-left flex justify-between items-center bg-white"
              >
                <span className={searchCriteria.industry ? 'text-gray-900' : 'text-gray-500'}>
                  {searchCriteria.industry
                    ? industries.find(ind => ind.value === searchCriteria.industry)?.label || searchCriteria.industry
                    : (industriesLoading ? 'Loading industries...' : 'Select Industry')
                  }
                </span>
                {industryDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {industryDropdownOpen && !industriesLoading && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSearchCriteria({...searchCriteria, industry: '', companySegment: ''});
                      setIndustryDropdownOpen(false);
                      setSegmentAutoSelected(false);
                    }}
                    className="w-full px-2 py-1.5 text-left hover:bg-gray-100 text-gray-500"
                  >
                    Select Industry
                  </button>
                  {industries.map((industry) => (
                    <button
                      key={industry.value}
                      onClick={() => {
                        setSearchCriteria({...searchCriteria, industry: industry.value, companySegment: ''});
                        setIndustryDropdownOpen(false);
                        setSegmentAutoSelected(false);
                      }}
                      className="w-full px-2 py-1.5 text-left hover:bg-gray-100 focus:bg-gray-100 text-gray-900"
                    >
                      {industry.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Company Input with Autocomplete */}
          <div className="relative dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building2 className="w-4 h-4 inline mr-1" />
              Company Name
            </label>
            <input
              type="text"
              value={searchCriteria.company}
              onChange={(e) => handleCompanyInputChange(e.target.value)}
              placeholder="e.g., Google, Microsoft..."
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {companyLoading && (
              <div className="absolute right-2 top-8">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* Company Suggestions Dropdown */}
            {showCompanySuggestions && companySuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-40 overflow-y-auto">
                {companySuggestions.map((company, index) => (
                  <button
                    key={index}
                    onClick={() => selectCompanySuggestion(company)}
                    className="w-full px-2 py-1.5 text-left hover:bg-gray-100 focus:bg-gray-100 text-gray-900 text-sm"
                  >
                    {company}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Company Segment Dropdown */}
          <div className="relative dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="w-4 h-4 inline mr-1" />
              Company Segment
              {segmentsLoading && (
                <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
              )}
              {segmentAutoSelected && (
                <span className="ml-2 text-xs text-green-600">✓ Auto-selected</span>
              )}
            </label>
            <div className="relative">
              <button
                onClick={() => setSegmentDropdownOpen(!segmentDropdownOpen)}
                disabled={!searchCriteria.industry || segmentsLoading}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-left flex justify-between items-center bg-white"
              >
                <span className={searchCriteria.companySegment ? 'text-gray-900' : 'text-gray-500'}>
                  {searchCriteria.companySegment || (
                    !searchCriteria.industry
                      ? 'Select industry first'
                      : segmentsLoading
                        ? 'Loading segments...'
                        : 'Select Segment'
                  )}
                </span>
                {segmentDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {segmentDropdownOpen && !segmentsLoading && companySegments.length > 0 && (
                <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSearchCriteria({...searchCriteria, companySegment: ''});
                      setSegmentDropdownOpen(false);
                      setSegmentAutoSelected(false);
                    }}
                    className="w-full px-2 py-1.5 text-left hover:bg-gray-100 text-gray-500"
                  >
                    Select Segment
                  </button>
                  {companySegments.map((segment, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchCriteria({...searchCriteria, companySegment: segment});
                        setSegmentDropdownOpen(false);
                        setSegmentAutoSelected(false);
                      }}
                      className="w-full px-2 py-1.5 text-left hover:bg-gray-100 focus:bg-gray-100 text-gray-900"
                    >
                      {segment}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location Dropdown */}
          <div className="relative dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Country
              {locationsLoading && (
                <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
              )}
            </label>
            <div className="relative">
              <button
                onClick={() => {
                  if (!locationDropdownOpen) {
                    fetchLocations(); // Lazy load locations when opening dropdown
                  }
                  setLocationDropdownOpen(!locationDropdownOpen);
                }}
                disabled={locationsLoading}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-left flex justify-between items-center bg-white"
              >
                <span className={searchCriteria.location ? 'text-gray-900' : 'text-gray-500'}>
                  {searchCriteria.location || (
                    locationsLoading ? 'Loading countries...' :
                    locationsLoaded ? 'Select Country' : 'Select Country'
                  )}
                </span>
                {locationDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {locationDropdownOpen && !locationsLoading && locations.length > 0 && (
                <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSearchCriteria({...searchCriteria, location: ''});
                      setLocationDropdownOpen(false);
                    }}
                    className="w-full px-2 py-1.5 text-left hover:bg-gray-100 text-gray-500"
                  >
                    Select Country
                  </button>
                  {locations.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchCriteria({...searchCriteria, location: location});
                        setLocationDropdownOpen(false);
                      }}
                      className="w-full px-2 py-1.5 text-left hover:bg-gray-100 focus:bg-gray-100 text-gray-900"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <button
            onClick={handleGenerateLeads}
            disabled={isGenerating || !searchCriteria.industry}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 flex items-center cursor-pointer disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching Leads...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Leads
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Table */}
      {showResults ? (
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Find People</h3>
              </div>

              <button
                onClick={handleDownloadLeads}
                disabled={leads.length === 0}
                className="flex items-center cursor-pointer space-x-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Download className="w-3 h-3" />
                <span>Export Leads</span>
              </button>
            </div>
          </div>


          {leads.length > 0 ? (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Checkbox Column Header */}
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Segment
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    {/* Actions Column Header */}
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead, index) => (
                    <tr key={lead.id || index} className={`hover:bg-gray-50 ${selectedLeads.has(lead.id) ? 'bg-blue-50' : ''}`}>
                      {/* Checkbox Column */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id)}
                          onChange={(e) => handleLeadSelection(lead.id, e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {`${lead.First_Name || ''} ${lead.Last_Name || ''}`.trim() || 'N/A'}
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900" title={lead.Account_Name || 'N/A'}>
                          {truncateCompanyName(lead.Account_Name || 'N/A')}
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.GTM_Industry || 'N/A'}</div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.Mailing_Country || 'N/A'}
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {lead.Account_Sub_Segment || 'N/A'}
                        </span>
                      </td>
                      {/* Email Column */}
                      <td className="px-2 py-3 whitespace-nowrap">
                        {lead.email ? (
                          visibleEmails.has(lead.id) ? (
                            <div className="flex items-center space-x-1">
                              <Mail className="w-3 h-3 text-indigo-600" />
                              <span className="text-sm text-indigo-600">{lead.email}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleViewEmail(lead)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors border border-gray-200 hover:border-indigo-300"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View ({creditCosts.VIEW_EMAIL?.credits || 1}⚡)</span>
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-gray-400 italic">No email</span>
                        )}
                      </td>

                      {/* Phone Column */}
                      <td className="px-2 py-3 whitespace-nowrap">
                        {(lead.phone || lead.mobile) ? (
                          visiblePhones.has(lead.id) ? (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-gray-600" />
                              <span className="text-sm text-gray-600">{lead.phone || lead.mobile}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleViewPhone(lead)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-green-50 hover:text-green-600 rounded-md transition-colors border border-gray-200 hover:border-green-300"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View ({creditCosts.VIEW_PHONE?.credits || 3}⚡)</span>
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-gray-400 italic">No phone</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-2 py-3 whitespace-nowrap">
                        {/* Empty for now - actions will be added later */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}

          {/* Pagination Controls - Below Table */}
          {totalPages > 1 && (
            <div className="px-6 py-1.5 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1}
                    className="p-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Page Dropdown */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setPageDropdownOpen(!pageDropdownOpen)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center space-x-1"
                    >
                      <span>{currentPage}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>

                    {pageDropdownOpen && (
                      <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => {
                              handlePageChange(pageNum);
                              setPageDropdownOpen(false);
                            }}
                            className={`w-full px-2 py-1.5 text-left hover:bg-gray-100 text-sm ${
                              pageNum === currentPage ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-900'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    className="p-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Page Information - right side */}
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search for leads</h3>
            <p className="text-gray-600">Select your criteria and click &quot;Search Leads&quot; to get started</p>
          </div>
        </div>
      )}

      </div>


      {/* Modern Export Leads Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          {/* Modal */}
          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-96 mx-4 transform transition-all pointer-events-auto border border-gray-100 overflow-hidden hover:shadow-3xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-between px-3 py-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Export Leads</h3>
                </div>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Results Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-3 py-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700 font-medium">Available Leads:</span>
                    <span className="font-semibold text-blue-900">{downloadCostBreakdown.totalAvailable.toLocaleString()}</span>
                  </div>
                </div>

                {/* Quantity & Format in 2 columns */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Quantity Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>Quantity</span>
                    </label>
                    <div className="space-y-1.5">
                      <label className="flex items-center space-x-1 p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200">
                        <input
                          type="radio"
                          name="downloadCount"
                          checked={downloadCount === 'all'}
                          onChange={() => setDownloadCount('all')}
                          className="text-indigo-600 w-3 h-3 cursor-pointer"
                        />
                        <span className="text-xs text-gray-900 font-medium cursor-pointer">All</span>
                      </label>

                      <label className="flex items-center space-x-1 p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200">
                        <input
                          type="radio"
                          name="downloadCount"
                          checked={downloadCount === 'custom'}
                          onChange={() => setDownloadCount('custom')}
                          className="text-indigo-600 w-3 h-3 cursor-pointer"
                        />
                        <input
                          type="number"
                          min="1"
                          max={downloadCostBreakdown.totalAvailable}
                          value={customCount}
                          onChange={(e) => {
                            setCustomCount(e.target.value);
                            setDownloadCount('custom');
                          }}
                          placeholder="Custom"
                          className="flex-1 px-1 py-0.5 border-0 bg-transparent text-xs focus:outline-none placeholder-gray-400 font-medium cursor-text"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Format Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>Format</span>
                    </label>
                    <div className="space-y-1.5">
                      <label className="flex items-center justify-between p-2 rounded-lg border cursor-pointer hover:scale-105 transition-all duration-200 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100">
                        <div className="flex items-center space-x-1">
                          <input
                            type="radio"
                            name="downloadFormat"
                            value="email_only"
                            checked={downloadFormat === 'email_only'}
                            onChange={(e) => setDownloadFormat(e.target.value)}
                            className="text-emerald-600 w-3 h-3 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-emerald-900 cursor-pointer">Email</span>
                        </div>
                        <span className="text-xs bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">1⚡</span>
                      </label>

                      <label className="flex items-center justify-between p-2 rounded-lg border cursor-pointer hover:scale-105 transition-all duration-200 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100">
                        <div className="flex items-center space-x-1">
                          <input
                            type="radio"
                            name="downloadFormat"
                            value="email_phone"
                            checked={downloadFormat === 'email_phone'}
                            onChange={(e) => setDownloadFormat(e.target.value)}
                            className="text-blue-600 w-3 h-3 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-blue-900 cursor-pointer">Email+Phone</span>
                        </div>
                        <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full font-bold">4⚡</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Cost Summary - Modern */}
                <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 rounded-xl p-3">
                  <div className="flex items-center space-x-1 mb-2">
                    <Zap className="w-3 h-3 text-amber-600" />
                    <span className="text-xs font-bold text-amber-800">Cost Summary</span>
                  </div>
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Export:</span>
                      <span className="font-bold text-gray-900">{downloadCostBreakdown.totalToDownload.toLocaleString()} leads</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Cost:</span>
                      <span className="font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                        {downloadFormat === 'email_only' ? downloadCostBreakdown.emailOnlyCost : downloadCostBreakdown.emailPhoneCost}⚡
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-amber-200">
                      <span className="text-gray-600 font-medium">Remaining:</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${
                        remainingCredits - (downloadFormat === 'email_only' ? downloadCostBreakdown.emailOnlyCost : downloadCostBreakdown.emailPhoneCost) >= 0
                          ? 'text-green-700 bg-green-200' : 'text-red-700 bg-red-200'
                      }`}>
                        {remainingCredits - (downloadFormat === 'email_only' ? downloadCostBreakdown.emailOnlyCost : downloadCostBreakdown.emailPhoneCost)}⚡
                      </span>
                    </div>
                  </div>
                </div>

                {/* Insufficient credits warning - Modern */}
                {remainingCredits < (downloadFormat === 'email_only' ? downloadCostBreakdown.emailOnlyCost : downloadCostBreakdown.emailPhoneCost) && (
                  <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-red-100 rounded-full">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                      </div>
                      <div>
                        <span className="text-xs text-red-700 font-bold block">Insufficient Credits</span>
                        <span className="text-xs text-red-600">Need {(downloadFormat === 'email_only' ? downloadCostBreakdown.emailOnlyCost : downloadCostBreakdown.emailPhoneCost) - remainingCredits} more</span>
                      </div>
                    </div>
                  </div>
                )}

                {showCrmNameInput && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 block">
                      First please name your CRM object
                    </label>
                    <input
                      type="text"
                      value={crmObjectName}
                      onChange={(e) => setCrmObjectName(e.target.value)}
                      placeholder="List1"
                      maxLength={100}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}

                {crmStatus && (
                  <div className={`p-3 rounded-xl border text-xs font-medium ${
                    crmStatus.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {crmStatus.message}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex space-x-3 p-4 bg-gray-50/50 border-t border-gray-100">
                <button
                  onClick={handleSaveToCRM}
                  disabled={crmSaveLoading}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                >
                  {crmSaveLoading ? 'Saving...' : showCrmNameInput ? 'Save List' : 'Save to CRM'}
                </button>
                <button
                  onClick={confirmDownload}
                  disabled={
                    downloadLoading ||
                    crmSaveLoading ||
                    downloadCostBreakdown.totalToDownload === 0 ||
                    (downloadFormat === 'email_only'
                      ? downloadCostBreakdown.emailOnlyCost > remainingCredits
                      : downloadCostBreakdown.emailPhoneCost > remainingCredits
                    )
                  }
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-1 hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  {downloadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </>
                  )}
                </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
