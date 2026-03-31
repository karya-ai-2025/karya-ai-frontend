'use client';

// components/onboarding-expert/ExpertServices.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, DollarSign, Clock, Briefcase, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { updateServices, getExpertOnboardingStatus, skipStep } from '@/services/expertonboardingApi';

function ExpertServices() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [services, setServices] = useState([
    {
      id: 1,
      name: '',
      description: '',
      pricing: '',
      duration: '',
      pricingType: 'hourly'
    }
  ]);

  const pricingTypes = [
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'project', label: 'Per Project' },
    { value: 'monthly', label: 'Monthly Retainer' },
    { value: 'custom', label: 'Custom Quote' }
  ];

  // Fetch existing services on load
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getExpertOnboardingStatus();
        if (response.data?.services && response.data.services.length > 0) {
          const existingServices = response.data.services.map((s, index) => ({
            id: index + 1,
            name: s.name || '',
            description: s.description || '',
            pricing: s.pricing || '',
            duration: s.duration || '',
            pricingType: s.pricingType || 'hourly'
          }));
          setServices(existingServices);
        }
      } catch (err) {
        console.log('No existing services data');
      } finally {
        setIsFetching(false);
      }
    };
    fetchStatus();
  }, []);

  const handleServiceChange = (id, field, value) => {
    setServices(services.map(service =>
      service.id === id ? { ...service, [field]: value } : service
    ));
    setError('');
  };

  const addService = () => {
    const newId = Math.max(...services.map(s => s.id)) + 1;
    setServices([...services, {
      id: newId,
      name: '',
      description: '',
      pricing: '',
      duration: '',
      pricingType: 'hourly'
    }]);
  };

  const removeService = (id) => {
    if (services.length > 1) {
      setServices(services.filter(service => service.id !== id));
    }
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await skipStep(3);
      router.push('/onboarding-expert/portfolio');
    } catch (err) {
      router.push('/onboarding-expert/portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // Check if at least one service is filled
    const validServices = services.filter(s => s.name.trim() && s.pricing.trim());

    if (validServices.length === 0) {
      setError('Please add at least one service with a name and pricing');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateServices(validServices.map(s => ({
        name: s.name.trim(),
        description: s.description.trim(),
        pricing: s.pricing.trim(),
        pricingType: s.pricingType,
        duration: s.duration.trim()
      })));
      router.push('/onboarding-expert/portfolio');
    } catch (err) {
      setError(err.message || 'Failed to save services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding-expert/skills');
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 3 of 4</span>
            <span className="text-sm text-gray-500">75% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Services & Pricing
          </h1>
          <p className="text-gray-500 mb-8 text-center">
            Define the services you offer and your pricing structure
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Services */}
          <div className="space-y-6 mb-8 max-h-[600px] overflow-y-auto pr-2">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 relative"
              >
                {/* Remove Button */}
                {services.length > 1 && (
                  <button
                    onClick={() => removeService(service.id)}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Service {index + 1}
                </h3>

                <div className="space-y-4">
                  {/* Service Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => handleServiceChange(service.id, 'name', e.target.value)}
                        placeholder="e.g., HubSpot CRM Implementation"
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Service Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Description
                    </label>
                    <textarea
                      value={service.description}
                      onChange={(e) => handleServiceChange(service.id, 'description', e.target.value)}
                      placeholder="Describe what this service includes..."
                      rows={3}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none disabled:opacity-50"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Pricing Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Pricing Type
                      </label>
                      <select
                        value={service.pricingType}
                        onChange={(e) => handleServiceChange(service.id, 'pricingType', e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                      >
                        {pricingTypes.map((type) => (
                          <option key={type.value} value={type.value} className="bg-white">
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pricing Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        {service.pricingType === 'custom' ? 'Starting From' : 'Price'} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <DollarSign className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={service.pricing}
                          onChange={(e) => handleServiceChange(service.id, 'pricing', e.target.value)}
                          placeholder={
                            service.pricingType === 'hourly' ? '100/hr' :
                            service.pricingType === 'project' ? '5,000' :
                            service.pricingType === 'monthly' ? '2,500/mo' :
                            'Contact for quote'
                          }
                          disabled={isLoading}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Typical Duration */}
                  {service.pricingType === 'project' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Typical Duration
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={service.duration}
                          onChange={(e) => handleServiceChange(service.id, 'duration', e.target.value)}
                          placeholder="e.g., 2-4 weeks"
                          disabled={isLoading}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Service Button */}
          <button
            onClick={addService}
            disabled={isLoading}
            className="w-full mb-8 py-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl text-blue-700 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Add Another Service
          </button>

          {/* Skip Link */}
          <div className="text-center mb-6">
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-900 text-sm transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              Skip this step
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Helper Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-700 text-sm flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                Be clear about your services and pricing. This helps businesses understand what you offer and makes it easier for them to hire you. You can always adjust these later.
              </span>
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              disabled={isLoading}
              className="flex-1 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertServices;