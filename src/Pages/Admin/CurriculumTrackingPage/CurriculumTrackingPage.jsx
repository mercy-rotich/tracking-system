import React, { useState, useEffect, useCallback } from 'react';
import TrackingHeader from '../../../components/Admin/CurriculaTracking/TrackingHeader/TrackingHeader';
import TrackingStats from '../../../components/Admin/CurriculaTracking/TrackingStats/TrackingStats';
import TrackingFilters from '../../../components/Admin/CurriculaTracking/TrackingFilters/TrackingFilters';
import CurriculumWorkflow from '../../../components/Admin/CurriculaTracking/CurriculumWorkflow/CurriculumWorkflow';
import TrackingTable from '../../../components/Admin/CurriculaTracking/TrackingTable/TrackingTable';
import StageDetailsModal from '../../../components/Admin/CurriculaTracking/StageDetailsModal/StageDetailsModal';
import DocumentUploadModal from '../../../components/Admin/CurriculaTracking/DocumentUploadModal/DocumentUploadModal';
import NotesModal from '../../../components/Admin/CurriculaTracking/NotesModal/NotesModal';
import InitiateCurriculumModal from './InitiateCurriculumModal/InitiateCurriculumModal';
import NotificationBanner from '../../../components/Admin/CurriculaTracking/NotificationBanner/NotificationBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import curriculumTrackingService from '../../../services/CurriculumTrackingService';
import curriculumService from '../../../services/curriculumService';
import statisticsService from '../../../services/statisticsService';
import './CurriculumTrackingPage.css';

const CurriculumTrackingPage = () => {
  // Main state
  const [curricula, setCurricula] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState('workflow');
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    school: '',
    department: '',
    stage: '',
    status: ''
  });

  // Modal states
  const [modals, setModals] = useState({
    stageDetails: false,
    documentUpload: false,
    notes: false,
    initiateCurriculum: false
  });

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Additional data
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
    pageSize: 20
  });

  // Statistics state
  const [statsData, setStatsData] = useState({
    total: 0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
    overdue: 0
  });

 

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
    setSelectedCurriculum(null);
  }, []);


  // Load curricula data
  const loadCurriculaData = useCallback(async (page = 0, size = 20, showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      console.log('🔄 Loading curricula data...', { page, size, filters });

      let result;

      
      if (filters.stage) {
        // Load by specific stage
        const stageMapping = {
          'initiation': 'IDEATION',
          'school_board': 'SCHOOL_BOARD_APPROVAL',
          'dean_committee': 'DEAN_APPROVAL',
          'senate': 'SENATE_APPROVAL',
          'qa_review': 'QA_REVIEW',
          'vice_chancellor': 'VICE_CHANCELLOR_APPROVAL',
          'cue_review': 'CUE_REVIEW',
          'site_inspection': 'SITE_INSPECTION'
        };
        
        const apiStage = stageMapping[filters.stage] || 'IDEATION';
        result = await curriculumTrackingService.getTrackingsByStage(apiStage, page, size);
      } else {
        // Load all curricula 
        result = await curriculumTrackingService.getAllCurricula(page, size);
      }

      if (result.success) {
        let filteredData = result.data || [];

        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(curriculum => 
            curriculum.title?.toLowerCase().includes(searchLower) ||
            curriculum.trackingId?.toLowerCase().includes(searchLower) ||
            curriculum.department?.toLowerCase().includes(searchLower) ||
            curriculum.school?.toLowerCase().includes(searchLower)
          );
        }

        if (filters.school) {
          filteredData = filteredData.filter(curriculum => 
            curriculum.school === filters.school
          );
        }

        if (filters.department) {
          filteredData = filteredData.filter(curriculum => 
            curriculum.department === filters.department
          );
        }

        if (filters.status) {
          filteredData = filteredData.filter(curriculum => 
            curriculum.status === filters.status
          );
        }

        setCurricula(filteredData);
        
        if (result.pagination) {
          setPagination(result.pagination);
        }

        showNotification(
          `Loaded ${filteredData.length} curriculum tracking record${filteredData.length !== 1 ? 's' : ''}`,
          'success'
        );
      } else {
        throw new Error(result.message || 'Failed to load curricula data');
      }

    } catch (error) {
      console.error('❌ Error loading curricula data:', error);
      setError(error.message);
      showNotification(`Failed to load curricula: ${error.message}`, 'error');
      
      // Set empty data on error
      setCurricula([]);
      setPagination({
        currentPage: 0,
        totalPages: 1,
        totalElements: 0,
        pageSize: 20
      });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [filters, showNotification]);

  
  const loadSupportingData = useCallback(async () => {
    try {
      // Load schools
      const schoolsResult = await curriculumService.getAllSchoolsEnhanced();
      setSchools(schoolsResult || []);

      // Load departments  
      const departmentsResult = await curriculumService.getDepartmentsFromCurriculums();
      setDepartments(departmentsResult || []);

    } catch (error) {
      console.error('❌ Error loading supporting data:', error);
      
    }
  }, []);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const stats = await statisticsService.getMetricsForTracking();
      setStatsData(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Fallback to local calculation
      const localStats = {
        total: curricula.length,
        inProgress: curricula.filter(c => ['under_review', 'pending_approval'].includes(c.status)).length,
        onHold: curricula.filter(c => c.status === 'on_hold').length,
        completed: curricula.filter(c => c.status === 'completed').length,
        overdue: curricula.filter(c => {
          if (!c.estimatedCompletion || c.status === 'completed') return false;
          const estimatedDate = new Date(c.estimatedCompletion);
          return estimatedDate < new Date();
        }).length
      };
      setStatsData(localStats);
    }
  }, [curricula]);

  
  // Handle stage actions (approve, reject, hold, etc.)
  const handleStageAction = useCallback(async (curriculumId, stage, action, data = {}) => {
    try {
      setIsActionLoading(true);
      console.log('🔄 Performing stage action:', { curriculumId, stage, action, data });

      const result = await curriculumTrackingService.performStageAction(
        curriculumId, 
        stage, 
        action, 
        data
      );

      if (result.success) {
        // Update the curriculum in the local state
        setCurricula(prev => prev.map(curriculum => {
          if (curriculum.trackingId === curriculumId || curriculum.id === curriculumId) {
            return result.data || curriculum;
          }
          return curriculum;
        }));

        showNotification(
          `Stage ${action} completed successfully for ${result.data?.title || curriculumId}`,
          'success'
        );

        
        setTimeout(() => {
          loadCurriculaData(pagination.currentPage, pagination.pageSize, false);
        }, 1000);

      } else {
        throw new Error(result.message || `Failed to ${action} stage`);
      }

    } catch (error) {
      console.error('❌ Error performing stage action:', error);
      showNotification(`Failed to ${action} stage: ${error.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, loadCurriculaData, showNotification]);

  // Handle document upload
  const handleDocumentUpload = useCallback(async (curriculumId, stage, documents) => {
    try {
      setIsActionLoading(true);
      console.log('🔄 Uploading documents:', { curriculumId, stage, documents });

      
      const result = await curriculumTrackingService.performTrackingAction(
        curriculumId,
        'UPLOAD_DOCUMENTS', 
        'Document upload',
        documents
      );

      if (result.success) {
        showNotification(
          `${documents.length} document${documents.length !== 1 ? 's' : ''} uploaded successfully`,
          'success'
        );

        // Refresh the data
        loadCurriculaData(pagination.currentPage, pagination.pageSize, false);
      } else {
        throw new Error(result.message || 'Failed to upload documents');
      }

    } catch (error) {
      console.error('❌ Error uploading documents:', error);
      showNotification(`Failed to upload documents: ${error.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, loadCurriculaData, showNotification]);

  // Handle notes/feedback addition
  const handleAddNotes = useCallback(async (curriculumId, stage, notes) => {
    try {
      setIsActionLoading(true);
      console.log('🔄 Adding notes:', { curriculumId, stage, notes });

      
      const result = await curriculumTrackingService.performTrackingAction(
        curriculumId,
        'ADD_NOTES', 
        notes,
        []
      );

      if (result.success) {
        showNotification('Notes added successfully', 'success');
        
        // Refresh the data
        loadCurriculaData(pagination.currentPage, pagination.pageSize, false);
      } else {
        throw new Error(result.message || 'Failed to add notes');
      }

    } catch (error) {
      console.error('❌ Error adding notes:', error);
      showNotification(`Failed to add notes: ${error.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, loadCurriculaData, showNotification]);

 
  const handleInitiateCurriculum = useCallback(async (trackingData, documents = []) => {
    try {
      setIsActionLoading(true);
      console.log('🔄 Initiating curriculum:', { trackingData, documents });

      const result = await curriculumTrackingService.initiateCurriculumTracking(
        trackingData,
        documents
      );

      if (result.success) {
        showNotification(
          `Curriculum tracking initiated successfully: ${result.data?.trackingId}`,
          'success'
        );

       
        loadCurriculaData(0, pagination.pageSize, false);
        
        
        closeModal('initiateCurriculum');
      } else {
        throw new Error(result.message || 'Failed to initiate curriculum tracking');
      }

    } catch (error) {
      console.error('❌ Error initiating curriculum:', error);
      showNotification(`Failed to initiate curriculum: ${error.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  }, [pagination.pageSize, loadCurriculaData, showNotification, closeModal]);

  // Handle document download
  const handleDocumentDownload = useCallback(async (documentId, filename) => {
    try {
      console.log('🔄 Downloading document:', { documentId, filename });

      const result = await curriculumTrackingService.downloadTrackingDocument(
        documentId,
        filename
      );

      if (result.success) {
        showNotification(`Document downloaded: ${result.filename}`, 'success');
      } else {
        throw new Error(result.message || 'Failed to download document');
      }

    } catch (error) {
      console.error('❌ Error downloading document:', error);
      showNotification(`Failed to download document: ${error.message}`, 'error');
    }
  }, [showNotification]);

  

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      school: '',
      department: '',
      stage: '',
      status: ''
    });
  }, []);


  const getUniqueValues = (field) => {
    return [...new Set(curricula.map(c => c[field]))].filter(Boolean);
  };

  const refreshData = useCallback(() => {
    loadCurriculaData(pagination.currentPage, pagination.pageSize);
  }, [loadCurriculaData, pagination.currentPage, pagination.pageSize]);


  // Initial data load
  useEffect(() => {
    const initializeData = async () => {
      await loadSupportingData();
      await loadCurriculaData();
    };

    initializeData();
  }, [loadSupportingData, loadCurriculaData]);

  // Load statistics when curricula data changes
  useEffect(() => {
    if (curricula.length > 0) {
      loadStatistics();
    }
  }, [curricula, loadStatistics]);

  // Reload data when filters change
  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        loadCurriculaData(0, pagination.pageSize, false);
      }, 300); 

      return () => clearTimeout(timeoutId);
    }
  }, [filters, loadCurriculaData, pagination.pageSize, isLoading]);


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

  if (error && curricula.length === 0) {
    return (
      <div className="dashboard-main-content">
        <div className="tracking-page">
          <div className="tracking-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: 'var(--tracking-danger)', marginBottom: '1rem' }}></i>
            <h3 style={{ color: 'var(--tracking-text-primary)', marginBottom: '0.5rem' }}>
              Failed to Load Tracking Data
            </h3>
            <p style={{ color: 'var(--tracking-text-secondary)', marginBottom: '1.5rem' }}>
              {error}
            </p>
            <button 
              className="tracking-btn tracking-btn-primary"
              onClick={refreshData}
            >
              <i className="fas fa-sync-alt"></i>
              Try Again
            </button>
          </div>
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

        {/* Page Header */}
        <TrackingHeader 
          onRefresh={refreshData}
          onInitiateCurriculum={() => openModal('initiateCurriculum')}
        />

        {/* Statistics Cards */}
        <TrackingStats stats={statsData} />

        {/* Filters Section */}
        <TrackingFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          schools={getUniqueValues('school')}
          departments={getUniqueValues('department')}
          stages={['initiation', 'school_board', 'dean_committee', 'senate', 'qa_review', 'vice_chancellor', 'cue_review', 'site_inspection']}
          statuses={['under_review', 'pending_approval', 'on_hold', 'completed']}
        />

        {/* Main Content */}
        {viewMode === 'workflow' ? (
          <CurriculumWorkflow
            curricula={curricula}
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
            isLoading={isActionLoading}
          />
        ) : (
          <TrackingTable
            curricula={curricula}
            onStageAction={handleStageAction}
            onViewDetails={(curriculum) => {
              setSelectedCurriculum(curriculum);
              openModal('stageDetails');
            }}
            isLoading={isActionLoading}
          />
        )}

        {/* Pagination Info */}
        {pagination.totalElements > 0 && (
          <div className="tracking-pagination-info" style={{ 
            textAlign: 'center', 
            padding: '1rem', 
            color: 'var(--tracking-text-secondary)',
            fontSize: '0.875rem'
          }}>
            Showing {curricula.length} of {pagination.totalElements} curriculum tracking records
            {pagination.totalPages > 1 && (
              <span> • Page {pagination.currentPage + 1} of {pagination.totalPages}</span>
            )}
          </div>
        )}

        {/* Modals */}
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
            onDownloadDocument={handleDocumentDownload}
          />
        )}

        {modals.documentUpload && selectedCurriculum && (
          <DocumentUploadModal
            curriculum={selectedCurriculum}
            onClose={() => closeModal('documentUpload')}
            onUpload={(documents) => {
              handleDocumentUpload(
                selectedCurriculum.trackingId || selectedCurriculum.id,
                selectedCurriculum.selectedStage || selectedCurriculum.currentStage,
                documents
              );
              closeModal('documentUpload');
            }}
          />
        )}

        {modals.notes && selectedCurriculum && (
          <NotesModal
            curriculum={selectedCurriculum}
            onClose={() => closeModal('notes')}
            onSave={(notes) => {
              handleAddNotes(
                selectedCurriculum.trackingId || selectedCurriculum.id,
                selectedCurriculum.selectedStage || selectedCurriculum.currentStage,
                notes
              );
              closeModal('notes');
            }}
          />
        )}

        {/* Initiate Curriculum Modal */}
        {modals.initiateCurriculum && (
          <InitiateCurriculumModal
            onClose={() => closeModal('initiateCurriculum')}
            onInitiate={handleInitiateCurriculum}
          />
        )}
      </div>
    </div>
  );
};

export default CurriculumTrackingPage;