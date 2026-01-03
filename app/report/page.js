'use client';

import { useState } from 'react';

const districts = ['Kathmandu', 'Lalitpur', 'Bhaktapur'];
const officesByDistrict = {
  'Kathmandu': ['Ward Office', 'Land Revenue Office', 'Vehicle Registration'],
  'Lalitpur': ['Municipality Office', 'Tax Office', 'Health Department'],
  'Bhaktapur': ['District Office', 'Education Office', 'Planning Office']
};

export default function ReportPage() {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [experienceType, setExperienceType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [reportsToday, setReportsToday] = useState(0);
  
  const maxReportsPerDay = 2;

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedOffice(''); 
  };

  const handleOfficeChange = (e) => {
    setSelectedOffice(e.target.value);
  };

  const handleExperienceTypeClick = (type) => {
    setExperienceType(type);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (reportsToday >= maxReportsPerDay) {
      alert('Daily limit reached');
      return;
    }

    if (!selectedDistrict || !selectedOffice || !experienceType || description.length < 20) {
      alert('Please complete all required fields');
      return;
    }

    console.log({
      district: selectedDistrict,
      office: selectedOffice,
      type: experienceType,
      description: description,
      file: file
    });

    setReportsToday(prev => prev + 1);

    setSelectedDistrict('');
    setSelectedOffice('');
    setExperienceType('');
    setDescription('');
    setFile(null);

    alert('Report submitted anonymously. Thank you!');
  };

  const availableOffices = selectedDistrict ? officesByDistrict[selectedDistrict] || [] : [];

  const canSubmit = selectedDistrict && selectedOffice && experienceType && description.length >= 20 && reportsToday < maxReportsPerDay;

  return (
    <div>
      <h1>Submit Anonymous Report</h1>
      <p>Your identity is protected. Help identify systemic patterns.</p>

      <form onSubmit={handleSubmit}>
        
        <fieldset>
          <legend>Step 1: Select District</legend>
          <select 
            value={selectedDistrict} 
            onChange={handleDistrictChange}
            required
          >
            <option value="">Choose a district...</option>
            {districts.map(district => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset disabled={!selectedDistrict}>
          <legend>Step 2: Select Government Office</legend>
          <select 
            value={selectedOffice} 
            onChange={handleOfficeChange}
            disabled={!selectedDistrict}
            required
          >
            <option value="">
              {selectedDistrict ? 'Choose an office...' : 'Select a district first'}
            </option>
            {availableOffices.map(office => (
              <option key={office} value={office}>
                {office}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset disabled={!selectedOffice}>
          <legend>Step 3: What did you experience?</legend>
          <div>
            {['Bribe Request', 'Work Delay', 'Process Confusion'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => handleExperienceTypeClick(type)}
                disabled={!selectedOffice}
                style={{
                  backgroundColor: experienceType === type ? '#000' : '#fff',
                  color: experienceType === type ? '#fff' : '#000'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset disabled={!experienceType}>
          <legend>Step 4: Describe What Happened</legend>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            disabled={!experienceType}
            placeholder="Describe what happened. Avoid personal names."
            rows={5}
            maxLength={500}
            required
          />
          <p>
            {description.length} / 500 characters (minimum 20 required)
          </p>
        </fieldset>

        <fieldset disabled={!experienceType}>
          <legend>Evidence Upload (Optional)</legend>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={!experienceType}
            accept="image/*,.pdf"
          />
          <p>Screenshots, photos of documents (personal info will be redacted)</p>
        </fieldset>

        <fieldset>
          <legend>Daily Report Limit</legend>
          <p>Reports submitted today: {reportsToday} / {maxReportsPerDay}</p>
          <progress value={reportsToday} max={maxReportsPerDay}></progress>
        </fieldset>

        <button 
          type="submit" 
          disabled={!canSubmit}
        >
          {reportsToday >= maxReportsPerDay 
            ? 'Daily Limit Reached' 
            : 'Submit Anonymous Report'}
        </button>

        <fieldset>
          <legend>Privacy Notice</legend>
          <p>
            <strong>Your identity is never collected.</strong>
            {' '}IP addresses are securely hashed for abuse prevention only. 
            No MAC addresses, login credentials, or personal location data is stored.
          </p>
        </fieldset>

      </form>
    </div>
  );
}