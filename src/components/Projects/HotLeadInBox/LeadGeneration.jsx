'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Building2,
  Users,
  Target,
  MapPin
} from 'lucide-react';
import { getIndustries } from '../../../services/industriesApi';

export default function LeadGeneration({ onCollapseSidebar, onExpandSidebar }) {
  const [searchCriteria, setSearchCriteria] = useState({
    industry: '',
    company: '',
    companySegment: '',
    location: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [leads, setLeads] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchStats, setSearchStats] = useState({ matched: 0, available: 0 });

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
  }, []);

  // Fetch company segments when industry changes
  useEffect(() => {
    if (searchCriteria.industry) {
      fetchCompanySegments(searchCriteria.industry);
    } else {
      setCompanySegments([]);
    }
  }, [searchCriteria.industry]);

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

  const handleGenerateLeads = async () => {
    setIsGenerating(true);

    // Auto-collapse sidebar for better table viewing experience
    if (onCollapseSidebar) {
      onCollapseSidebar();
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/leads/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchCriteria),
      });

      const data = await response.json();

      if (data.success) {
        setLeads(data.data);
        setSearchStats({
          matched: data.pagination.totalMatched,
          available: data.pagination.totalAvailable
        });
        setShowResults(true);
        console.log(`Leads generated: ${data.data.length} returned (${data.pagination.totalMatched} matched out of ${data.pagination.totalAvailable} available)`);
      } else {
        console.error('Failed to generate leads:', data.message);
      }
    } catch (error) {
      console.error('Error generating leads:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Criteria */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Lead Search Criteria</h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Industry Dropdown */}
          <div className="relative dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-left flex justify-between items-center bg-white"
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
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSearchCriteria({...searchCriteria, industry: '', companySegment: ''});
                      setIndustryDropdownOpen(false);
                      setSegmentAutoSelected(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 text-gray-500"
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
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 text-gray-900"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Company Name
            </label>
            <input
              type="text"
              value={searchCriteria.company}
              onChange={(e) => handleCompanyInputChange(e.target.value)}
              placeholder="e.g., Google, Microsoft..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {companyLoading && (
              <div className="absolute right-3 top-9">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* Company Suggestions Dropdown */}
            {showCompanySuggestions && companySuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {companySuggestions.map((company, index) => (
                  <button
                    key={index}
                    onClick={() => selectCompanySuggestion(company)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 text-gray-900 text-sm"
                  >
                    {company}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Company Segment Dropdown */}
          <div className="relative dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-left flex justify-between items-center bg-white"
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
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSearchCriteria({...searchCriteria, companySegment: ''});
                      setSegmentDropdownOpen(false);
                      setSegmentAutoSelected(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 text-gray-500"
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
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 text-gray-900"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-left flex justify-between items-center bg-white"
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
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSearchCriteria({...searchCriteria, location: ''});
                      setLocationDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 text-gray-500"
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
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 text-gray-900"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              setSearchCriteria({industry: '', company: '', companySegment: '', location: ''});
              setSegmentAutoSelected(false);
              setShowResults(false);
              setSearchStats({ matched: 0, available: 0 });

              // Expand sidebar for setting up new search criteria
              if (onExpandSidebar) {
                onExpandSidebar();
              }
            }}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm cursor-pointer"
          >
            Clear All
          </button>

          <button
            onClick={handleGenerateLeads}
            disabled={isGenerating || !searchCriteria.industry}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 flex items-center cursor-pointer disabled:cursor-not-allowed"
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
      {showResults && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
              <p className="text-sm text-gray-600 mt-1">
                Found <span className="font-semibold text-indigo-600">{searchStats.matched.toLocaleString()}</span> leads out of <span className="font-semibold">{searchStats.available.toLocaleString()}</span> leads available for that search criteria
              </p>
            </div>
          </div>

          {leads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Segment
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead, index) => (
                    <tr key={lead.id || index} className="hover:bg-gray-50">
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {`${lead.First_Name || ''} ${lead.Last_Name || ''}`.trim() || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{lead.title || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.Account_Name || 'N/A'}</div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.GTM_Industry || 'N/A'}</div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.Mailing_Country || 'N/A'}
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {lead.Account_Sub_Segment || 'N/A'}
                        </span>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {lead.email && (
                            <div className="text-sm text-indigo-600 hover:text-indigo-900 cursor-pointer">
                              {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="text-sm text-gray-500">{lead.phone}</div>
                          )}
                        </div>
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
        </div>
      )}

    </div>
  );
}