import React, { useState, useEffect, useCallback } from 'react';
import TrackingHeader from '../../../components/Admin/CurriculaTracking/TrackingHeader/TrackingHeader';
import TrackingStats from '../../../components/Admin/CurriculaTracking/TrackingStats/TrackingStats';
import TrackingFilters from '../../../components/Admin/CurriculaTracking/TrackingFilters/TrackingFilters';
import CurriculumWorkflow from '../../../components/Admin/CurriculaTracking/CurriculumWorkflow/CurriculumWorkflow';
import TrackingTable from '../../../components/Admin/CurriculaTracking/TrackingTable/TrackingTable';
import StageDetailsModal from '../../../components/Admin/CurriculaTracking/StageDetailsModal/StageDetailsModal';
import DocumentUploadModal from '../../../components/Admin/CurriculaTracking/DocumentUploadModal/DocumentUploadModal';
import NotesModal from '../../../components/Admin/CurriculaTracking/NotesModal/NotesModal';
import NotificationBanner from '../../../components/Admin/AdminAllCurricula/NotificationBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EndpointTester from '../../EndpointTester';

import { 
  EditTrackingModal, 
  AssignTrackingModal, 
  TrackingStatusModal 
} from '../../../components/Admin/CurriculaTracking/EnhancedModals/EnhancedModals';

import curriculumTrackingService from '../../../services/curriculumTrackingService';
import authService from '../../../services/authService';
import './CurriculumTrackingPage.css';

const CurriculumTrackingPage = () => {
  
  const [curricula, setCurricula] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('workflow'); 
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  
 
  const [filters, setFilters] = useState({
    search: '',
    school: '',
    department: '',
    stage: '',
    status: '',
    filterType: 'bySchool' 
  });

  const [schoolId, setSchoolId] = useState(1); 
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [modals, setModals] = useState({
    stageDetails: false,
    documentUpload: false,
    notes: false,
    editTracking: false,
    assignTracking: false,
    trackingStatus: false
  });

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Document state
  const [documentOperations, setDocumentOperations] = useState({
    uploading: false,
    downloading: false,
    error: null
  });

  // Initialize user data
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUserId(user.id);
      console.log('🔍 [Tracking Page] Current user ID:', user.id);
    }
  }, []);

  
  const loadCurriculaData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('🔄 [Tracking Page] Loading curricula with filter type:', filters.filterType);
      console.log('🔍 [Tracking Page] Filter state:', filters);
      console.log('🔍 [Tracking Page] School ID:', schoolId);
      console.log('🔍 [Tracking Page] User ID:', currentUserId);
      
      let result = null;
      let fallbackAttempted = false;
      
      try {
        switch (filters.filterType) {
          case 'myInitiated':
            console.log('📞 [API Call] getMyInitiatedTrackings');
            result = await curriculumTrackingService.getMyInitiatedTrackings();
            break;
            
          case 'myAssigned':
            console.log('📞 [API Call] getMyAssignedTrackings');
            result = await curriculumTrackingService.getMyAssignedTrackings();
            break;
            
          case 'bySchool':
            if (schoolId) {
              console.log('📞 [API Call] getTrackingBySchool with ID:', schoolId);
              result = await curriculumTrackingService.getTrackingBySchool(schoolId);
            } else {
              console.log('📞 [API Call] getAllCurricula (fallback for bySchool)');
              result = await curriculumTrackingService.getAllCurricula();
            }
            break;

          case 'byDepartment':
            if (filters.department) {
              console.log('📞 [API Call] getTrackingByDepartment with ID:', filters.department);
              result = await curriculumTrackingService.getTrackingByDepartment(filters.department);
            } else {
              console.log('📞 [API Call] getAllCurricula (fallback for byDepartment)');
              result = await curriculumTrackingService.getAllCurricula();
            }
            break;
            
          case 'byInitiator':
            if (currentUserId) {
              console.log('📞 [API Call] getTrackingByInitiator with ID:', currentUserId);
              result = await curriculumTrackingService.getTrackingByInitiator(currentUserId);
            } else {
              console.log('📞 [API Call] getAllCurricula (fallback for byInitiator)');
              result = await curriculumTrackingService.getAllCurricula();
            }
            break;
            
          case 'byAssignee':
            if (currentUserId) {
              console.log('📞 [API Call] getTrackingByAssignee with ID:', currentUserId);
              result = await curriculumTrackingService.getTrackingByAssignee(currentUserId);
            } else {
              console.log('📞 [API Call] getAllCurricula (fallback for byAssignee)');
              result = await curriculumTrackingService.getAllCurricula();
            }
            break;
            
          case 'byStage':
            if (filters.stage) {
              const stageMapping = {
                'initiation': 'IDEATION',
                'school_board': 'SCHOOL_BOARD_REVIEW',
                'dean_committee': 'DEAN_COMMITTEE_REVIEW',
                'senate': 'SENATE_REVIEW',
                'qa_review': 'QA_REVIEW',
                'vice_chancellor': 'VICE_CHANCELLOR_APPROVAL',
                'cue_review': 'CUE_REVIEW',
                'site_inspection': 'ACCREDITED'
              };
              
              const backendStage = stageMapping[filters.stage] || filters.stage;
              console.log('📞 [API Call] getTrackingByStage with stage:', backendStage);
              result = await curriculumTrackingService.getTrackingByStage(backendStage);
            } else {
              console.log('📞 [API Call] getAllCurricula (fallback for byStage)');
              result = await curriculumTrackingService.getAllCurricula();
            }
            break;
            
          default:
            console.log('📞 [API Call] getAllCurricula (default case)');
            result = await curriculumTrackingService.getAllCurricula();
            break;
        }
      } catch (primaryError) {
        console.warn('⚠️ [Tracking Page] Primary API call failed:', primaryError.message);
        fallbackAttempted = true;
        
        
        const fallbackStrategies = [
          () => curriculumTrackingService.getTrackingBySchool(1),
          () => curriculumTrackingService.getTrackingByInitiator(15),
          () => curriculumTrackingService.getTrackingByAssignee(15),
          () => curriculumTrackingService.getAllCurricula()
        ];
        
        for (let i = 0; i < fallbackStrategies.length; i++) {
          try {
            console.log(`🔄 [Tracking Page] Attempting fallback strategy ${i + 1}...`);
            result = await fallbackStrategies[i]();
            if (result && result.success && result.data && result.data.length > 0) {
              console.log(`✅ [Tracking Page] Fallback strategy ${i + 1} succeeded with ${result.data.length} items`);
              break;
            }
          } catch (fallbackError) {
            console.warn(`❌ [Tracking Page] Fallback strategy ${i + 1} failed:`, fallbackError.message);
            continue;
          }
        }
      }

      
      console.log('📋 [Tracking Page] API Result:', {
        success: result?.success,
        dataType: Array.isArray(result?.data) ? 'array' : typeof result?.data,
        dataLength: Array.isArray(result?.data) ? result.data.length : 0,
        message: result?.message,
        fallbackUsed: fallbackAttempted
      });

      if (result && result.success) {
       
        let transformedData = [];
        
        if (Array.isArray(result.data) && result.data.length > 0) {
          console.log('🔄 [Tracking Page] Transforming API data...');
          console.log('📋 [Tracking Page] Sample raw data:', JSON.stringify(result.data[0], null, 2));
          
          transformedData = curriculumTrackingService.transformApiDataArray(result.data);
          
          console.log('✅ [Tracking Page] Data transformation completed');
          console.log('📋 [Tracking Page] Sample transformed data:', JSON.stringify(transformedData[0], null, 2));
        } else if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
          // Handle single object response
          console.log('🔄 [Tracking Page] Single object response, wrapping in array...');
          const singleTransformed = curriculumTrackingService.transformApiData(result.data);
          if (singleTransformed) {
            transformedData = [singleTransformed];
          }
        }
        
        setCurricula(transformedData);
        
        const successMessage = fallbackAttempted 
          ? `${transformedData.length} curricula loaded using fallback strategy`
          : result.message || `${transformedData.length} ${filters.filterType} curricula loaded successfully`;
        
        showNotification(successMessage, fallbackAttempted ? 'warning' : 'success');
        
        // Auto-select first curriculum if none selected
        if (transformedData.length > 0 && !selectedCurriculum) {
          setSelectedCurriculum(transformedData[0]);
        }
      } else {
        console.error('❌ [Tracking Page] Failed to load curricula:', result?.error);
        setCurricula([]);
        
        const errorMessage = result?.error || 'Failed to load curriculum tracking data';
        showNotification(errorMessage, 'error');
        
        
        if (!fallbackAttempted) {
          console.log('🔄 [Tracking Page] Attempting final fallback...');
          try {
            // Try loading from a known working endpoint
            const fallbackResult = await curriculumTrackingService.getTrackingBySchool(1);
            if (fallbackResult.success && fallbackResult.data?.length > 0) {
              const fallbackTransformed = curriculumTrackingService.transformApiDataArray(fallbackResult.data);
              setCurricula(fallbackTransformed);
              showNotification(`Loaded ${fallbackTransformed.length} curricula from school data`, 'info');
            }
          } catch (finalError) {
            console.error('❌ [Tracking Page] Final fallback failed:', finalError);
          }
        }
      }
    } catch (error) {
      console.error('❌ [Tracking Page] Critical error loading tracking data:', error);
      setCurricula([]);
      showNotification('Critical error loading tracking data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters.filterType, schoolId, currentUserId, filters.stage, filters.department]);

  
  useEffect(() => {
    loadCurriculaData();
  }, [loadCurriculaData]);

  // Utility functions
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  const openModal = useCallback((modalName, curriculum = null) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    if (curriculum) setSelectedCurriculum(curriculum);
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    if (modalName === 'documentUpload') {
      // Reset document operations state when closing upload modal
      setDocumentOperations({
        uploading: false,
        downloading: false,
        error: null
      });
    }
    
  }, []);

  // Filter functions
  const handleFilterChange = useCallback((filterName, value) => {
    console.log('🔄 [Tracking Page] Filter change:', filterName, '=', value);
    
    setFilters(prev => ({ ...prev, [filterName]: value }));
    
    if (filterName === 'filterType') {
      setFilters(prev => ({
        ...prev,
        search: '',
        school: '',
        department: '',
        stage: '',
        status: '',
        [filterName]: value
      }));
      
      // Set appropriate defaults for different filter types
      if (value === 'bySchool' && !schoolId) {
        setSchoolId(1); 
      }
    }
  }, [schoolId]);

  const clearFilters = useCallback(() => {
    console.log('🔄 [Tracking Page] Clearing all filters');
    setFilters({
      search: '',
      school: '',
      department: '',
      stage: '',
      status: '',
      filterType: 'bySchool' 
    });
    setSchoolId(1); 
  }, []);

  const handleSchoolSelection = useCallback((selectedSchoolId) => {
    console.log('🔄 [Tracking Page] School selection:', selectedSchoolId);
    setSchoolId(selectedSchoolId);
    setFilters(prev => ({ ...prev, filterType: 'bySchool' }));
  }, []);

  // Get filtered curricula
  const filteredCurricula = curricula.filter(curriculum => {
    const matchesSearch = !filters.search || 
      curriculum.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      curriculum.trackingId?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesSchool = !filters.school || curriculum.school === filters.school;
    const matchesDepartment = !filters.department || curriculum.department === filters.department;
    const matchesStage = !filters.stage || curriculum.currentStage === filters.stage;
    const matchesStatus = !filters.status || curriculum.status === filters.status;

    return matchesSearch && matchesSchool && matchesDepartment && matchesStage && matchesStatus;
  });

  // Get unique values for filters
  const getUniqueValues = (field) => {
    return [...new Set(curricula.map(c => c[field]))].filter(Boolean);
  };

  // Calculate stats
  const stats = {
    total: curricula.length,
    inProgress: curricula.filter(c => ['under_review', 'pending_approval'].includes(c.status)).length,
    onHold: curricula.filter(c => c.status === 'on_hold').length,
    completed: curricula.filter(c => c.status === 'completed').length,
    overdue: curricula.filter(c => {
      if (!c.estimatedCompletion) return false;
      const estimatedDate = new Date(c.estimatedCompletion);
      return estimatedDate < new Date() && c.status !== 'completed';
    }).length
  };

  // Handle stage actions
  const handleStageAction = useCallback(async (curriculumId, stage, action, data = {}) => {
    try {
      setIsLoading(true);
      console.log('🔄 [Tracking Page] Performing stage action:', { curriculumId, stage, action, data });
      
      const curriculum = curricula.find(c => c.id === curriculumId);
      if (!curriculum) {
        throw new Error('Curriculum not found');
      }

      const actionMapping = {
        'approve': 'APPROVE',
        'reject': 'REJECT',
        'hold': 'HOLD',
        'resume': 'APPROVE',
        'add_notes': 'ADD_NOTES',
        'upload_documents': 'UPLOAD_DOCUMENTS'
      };

      const backendAction = actionMapping[action] || action.toUpperCase();
      
      const actionData = {
        trackingId: curriculum.trackingId || curriculum.id,
        action: backendAction,
        notes: data.feedback || data.notes || '',
        documents: data.documents || []
      };

      const result = await curriculumTrackingService.performTrackingAction(actionData);
      
      if (result.success) {
        setCurricula(prev => prev.map(c => {
          if (c.id === curriculumId) {
            const updatedCurriculum = curriculumTrackingService.transformApiData(result.data);
            return updatedCurriculum || c;
          }
          return c;
        }));
        
        showNotification(
          result.message || `Stage ${action} completed successfully`, 
          'success'
        );

        // Refresh data to get latest state
        await loadCurriculaData();
      } else {
        throw new Error(result.error || `Failed to ${action} stage`);
      }
    } catch (error) {
      console.error('❌ [Tracking Page] Error updating stage:', error);
      showNotification(error.message || `Failed to ${action} stage`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [curricula, loadCurriculaData]);

  
  const handleUpdateTracking = useCallback(async (trackingId, updateData) => {
    try {
      setIsLoading(true);
      console.log('🔄 [Tracking Page] Updating tracking:', trackingId);
      
      const result = await curriculumTrackingService.updateTracking(trackingId, updateData);
      
      if (result.success) {
        setCurricula(prev => prev.map(c => {
          if (c.id === trackingId) {
            const updatedCurriculum = curriculumTrackingService.transformApiData(result.data);
            return updatedCurriculum || c;
          }
          return c;
        }));
        
        showNotification(result.message || 'Tracking updated successfully', 'success');
        await loadCurriculaData();
      } else {
        throw new Error(result.error || 'Failed to update tracking');
      }
    } catch (error) {
      console.error('❌ [Tracking Page] Error updating tracking:', error);
      showNotification(error.message || 'Failed to update tracking', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [loadCurriculaData]);

  // Handle tracking assignment
  const handleAssignTracking = useCallback(async (trackingId, userId) => {
    try {
      setIsLoading(true);
      console.log('🔄 [Tracking Page] Assigning tracking:', trackingId, 'to user:', userId);
      
      const result = await curriculumTrackingService.assignTracking(trackingId, userId);
      
      if (result.success) {
        setCurricula(prev => prev.map(c => {
          if (c.id === trackingId) {
            const updatedCurriculum = curriculumTrackingService.transformApiData(result.data);
            return updatedCurriculum || c;
          }
          return c;
        }));
        
        showNotification(result.message || 'Tracking assigned successfully', 'success');
      } else {
        throw new Error(result.error || 'Failed to assign tracking');
      }
    } catch (error) {
      console.error('❌ [Tracking Page] Error assigning tracking:', error);
      showNotification(error.message || 'Failed to assign tracking', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle tracking status change
  const handleTrackingStatusChange = useCallback(async (trackingId, action) => {
    try {
      setIsLoading(true);
      console.log('🔄 [Tracking Page] Changing tracking status:', trackingId, action);
      
      let result;
      if (action === 'reactivate') {
        result = await curriculumTrackingService.reactivateTracking(trackingId);
      } else if (action === 'deactivate') {
        result = await curriculumTrackingService.deactivateTracking(trackingId);
      }
      
      if (result.success) {
        if (action === 'deactivate' && !result.data) {
          setCurricula(prev => prev.filter(c => c.id !== trackingId));
          showNotification(result.message || 'Tracking deactivated successfully', 'success');
        } else {
          setCurricula(prev => prev.map(c => {
            if (c.id === trackingId) {
              const updatedCurriculum = curriculumTrackingService.transformApiData(result.data);
              return updatedCurriculum || c;
            }
            return c;
          }));
          
          showNotification(result.message || `Tracking ${action}d successfully`, 'success');
        }
        
        await loadCurriculaData();
      } else {
        throw new Error(result.error || `Failed to ${action} tracking`);
      }
    } catch (error) {
      console.error('❌ [Tracking Page] Error changing tracking status:', error);
      showNotification(error.message || `Failed to ${action} tracking`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [loadCurriculaData]);

  //  document upload handler
  const handleDocumentUpload = useCallback(async (uploadedDocuments) => {
    try {
      console.log('📤 [Tracking Page] Documents uploaded successfully:', uploadedDocuments);
      
      showNotification(
        `Successfully uploaded ${uploadedDocuments.length} document${uploadedDocuments.length !== 1 ? 's' : ''}`,
        'success'
      );
      
      // Refresh the curricula data to reflect any changes
      await loadCurriculaData();
      
    } catch (error) {
      console.error('❌ [Tracking Page] Error handling document upload:', error);
      showNotification('Document upload completed but there was an error refreshing data', 'warning');
    }
  }, [loadCurriculaData]);

  //  document download handler
  const handleDocumentDownload = useCallback(async (documentId, documentName) => {
    try {
      setDocumentOperations(prev => ({ ...prev, downloading: true, error: null }));
      console.log('🔄 [Tracking Page] Downloading document:', documentId);
      
      await curriculumTrackingService.downloadDocumentToFile(documentId, documentName);
      
      showNotification(`Document "${documentName}" downloaded successfully`, 'success');
      
    } catch (error) {
      console.error('❌ [Tracking Page] Error downloading document:', error);
      setDocumentOperations(prev => ({ ...prev, error: error.message }));
      showNotification(error.message || 'Failed to download document', 'error');
    } finally {
      setDocumentOperations(prev => ({ ...prev, downloading: false }));
    }
  }, []);

 
  const filterTypes = [
    { value: 'bySchool', label: 'By School', icon: 'fas fa-university' },
    { value: 'byInitiator', label: 'By Initiator', icon: 'fas fa-user-plus' },
    { value: 'byAssignee', label: 'By Assignee', icon: 'fas fa-user-check' },
    { value: 'myInitiated', label: 'My Initiated', icon: 'fas fa-user-plus' },
    { value: 'myAssigned', label: 'My Assignments', icon: 'fas fa-user-check' },
    { value: 'byStage', label: 'By Stage', icon: 'fas fa-layer-group' },
    { value: 'byDepartment', label: 'By Department', icon: 'fas fa-building' },
    { value: 'all', label: 'All Curricula', icon: 'fas fa-list' }
  ];

  if (isLoading && curricula.length === 0) {
    return (
      <div className="dashboard-main-content">
        <div className="tracking-page">
          <LoadingSpinner 
            message="Loading curriculum tracking data..." 
            subtext="Please wait while we fetch the latest tracking information"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main-content">
      <div className="tracking-page">
        {/* Notification Banner */}
        <NotificationBanner 
          notification={notification}
          onClose={() => setNotification({ show: false, message: '', type: '' })}
        />

        {/* Document Operations Status */}
        {documentOperations.uploading && (
          <div className="tracking-card" style={{ 
            marginBottom: '1rem', 
            backgroundColor: '#f0f9ff',
            borderLeft: '4px solid #0ea5e9' 
          }}>
            <div className="tracking-card-body" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fas fa-spinner fa-spin" style={{ color: '#0ea5e9' }}></i>
                <span>Uploading documents...</span>
              </div>
            </div>
          </div>
        )}

        {documentOperations.downloading && (
          <div className="tracking-card" style={{ 
            marginBottom: '1rem', 
            backgroundColor: '#f0fdf4',
            borderLeft: '4px solid #22c55e' 
          }}>
            <div className="tracking-card-body" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fas fa-spinner fa-spin" style={{ color: '#22c55e' }}></i>
                <span>Downloading document...</span>
              </div>
            </div>
          </div>
        )}

        {documentOperations.error && (
          <div className="tracking-card" style={{ 
            marginBottom: '1rem', 
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #ef4444' 
          }}>
            <div className="tracking-card-body" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
                <span>Document operation error: {documentOperations.error}</span>
                <button 
                  onClick={() => setDocumentOperations(prev => ({ ...prev, error: null }))}
                  style={{ 
                    marginLeft: 'auto', 
                    background: 'none', 
                    border: 'none', 
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <TrackingHeader 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={loadCurriculaData}
        />

        {/*  Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
          <div className="tracking-card" style={{ marginBottom: '1rem', backgroundColor: '#f0f9ff' }}>
            <div className="tracking-card-header">
              <h3>🔍 Debug Information</h3>
            </div>
            <div className="tracking-card-body">
              <div style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                <div><strong>Current Filter:</strong> {filters.filterType}</div>
                <div><strong>School ID:</strong> {schoolId}</div>
                <div><strong>User ID:</strong> {currentUserId}</div>
                <div><strong>Curricula Loaded:</strong> {curricula.length}</div>
                <div><strong>Filtered Results:</strong> {filteredCurricula.length}</div>
                <div><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
                <div><strong>Document Operations:</strong> 
                  {documentOperations.uploading ? ' Uploading' : ''}
                  {documentOperations.downloading ? ' Downloading' : ''}
                  {documentOperations.error ? ` Error: ${documentOperations.error}` : ' None'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Type Selector */}
        <div className="tracking-card" style={{ marginBottom: '1.5rem' }}>
          <div className="tracking-card-header">
            <h3 className="tracking-section-title">
              <i className="fas fa-filter"></i>
              View Options
            </h3>
          </div>
          <div className="tracking-card-body">
            <div className="tracking-filter-types" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {filterTypes.map(type => (
                <button
                  key={type.value}
                  className={`tracking-btn ${
                    filters.filterType === type.value 
                      ? 'tracking-btn-primary' 
                      : 'tracking-btn-outline'
                  }`}
                  onClick={() => handleFilterChange('filterType', type.value)}
                  style={{ justifyContent: 'flex-start' }}
                >
                  <i className={type.icon}></i>
                  {type.label}
                </button>
              ))}
            </div>
            
            <div className="tracking-current-filter" style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: 'var(--tracking-bg-secondary)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: 'var(--tracking-text-secondary)'
            }}>
              <strong>Current View:</strong> {filterTypes.find(t => t.value === filters.filterType)?.label}
              {filters.filterType === 'bySchool' && schoolId && ` (School ID: ${schoolId})`}
              {filters.filterType === 'byStage' && filters.stage && ` (${filters.stage})`}
              {filters.filterType === 'byDepartment' && filters.department && ` (Department ID: ${filters.department})`}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <TrackingStats stats={stats} />

        {/* Additional Filters */}
        <TrackingFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          schools={getUniqueValues('school')}
          departments={getUniqueValues('department')}
          stages={['initiation', 'school_board', 'dean_committee', 'senate', 'qa_review', 'vice_chancellor', 'cue_review', 'site_inspection']}
          statuses={['under_review', 'pending_approval', 'on_hold', 'completed']}
        />

        {/* Results Summary */}
        <div className="tracking-results-summary" style={{
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--tracking-bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--tracking-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>{filteredCurricula.length}</strong> curricula found
            {filteredCurricula.length !== curricula.length && (
              <span style={{ color: 'var(--tracking-text-muted)' }}>
                {' '}(filtered from {curricula.length} total)
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {selectedCurriculum && (
              <>
                <button 
                  className="tracking-btn tracking-btn-outline tracking-btn-sm"
                  onClick={() => openModal('editTracking', selectedCurriculum)}
                  title="Edit selected tracking"
                >
                  <i className="fas fa-edit"></i>
                  Edit
                </button>
                
                <button 
                  className="tracking-btn tracking-btn-outline tracking-btn-sm"
                  onClick={() => openModal('assignTracking', selectedCurriculum)}
                  title="Assign selected tracking"
                >
                  <i className="fas fa-user-plus"></i>
                  Assign
                </button>
                
                <button 
                  className="tracking-btn tracking-btn-outline tracking-btn-sm"
                  onClick={() => openModal('trackingStatus', selectedCurriculum)}
                  title="Manage tracking status"
                >
                  <i className="fas fa-cog"></i>
                  Status
                </button>
              </>
            )}
            
            {(filters.search || filters.school || filters.department || filters.stage || filters.status) && (
              <button 
                className="tracking-btn tracking-btn-outline tracking-btn-sm"
                onClick={clearFilters}
              >
                <i className="fas fa-times"></i>
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'workflow' ? (
          <CurriculumWorkflow
            curricula={filteredCurricula}
            onStageAction={handleStageAction}
            onViewDetails={(curriculum, stage) => {
              setSelectedCurriculum({ ...curriculum, selectedStage: stage });
              openModal('stageDetails');
            }}
            onUploadDocument={(curriculum, stage) => {
              setSelectedCurriculum({ ...curriculum, selectedStage: stage });
              openModal('documentUpload');
            }}
            onAddNotes={(curriculum, stage) => {
              setSelectedCurriculum({ ...curriculum, selectedStage: stage });
              openModal('notes');
            }}
            onCurriculumSelect={setSelectedCurriculum}
            selectedCurriculum={selectedCurriculum}
            isLoading={isLoading}
          />
        ) : (
          <TrackingTable
            curricula={filteredCurricula}
            onStageAction={handleStageAction}
            onViewDetails={(curriculum) => {
              setSelectedCurriculum(curriculum);
              openModal('stageDetails');
            }}
            onRowSelect={setSelectedCurriculum}
            selectedCurriculum={selectedCurriculum}
            onDocumentDownload={handleDocumentDownload}
            isLoading={isLoading}
          />
        )}

        {/*  Modals with Document Support */}
        {modals.stageDetails && selectedCurriculum && (
          <StageDetailsModal
            curriculum={selectedCurriculum}
            onClose={() => closeModal('stageDetails')}
            onStageAction={handleStageAction}
            onUploadDocument={() => {
              closeModal('stageDetails');
              openModal('documentUpload');
            }}
            onAddNotes={() => {
              closeModal('stageDetails');
              openModal('notes');
            }}
            onDocumentDownload={handleDocumentDownload}
          />
        )}

        {modals.documentUpload && selectedCurriculum && (
          <DocumentUploadModal
            curriculum={selectedCurriculum}
            onClose={() => closeModal('documentUpload')}
            onUpload={handleDocumentUpload}
          />
        )}

        {modals.notes && selectedCurriculum && (
          <NotesModal
            curriculum={selectedCurriculum}
            onClose={() => closeModal('notes')}
            onSave={(notes) => {
              handleStageAction(
                selectedCurriculum.id,
                selectedCurriculum.selectedStage || selectedCurriculum.currentStage,
                'add_notes',
                { notes }
              );
              closeModal('notes');
            }}
          />
        )}

        {/*  Modals */}
        {modals.editTracking && selectedCurriculum && (
          <EditTrackingModal
            curriculum={selectedCurriculum}
            onClose={() => closeModal('editTracking')}
            onUpdate={handleUpdateTracking}
          />
        )}

        {modals.assignTracking && selectedCurriculum && (
          <AssignTrackingModal
            curriculum={selectedCurriculum}
            onClose={() => closeModal('assignTracking')}
            onAssign={handleAssignTracking}
          />
        )}

        {modals.trackingStatus && selectedCurriculum && (
          <TrackingStatusModal
            curriculum={selectedCurriculum}
            onClose={() => closeModal('trackingStatus')}
            onStatusChange={handleTrackingStatusChange}
          />
        )}
      </div>
      <EndpointTester/>
    </div>
  );
};

export default CurriculumTrackingPage;