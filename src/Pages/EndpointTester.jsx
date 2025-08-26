import React, { useState, useEffect } from 'react';
import curriculumTrackingService from '../services/curriculumTrackingService';
import authService from '../services/authService';

const EndpointTester = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [testData, setTestData] = useState({
    trackingId: '2',
    userId: '2',
    departmentId: '1',
    updateData: {
      proposedCurriculumName: 'Updated Curriculum Name',
      proposedCurriculumCode: 'UPD-123',
      proposedDurationSemesters: 8,
      curriculumDescription: 'Updated curriculum description for testing',
      schoolId: 1,
      departmentId: 1,
      academicLevelId: 1
    }
  });
  
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const testEndpoint = async (endpointName, testFunction, params = {}) => {
    setLoading(prev => ({ ...prev, [endpointName]: true }));
    try {
      console.log(`🧪 Testing ${endpointName} with params:`, params);
      const result = await testFunction(params);
      setResults(prev => ({ 
        ...prev, 
        [endpointName]: { 
          success: true, 
          data: result,
          timestamp: new Date().toLocaleTimeString()
        } 
      }));
      console.log(`✅ ${endpointName} test result:`, result);
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [endpointName]: { 
          success: false, 
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        } 
      }));
      console.error(`❌ ${endpointName} test failed:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [endpointName]: false }));
    }
  };

  
  const originalEndpoints = [
    {
      name: 'getAllCurricula',
      label: 'Get All Curricula',
      test: () => testEndpoint('getAllCurricula', () => curriculumTrackingService.getAllCurricula())
    },
    {
      name: 'getCurriculumById',
      label: 'Get Curriculum by ID',
      test: () => testEndpoint('getCurriculumById', () => curriculumTrackingService.getCurriculumById(testData.trackingId))
    },
    {
      name: 'getTrackingBySchool',
      label: 'Get Tracking by School (ID: 1)',
      test: () => testEndpoint('getTrackingBySchool', () => curriculumTrackingService.getTrackingBySchool(1))
    },
    {
      name: 'getTrackingByInitiator',
      label: 'Get Tracking by Initiator (ID: 15)',
      test: () => testEndpoint('getTrackingByInitiator', () => curriculumTrackingService.getTrackingByInitiator(15))
    },
    {
      name: 'getTrackingByAssignee',
      label: 'Get Tracking by Assignee (ID: 15)',
      test: () => testEndpoint('getTrackingByAssignee', () => curriculumTrackingService.getTrackingByAssignee(15))
    },
    {
      name: 'getMyInitiatedTrackings',
      label: 'Get My Initiated Trackings',
      test: () => testEndpoint('getMyInitiatedTrackings', () => curriculumTrackingService.getMyInitiatedTrackings())
    },
    {
      name: 'getMyAssignedTrackings',
      label: 'Get My Assigned Trackings',
      test: () => testEndpoint('getMyAssignedTrackings', () => curriculumTrackingService.getMyAssignedTrackings())
    },
    {
      name: 'getTrackingByStage',
      label: 'Get Tracking by Stage (ACCREDITED)',
      test: () => testEndpoint('getTrackingByStage', () => curriculumTrackingService.getTrackingByStage('ACCREDITED'))
    },
    {
      name: 'performTrackingAction',
      label: 'Perform Tracking Action (APPROVE)',
      test: () => testEndpoint('performTrackingAction', () => curriculumTrackingService.performTrackingAction({
        trackingId: testData.trackingId,
        action: 'APPROVE',
        notes: 'Test approval from endpoint tester'
      }))
    },
    {
      name: 'downloadDocument',
      label: 'Download Document (ID: 1)',
      test: () => testEndpoint('downloadDocument', () => curriculumTrackingService.downloadTrackingDocument(1))
    }
  ];

  // New endpoints
  const newEndpoints = [
    {
      name: 'updateTracking',
      label: 'Update Tracking',
      description: 'Update tracking information with new data',
      test: () => testEndpoint('updateTracking', () => curriculumTrackingService.updateTracking(testData.trackingId, testData.updateData)),
      category: 'Management'
    },
    {
      name: 'assignTracking',
      label: 'Assign Tracking to User',
      description: 'Assign tracking to a specific user',
      test: () => testEndpoint('assignTracking', () => curriculumTrackingService.assignTracking(testData.trackingId, testData.userId)),
      category: 'Management'
    },
    {
      name: 'reactivateTracking',
      label: 'Reactivate Tracking',
      description: 'Reactivate a deactivated tracking',
      test: () => testEndpoint('reactivateTracking', () => curriculumTrackingService.reactivateTracking(testData.trackingId)),
      category: 'Status'
    },
    {
      name: 'deactivateTracking',
      label: 'Deactivate Tracking',
      description: 'Deactivate an active tracking',
      test: () => testEndpoint('deactivateTracking', () => curriculumTrackingService.deactivateTracking(testData.trackingId)),
      category: 'Status'
    },
    {
      name: 'getTrackingByDepartment',
      label: 'Get Tracking by Department',
      description: 'Fetch all trackings for a specific department',
      test: () => testEndpoint('getTrackingByDepartment', () => curriculumTrackingService.getTrackingByDepartment(testData.departmentId)),
      category: 'Queries'
    }
  ];

  const allEndpoints = [...originalEndpoints, ...newEndpoints];

  const clearResults = () => {
    setResults({});
  };

  const testAllEndpoints = async () => {
    for (const endpoint of allEndpoints) {
      await endpoint.test();
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const testEndpointsByCategory = async (category) => {
    const categoryEndpoints = newEndpoints.filter(ep => ep.category === category);
    for (const endpoint of categoryEndpoints) {
      await endpoint.test();
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const handleTestDataChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateDataChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      updateData: {
        ...prev.updateData,
        [field]: value
      }
    }));
  };

  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: 'var(--tracking-bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--tracking-border)',
      margin: '1rem'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          color: 'var(--tracking-text-primary)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="fas fa-vial"></i>
          Enhanced Tracking Endpoints Tester
        </h2>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="tracking-btn tracking-btn-primary tracking-btn-sm"
            onClick={testAllEndpoints}
            disabled={Object.values(loading).some(Boolean)}
          >
            <i className="fas fa-play"></i>
            Test All Endpoints
          </button>
          <button 
            className="tracking-btn tracking-btn-outline tracking-btn-sm"
            onClick={clearResults}
          >
            <i className="fas fa-trash"></i>
            Clear Results
          </button>
        </div>
      </div>

      {/* User Info */}
      {currentUser && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--tracking-bg-secondary)',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--tracking-text-primary)' }}>
            Current User Info
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--tracking-text-secondary)' }}>
            ID: {currentUser.id} | Username: {currentUser.username} | Email: {currentUser.email}
          </p>
        </div>
      )}

      {/* Test Data Configuration */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--tracking-bg-secondary)',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--tracking-text-primary)' }}>
          Test Data Configuration
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Tracking ID
            </label>
            <input
              type="text"
              value={testData.trackingId}
              onChange={(e) => handleTestDataChange('trackingId', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid var(--tracking-border)', 
                borderRadius: '4px' 
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              User ID
            </label>
            <input
              type="text"
              value={testData.userId}
              onChange={(e) => handleTestDataChange('userId', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid var(--tracking-border)', 
                borderRadius: '4px' 
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Department ID
            </label>
            <input
              type="text"
              value={testData.departmentId}
              onChange={(e) => handleTestDataChange('departmentId', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid var(--tracking-border)', 
                borderRadius: '4px' 
              }}
            />
          </div>
        </div>

        {/* Update Data Configuration */}
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--tracking-text-primary)' }}>
            Update Data Configuration
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>
                Curriculum Name
              </label>
              <input
                type="text"
                value={testData.updateData.proposedCurriculumName}
                onChange={(e) => handleUpdateDataChange('proposedCurriculumName', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.375rem', 
                  border: '1px solid var(--tracking-border)', 
                  borderRadius: '4px',
                  fontSize: '0.8125rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>
                Curriculum Code
              </label>
              <input
                type="text"
                value={testData.updateData.proposedCurriculumCode}
                onChange={(e) => handleUpdateDataChange('proposedCurriculumCode', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.375rem', 
                  border: '1px solid var(--tracking-border)', 
                  borderRadius: '4px',
                  fontSize: '0.8125rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>
                Duration (Semesters)
              </label>
              <input
                type="number"
                value={testData.updateData.proposedDurationSemesters}
                onChange={(e) => handleUpdateDataChange('proposedDurationSemesters', parseInt(e.target.value) || 0)}
                style={{ 
                  width: '100%', 
                  padding: '0.375rem', 
                  border: '1px solid var(--tracking-border)', 
                  borderRadius: '4px',
                  fontSize: '0.8125rem'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/*  Category-based Testing */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--tracking-bg-secondary)',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--tracking-text-primary)' }}>
          Test by Category
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="tracking-btn tracking-btn-secondary tracking-btn-sm"
            onClick={() => testEndpointsByCategory('Management')}
            disabled={Object.values(loading).some(Boolean)}
          >
            <i className="fas fa-cogs"></i>
            Test Management
          </button>
          <button 
            className="tracking-btn tracking-btn-warning tracking-btn-sm"
            onClick={() => testEndpointsByCategory('Status')}
            disabled={Object.values(loading).some(Boolean)}
          >
            <i className="fas fa-toggle-on"></i>
            Test Status
          </button>
          <button 
            className="tracking-btn tracking-btn-primary tracking-btn-sm"
            onClick={() => testEndpointsByCategory('Queries')}
            disabled={Object.values(loading).some(Boolean)}
          >
            <i className="fas fa-search"></i>
            Test Queries
          </button>
        </div>
      </div>

      {/*  */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          color: 'var(--tracking-text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="fas fa-sparkles"></i>
          New Enhanced Endpoints
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem'
        }}>
          {newEndpoints.map(endpoint => (
            <div key={endpoint.name} style={{
              padding: '1.25rem',
              backgroundColor: 'var(--tracking-bg-card)',
              borderRadius: '8px',
              border: '2px solid var(--tracking-border)',
              borderLeftColor: endpoint.category === 'Management' ? 'var(--tracking-primary)' :
                              endpoint.category === 'Status' ? 'var(--tracking-warning)' :
                              'var(--tracking-secondary)'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <h4 style={{ 
                  margin: '0 0 0.25rem 0',
                  color: 'var(--tracking-text-primary)',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {endpoint.label}
                  <span className="tracking-badge tracking-badge-neutral" style={{ fontSize: '0.6875rem' }}>
                    {endpoint.category}
                  </span>
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.8125rem', 
                  color: 'var(--tracking-text-secondary)',
                  lineHeight: 1.4
                }}>
                  {endpoint.description}
                </p>
              </div>
              
              <button
                className="tracking-btn tracking-btn-primary tracking-btn-sm"
                onClick={endpoint.test}
                disabled={loading[endpoint.name]}
                style={{ width: '100%', marginBottom: '0.75rem' }}
              >
                {loading[endpoint.name] ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Testing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play"></i>
                    Test Endpoint
                  </>
                )}
              </button>

              {results[endpoint.name] && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  backgroundColor: results[endpoint.name].success 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                  border: results[endpoint.name].success 
                    ? '1px solid rgba(16, 185, 129, 0.2)'
                    : '1px solid rgba(239, 68, 68, 0.2)',
                  color: results[endpoint.name].success 
                    ? 'var(--tracking-success)'
                    : 'var(--tracking-danger)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <i className={results[endpoint.name].success ? 'fas fa-check-circle' : 'fas fa-times-circle'}></i>
                    <strong>
                      {results[endpoint.name].success ? 'Success' : 'Error'}
                    </strong>
                    <span style={{ 
                      marginLeft: 'auto', 
                      fontSize: '0.75rem',
                      opacity: 0.8
                    }}>
                      {results[endpoint.name].timestamp}
                    </span>
                  </div>
                  
                  {results[endpoint.name].success ? (
                    <div>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <strong>Message:</strong> {results[endpoint.name].data.message}
                      </div>
                      <div>
                        <strong>Data:</strong> {
                          results[endpoint.name].data.data ? 
                            (Array.isArray(results[endpoint.name].data.data) ? 
                              `${results[endpoint.name].data.data.length} items` : 
                              'Object returned'
                            ) : 
                            'No data'
                        }
                      </div>
                    </div>
                  ) : (
                    <div>
                      <strong>Error:</strong> {results[endpoint.name].error}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          color: 'var(--tracking-text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="fas fa-list"></i>
          Original Endpoints
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {originalEndpoints.map(endpoint => (
            <div key={endpoint.name} style={{
              padding: '1.25rem',
              backgroundColor: 'var(--tracking-bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--tracking-border)'
            }}>
              <h4 style={{ 
                margin: '0 0 1rem 0',
                color: 'var(--tracking-text-primary)',
                fontSize: '1rem'
              }}>
                {endpoint.label}
              </h4>
              
              <button
                className="tracking-btn tracking-btn-outline tracking-btn-sm"
                onClick={endpoint.test}
                disabled={loading[endpoint.name]}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {loading[endpoint.name] ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Testing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play"></i>
                    Test Endpoint
                  </>
                )}
              </button>

              {results[endpoint.name] && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  backgroundColor: results[endpoint.name].success 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                  border: results[endpoint.name].success 
                    ? '1px solid rgba(16, 185, 129, 0.2)'
                    : '1px solid rgba(239, 68, 68, 0.2)',
                  color: results[endpoint.name].success 
                    ? 'var(--tracking-success)'
                    : 'var(--tracking-danger)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <i className={results[endpoint.name].success ? 'fas fa-check-circle' : 'fas fa-times-circle'}></i>
                    <strong>
                      {results[endpoint.name].success ? 'Success' : 'Error'}
                    </strong>
                    <span style={{ 
                      marginLeft: 'auto', 
                      fontSize: '0.75rem',
                      opacity: 0.8
                    }}>
                      {results[endpoint.name].timestamp}
                    </span>
                  </div>
                  
                  {results[endpoint.name].success ? (
                    <div>
                      <div>
                        <strong>Message:</strong> {results[endpoint.name].data.message}
                      </div>
                      <div>
                        <strong>Data Count:</strong> {
                          Array.isArray(results[endpoint.name].data.data) 
                            ? results[endpoint.name].data.data.length 
                            : results[endpoint.name].data.data ? 'Object' : 'No data'
                        }
                      </div>
                    </div>
                  ) : (
                    <div>
                      <strong>Error:</strong> {results[endpoint.name].error}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      {Object.keys(results).length > 0 && (
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--tracking-bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--tracking-border)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--tracking-text-primary)' }}>
            Test Results Summary
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--tracking-success)' }}>
                {Object.values(results).filter(r => r.success).length}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--tracking-text-secondary)' }}>
                Successful
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--tracking-danger)' }}>
                {Object.values(results).filter(r => !r.success).length}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--tracking-text-secondary)' }}>
                Failed
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--tracking-primary)' }}>
                {newEndpoints.filter(ep => results[ep.name]?.success).length}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--tracking-text-secondary)' }}>
                New Working
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--tracking-text-primary)' }}>
                {Object.keys(results).length}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--tracking-text-secondary)' }}>
                Total Tested
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--tracking-text-primary)' }}>
              Detailed Results:
            </h4>
            <pre style={{
              backgroundColor: 'var(--tracking-bg-card)',
              padding: '1rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: 'var(--tracking-text-primary)',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndpointTester;