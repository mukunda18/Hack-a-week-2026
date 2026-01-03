'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ReportPage() {
  const [offices, setOffices] = useState([]);
  const [officeTypes, setOfficeTypes] = useState([]);

  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const [loadingOffices, setLoadingOffices] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [bribeAmount, setBribeAmount] = useState('');
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
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchOffices = async () => {
      if (!selectedType) return;
      setLoadingOffices(true);
      try {
        const response = await axios.get(`/api/getOffices/${selectedType}`);
        setOffices(response.data);

        if (selectedOffice && !response.data.find(o => o.id === parseInt(selectedOffice))) {
          setSelectedOffice('');
        }
      } catch (error) {
        console.error('Error fetching offices:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOffice || !bribeAmount) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      await axios.post('/api/postReport', {
        officeId: selectedOffice,
        bribeAmount: bribeAmount
      });
      setSuccess(true);
      setBribeAmount('');
    } catch (err) {
      console.error('Error submitting report:', err);
      setErrorMsg('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div>
        <div>
          <div>
            <h1>Report an Incident</h1>
            <p>Select the government office where the incident occurred.</p>
          </div>

          <div>
            {/* Filter Section */}
            <div>

              <div>
                <label>
                  Office Type
                </label>
                <select
                  value={selectedType}
                  onChange={handleTypeChange}
                  disabled={loadingTypes}
                >
                  <option value="">All Office Types</option>
                  {officeTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Office Selection */}
            <div>
              <label>
                Specific Office
              </label>
              <div>
                <select
                  value={selectedOffice}
                  onChange={handleOfficeChange}
                  disabled={loadingOffices}
                >
                  <option value="">
                    {loadingOffices ? 'Updating offices...' : 'Choose an office...'}
                  </option>
                  {offices.map(office => (
                    <option key={office.id} value={office.id}>
                      {office.name} {office.district ? `— ${office.district}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedOffice && (
              <div>
                <div>
                  <div>
                    <h3>Office Confirmed</h3>
                    <p>
                      You have selected <span>{offices.find(o => o.id === parseInt(selectedOffice))?.name}</span>.
                    </p>
                  </div>
                </div>

                {!success ? (
                  <form onSubmit={handleSubmit}>
                    <h4>Report Details</h4>

                    <div>
                      <label>Bribe Amount asked (NPR)</label>
                      <input
                        type="number"
                        value={bribeAmount}
                        onChange={handleBribeAmountChange}
                        placeholder="e.g. 5000"
                        required
                      />
                    </div>

                    {errorMsg && (
                      <div>
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting Report...' : 'Submit Report'}
                    </button>
                  </form>
                ) : (
                  <div>
                    <div>
                      <p>Report submitted successfully! Thank you for your contribution.</p>
                    </div>
                    <button
                      onClick={() => {
                        setSuccess(false);
                        setSelectedOffice('');
                        setSelectedType('');
                      }}
                    >
                      Submit another report
                    </button>
                  </div>
                )}
              </div>
            )}

            {!loadingOffices && offices.length === 0 && selectedType && (
              <div>
                <p>No offices found for these filters.</p>
                <button
                  onClick={() => {
                    setSelectedType('');
                    setSelectedOffice('');
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
