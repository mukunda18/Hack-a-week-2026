
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import OfficeTypeFilter from '../components/report/OfficeTypeFilter';
import OfficeSelector from '../components/report/OfficeSelector';
import OfficeConfirmation from '../components/report/OfficeConfirmation';
import ReportForm from '../components/report/ReportForm';
import SuccessMessage from '../components/report/SuccessMessage';

function ReportContent() {
  const searchParams = useSearchParams();
  const [offices, setOffices] = useState([]);
  const [officeTypes, setOfficeTypes] = useState([]);

  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const [loadingOffices, setLoadingOffices] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [bribeAmount, setBribeAmount] = useState('');
  const [serviceDelay, setServiceDelay] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [interactionMethod, setInteractionMethod] = useState('');
  const [outcome, setOutcome] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Office Types
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const typesRes = await axios.get('/api/getOfficeTypes');
        setOfficeTypes(typesRes.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setOfficeTypes([
          { id: 1, name: 'Police Station' },
          { id: 2, name: 'Municipal Office' },
          { id: 3, name: 'Land Revenue Office' },
          { id: 4, name: 'Transport Office' }
        ]);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchInitialData();
  }, []);

  // Handle URL Pre-fill
  useEffect(() => {
    const prefillData = async () => {
      const officeId = searchParams.get('officeId');

      if (officeId) {
        try {
          const res = await axios.get(`/api/getOffice/${officeId}`);
          const office = res.data;
          if (office) {
            setSelectedType(office.office_type_id);
            setSelectedOffice(office.id);
          }
        } catch (error) {
          console.error('Error pre-filling office:', error);
        }
      }

      if (searchParams.get('bribeAmount')) setBribeAmount(searchParams.get('bribeAmount'));
      if (searchParams.get('serviceDelay')) setServiceDelay(searchParams.get('serviceDelay'));
      if (searchParams.get('serviceType')) setServiceType(searchParams.get('serviceType'));
      if (searchParams.get('description')) setDescription(searchParams.get('description'));
      if (searchParams.get('visitTime')) setVisitTime(searchParams.get('visitTime'));
      if (searchParams.get('interactionMethod')) setInteractionMethod(searchParams.get('interactionMethod'));
      if (searchParams.get('outcome')) setOutcome(searchParams.get('outcome'));
    };
    prefillData();
  }, [searchParams]);

  // Fetch Offices - Only when type changes
  useEffect(() => {
    const fetchOffices = async () => {
      if (selectedType === '') return;
      setLoadingOffices(true);
      try {
        const response = await axios.get(`/api/getOffices/${selectedType}`);
        setOffices(response.data);

        // Sanity check for selected office in new list
        if (selectedOffice && !response.data.find(o => o.id === parseInt(selectedOffice))) {
          setSelectedOffice('');
        }
      } catch (error) {
        console.error('Error fetching offices:', error);
        setOffices([]);
      } finally {
        setLoadingOffices(false);
      }
    };
    fetchOffices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]); // Removed selectedOffice to prevent redundant fetches

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setSuccess(false);
  };

  const handleOfficeChange = (e) => {
    setSelectedOffice(e.target.value);
    setSuccess(false);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOffice || (!bribeAmount && !serviceDelay)) {
      setErrorMsg('Please provide at least a bribe amount or service delay.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await axios.post('/api/postReport', {
        officeId: selectedOffice,
        bribeAmount: bribeAmount || null,
        serviceDelay: serviceDelay || null,
        serviceType: serviceType || null,
        description: description || null,
        visitTime: visitTime || null,
        interactionMethod: interactionMethod || null,
        outcome: outcome || null,
        select: { id: true } // Request only ID back
      });
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Reset form fields
      setBribeAmount('');
      setServiceDelay('');
      setServiceType('');
      setDescription('');
      setVisitTime('');
      setInteractionMethod('');
      setOutcome('');
    } catch (err) {
      console.error('Error submitting report:', err);
      const errorMessage = err.response?.data?.error || 'Failed to submit report. Please try again.';
      setErrorMsg(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setSelectedOffice('');
    setSelectedType('all');
    setBribeAmount('');
    setServiceDelay('');
    setDescription('');
  };

  const handleClearFilters = () => {
    setSelectedType('all');
    setSelectedOffice('');
  };

  const selectedOfficeName = offices.find(o => o.id === parseInt(selectedOffice))?.name;

  // Progress Steps logic
  const currentStep = !selectedOffice ? 1 : (success ? 3 : 2);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-red-600 uppercase bg-red-50 rounded-full border border-red-100">
            Secure & Anonymous
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Report Corruption
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Every report helps expose systemic issues in public services. Your identity is protected using 256-bit encryption.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
            {[
              { n: 1, label: 'Choose Office' },
              { n: 2, label: 'Report Details' },
              { n: 3, label: 'Completion' }
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentStep >= s.n ? 'bg-red-600 text-white ring-4 ring-red-100' : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}>
                  {currentStep > s.n ? '✓' : s.n}
                </div>
                <span className={`mt-2 text-xs font-semibold ${currentStep >= s.n ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transform transition-all duration-500">
          <div className="p-8 sm:p-10">
            {!success ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Step 1: Office Selection */}
                <div className={`space-y-6 transition-opacity duration-300 ${currentStep > 1 ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="grid grid-cols-1 gap-6">
                    <OfficeTypeFilter
                      selectedType={selectedType}
                      officeTypes={officeTypes}
                      loadingTypes={loadingTypes}
                      onTypeChange={handleTypeChange}
                    />

                    <OfficeSelector
                      selectedOffice={selectedOffice}
                      offices={offices}
                      loadingOffices={loadingOffices}
                      onOfficeChange={handleOfficeChange}
                    />
                  </div>
                </div>

                {/* Step 2: Form */}
                {selectedOffice && (
                  <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                      <OfficeConfirmation officeName={selectedOfficeName} />
                      <Link
                        href={`/office/${selectedOffice}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md"
                        target="_blank"
                      >
                        Stats ↗
                      </Link>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                    <ReportForm
                      bribeAmount={bribeAmount}
                      onBribeAmountChange={(e) => setBribeAmount(e.target.value)}
                      serviceDelay={serviceDelay}
                      onServiceDelayChange={(e) => setServiceDelay(e.target.value)}
                      serviceType={serviceType}
                      onServiceTypeChange={(e) => setServiceType(e.target.value)}
                      description={description}
                      onDescriptionChange={(e) => setDescription(e.target.value)}
                      visitTime={visitTime}
                      onVisitTimeChange={(e) => setVisitTime(e.target.value)}
                      interactionMethod={interactionMethod}
                      onInteractionMethodChange={(e) => setInteractionMethod(e.target.value)}
                      outcome={outcome}
                      onOutcomeChange={(e) => setOutcome(e.target.value)}
                      onSubmit={handleSubmit}
                      submitting={submitting}
                      errorMsg={errorMsg}
                    />
                  </div>
                )}

                {/* Empty states */}
                {!loadingOffices && offices.length === 0 && selectedType && selectedType !== 'all' && (
                  <div className="py-12">
                    <EmptyState
                      title="No offices found"
                      description="We couldn't find any offices matching this category in our registry."
                      actionLabel="Clear Filters"
                      onAction={handleClearFilters}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-700">
                <SuccessMessage onReset={handleReset} />
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>© 2026 GhusMeter Nepal • Standing against bribery and delays</p>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportContent />
    </Suspense>
  );
}