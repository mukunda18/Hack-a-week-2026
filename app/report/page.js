'use client';

import { useState } from 'react';

const districts = ['Kathmandu', 'Lalitpur', 'Bhaktapur'];
const officesByDistrict = {
  'Kathmandu': ['Ward Office', 'Land Revenue Office', 'Vehicle Registration'],
  'Lalitpur': ['Municipality Office', 'Tax Office', 'Health Department'],
  'Bhaktapur': ['District Office', 'Education Office', 'Planning Office']
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '24px',
    marginBottom: '10px'
  },
  fieldset: {
    border: '1px solid #ddd',
    padding: '20px',
    marginBottom: '20px',
    borderRadius: '4px'
  },
  legend: {
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '0 10px'
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    marginTop: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
    flexWrap: 'wrap'
  },
  typeButton: {
    padding: '10px 20px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#fff'
  },
  typeButtonActive: {
    padding: '10px 20px',
    border: '1px solid #000',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#000',
    color: '#fff'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    marginTop: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: 'Arial, sans-serif'
  },
  submitButton: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  submitButtonDisabled: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    backgroundColor: '#ccc',
    color: '#666',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed'
  },
  charCount: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px'
  },
  progressBar: {
    width: '100%',
    height: '20px',
    marginTop: '10px'
  }
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
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Submit Anonymous Report</h1>
        <p>Your identity is protected. Help identify systemic patterns.</p>
      </div>

      <form onSubmit={handleSubmit}>
        
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Select District</legend>
          <select 
            value={selectedDistrict} 
            onChange={handleDistrictChange}
            style={styles.input}
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

        <fieldset style={styles.fieldset} disabled={!selectedDistrict}>
          <legend style={styles.legend}> Select Government Office</legend>
          <select 
            value={selectedOffice} 
            onChange={handleOfficeChange}
            disabled={!selectedDistrict}
            style={styles.input}
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

        <fieldset style={styles.fieldset} disabled={!selectedOffice}>
          <legend style={styles.legend}> What did you experience?</legend>
          <div style={styles.buttonGroup}>
            {['Bribe Request', 'Work Delay'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => handleExperienceTypeClick(type)}
                disabled={!selectedOffice}
                style={experienceType === type ? styles.typeButtonActive : styles.typeButton}
              >
                {type}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset style={styles.fieldset} disabled={!experienceType}>
          <legend style={styles.legend}>Step 4: Describe What Happened</legend>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            disabled={!experienceType}
            placeholder="Describe what happened. Avoid personal names."
            rows={5}
            maxLength={500}
            style={styles.textarea}
            required
          />
          <div style={styles.charCount}>
            {description.length} / 500 characters (minimum 20 required)
          </div>
        </fieldset>

        <fieldset style={styles.fieldset} disabled={!experienceType}>
          <legend style={styles.legend}>Evidence Upload (Optional)</legend>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={!experienceType}
            accept="image/*,.pdf"
            style={styles.input}
          />
          <p style={styles.charCount}>Screenshots, photos of documents (personal info will be redacted)</p>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Daily Report Limit</legend>
          <p>Reports submitted today: {reportsToday} / {maxReportsPerDay}</p>
          <progress 
            value={reportsToday} 
            max={maxReportsPerDay}
            style={styles.progressBar}
          ></progress>
        </fieldset>

        <button 
          type="submit" 
          disabled={!canSubmit}
          style={canSubmit ? styles.submitButton : styles.submitButtonDisabled}
        >
          {reportsToday >= maxReportsPerDay 
            ? 'Daily Limit Reached' 
            : 'Submit Anonymous Report'}
        </button>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Privacy Notice</legend>
          <p style={{fontSize: '14px', lineHeight: '1.5'}}>
            <strong>Your identity is never collected.</strong>
            {' '}IP addresses are securely hashed for abuse prevention only. 
            No MAC addresses, login credentials, or personal location data is stored.
          </p>
        </fieldset>

      </form>
    </div>
  );
}