import React from 'react';

const CurriculumDebugger = ({ curriculum }) => {
  if (!curriculum) {
    return (
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#fee', 
        border: '1px solid #f00', 
        borderRadius: '8px',
        margin: '1rem'
      }}>
        <h3>🚨 No Curriculum Data Found</h3>
        <p>No curriculum object passed to debugger</p>
      </div>
    );
  }

  const checkField = (field, value) => {
    return {
      field,
      value: value || 'NOT FOUND',
      exists: !!value,
      type: typeof value
    };
  };

  const fieldsToCheck = [
    'initiatedByName',
    'initiatedByEmail', 
    'currentAssigneeName',
    'currentAssigneeEmail',
    'displayCurriculumName',
    'currentStageDisplayName',
    'statusDisplayName',
    'trackingId',
    'proposedCurriculumCode',
    'proposedDurationSemesters'
  ];

  const fieldResults = fieldsToCheck.map(field => 
    checkField(field, curriculum[field])
  );

  const missingFields = fieldResults.filter(result => !result.exists);
  const presentFields = fieldResults.filter(result => result.exists);

  return (
    <div style={{ 
      padding: '1rem', 
      backgroundColor: '#f9f9f9', 
      border: '2px solid #333', 
      borderRadius: '8px',
      margin: '1rem',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h3 style={{ color: '#333', marginTop: 0 }}>🔍 Curriculum Data Debug Report</h3>
      
      {/* Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem', 
        marginBottom: '1rem' 
      }}>
        <div style={{ 
          padding: '0.5rem', 
          backgroundColor: presentFields.length > 0 ? '#dfd' : '#fdd',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <strong>✅ Found: {presentFields.length}</strong>
        </div>
        <div style={{ 
          padding: '0.5rem', 
          backgroundColor: missingFields.length > 0 ? '#fdd' : '#dfd',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <strong>❌ Missing: {missingFields.length}</strong>
        </div>
        <div style={{ 
          padding: '0.5rem', 
          backgroundColor: '#ddf',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <strong>📊 Total: {fieldsToCheck.length}</strong>
        </div>
      </div>

      {/* Present Fields */}
      {presentFields.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: '#0a0', margin: '0 0 0.5rem 0' }}>✅ Fields Found in Frontend:</h4>
          <div style={{ backgroundColor: '#dfd', padding: '0.5rem', borderRadius: '4px' }}>
            {presentFields.map(result => (
              <div key={result.field} style={{ 
                marginBottom: '0.25rem',
                padding: '0.25rem',
                backgroundColor: '#fff',
                borderRadius: '2px'
              }}>
                <strong>{result.field}:</strong> "{result.value}" 
                <span style={{ color: '#666', fontSize: '10px' }}> ({result.type})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: '#a00', margin: '0 0 0.5rem 0' }}>❌ Missing Fields:</h4>
          <div style={{ backgroundColor: '#fdd', padding: '0.5rem', borderRadius: '4px' }}>
            {missingFields.map(result => (
              <div key={result.field} style={{ 
                marginBottom: '0.25rem',
                padding: '0.25rem',
                backgroundColor: '#fff',
                borderRadius: '2px'
              }}>
                <strong>{result.field}:</strong> {result.value}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw API Data Check */}
      {curriculum._rawApiData && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: '#00a', margin: '0 0 0.5rem 0' }}>🔧 Raw API Data Check:</h4>
          <div style={{ backgroundColor: '#ddf', padding: '0.5rem', borderRadius: '4px' }}>
            {fieldsToCheck.map(field => {
              const apiValue = curriculum._rawApiData[field];
              const frontendValue = curriculum[field];
              const isProperlyMapped = apiValue === frontendValue;
              
              return (
                <div key={field} style={{ 
                  marginBottom: '0.25rem',
                  padding: '0.25rem',
                  backgroundColor: isProperlyMapped ? '#dfd' : '#ffd',
                  borderRadius: '2px',
                  fontSize: '10px'
                }}>
                  <strong>{field}:</strong>
                  <br />
                  API: "{apiValue || 'NOT IN API'}"
                  <br />
                  Frontend: "{frontendValue || 'NOT MAPPED'}"
                  <br />
                  Status: {isProperlyMapped ? '✅ MAPPED' : '❌ MAPPING ISSUE'}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#eee', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>🛠️ Debug Actions:</h4>
        <button 
          onClick={() => {
            console.log('🔍 Full Curriculum Object:', curriculum);
            console.log('🔍 Raw API Data:', curriculum._rawApiData);
            window.debugTrackingMappings && window.debugTrackingMappings(curriculum);
          }}
          style={{ 
            padding: '0.25rem 0.5rem', 
            marginRight: '0.5rem',
            backgroundColor: '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          📋 Log to Console
        </button>
        
        <button 
          onClick={() => {
            const data = JSON.stringify(curriculum, null, 2);
            navigator.clipboard.writeText(data);
            alert('Curriculum data copied to clipboard!');
          }}
          style={{ 
            padding: '0.25rem 0.5rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          📄 Copy Data
        </button>
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '0.5rem', 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '4px',
        fontSize: '10px'
      }}>
        <strong>📝 Instructions:</strong>
        <br />1. If email fields show "NOT FOUND" → Check if API is returning them
        <br />2. If "NOT MAPPED" → Check transformation in CurriculumTrackingService
        <br />3. Click "Log to Console" and check browser console for detailed info
        <br />4. Use "Copy Data" to share the curriculum object for debugging
      </div>
    </div>
  );
};

export default CurriculumDebugger;