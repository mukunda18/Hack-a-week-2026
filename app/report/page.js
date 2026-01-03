
'use client';

import { useState, useEffect } from 'react';
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

export default function ReportPage() {
  const searchParams = useSearchParams();
  const [offices, setOffices] = useState([]);
  const [officeTypes, setOfficeTypes] = useState([]);

  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const [loadingOffices, setLoadingOffices] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [bribeAmount, setBribeAmount] = useState('');
  const [serviceDelay, setServiceDelay] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  useEffect(() => {
    const prefillOffice = async () => {
      const officeId = searchParams.get('officeId');
      if (officeId) {
        try {
          // Fetch the office to get its type
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
    };
    prefillOffice();
  }, [searchParams]);

  useEffect(() => {
    const fetchOffices = async () => {
      if (selectedType === '') return;
      setLoadingOffices(true);
      try {
        const response = await axios.get(`/api/getOffices/${selectedType}`);
        setOffices(response.data);

        if (selectedOffice && !response.data.find(o => o.id === parseInt(selectedOffice))) {
          setSelectedOffice('');
        }
      } catch (error) {
        console.error('Error fetching offices:', error);
        const mockOffices = [
          { id: 1, name: 'Central Police Station', province: 'Province 1', district: 'Kathmandu', municipality: 'Kathmandu' },
          { id: 2, name: 'District Police Office', province: 'Province 1', district: 'Kathmandu', municipality: 'Kathmandu' },
          { id: 3, name: 'Traffic Police Unit', province: 'Province 1', district: 'Kathmandu', municipality: 'Kathmandu' }
        ];
        setOffices(mockOffices);
        if (selectedOffice && !mockOffices.find(o => o.id === parseInt(selectedOffice))) {
          setSelectedOffice('');
        }
      } finally {
        setLoadingOffices(false);
      }
    };
    fetchOffices();
  }, [selectedType]);

  const handleTypeChange = (e) => setSelectedType(e.target.value);

  const handleOfficeChange = (e) => {
    setSelectedOffice(e.target.value);
    setSuccess(false);
    setErrorMsg('');
  };

  const handleBribeAmountChange = (e) => setBribeAmount(e.target.value);
  const handleServiceDelayChange = (e) => setServiceDelay(e.target.value);

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
        serviceDelay: serviceDelay || null
      });
      setSuccess(true);
      setBribeAmount('');
      setServiceDelay('');
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
  };

  const handleClearFilters = () => {
    setSelectedType('all');
    setSelectedOffice('');
  };

  const selectedOfficeName = offices.find(o => o.id === parseInt(selectedOffice))?.name;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">

          <PageHeader
            title="Anonymous Corruption Reporting"
          >
            <p className="text-gray-600">
              Submit a report about bribery or service delays in public offices.
              Your submission is <strong>100% anonymous</strong> and helps visualize corruption across Nepal.
            </p>
          </PageHeader>

          <div className="space-y-6">

            <div className="border-b border-gray-200 pb-6">
              <OfficeTypeFilter
                selectedType={selectedType}
                officeTypes={officeTypes}
                loadingTypes={loadingTypes}
                onTypeChange={handleTypeChange}
              />
            </div>

            <OfficeSelector
              selectedOffice={selectedOffice}
              offices={offices}
              loadingOffices={loadingOffices}
              onOfficeChange={handleOfficeChange}
            />

            {selectedOffice && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <OfficeConfirmation officeName={selectedOfficeName} />
                  <Link
                    href={`/office/${selectedOffice}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline px-3"
                    target="_blank"
                  >
                    View Office Stats ↗
                  </Link>
                </div>

                {!success ? (
                  <ReportForm
                    bribeAmount={bribeAmount}
                    onBribeAmountChange={handleBribeAmountChange}
                    serviceDelay={serviceDelay}
                    onServiceDelayChange={handleServiceDelayChange}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    errorMsg={errorMsg}
                  />
                ) : (
                  <SuccessMessage onReset={handleReset} />
                )}
              </div>
            )}

            {!loadingOffices && offices.length === 0 && selectedType && (
              <EmptyState
                title="No offices found"
                description="We couldn't find any offices matching this category. Please try selecting a different type."
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}