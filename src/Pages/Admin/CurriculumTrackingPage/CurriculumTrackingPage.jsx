import React, { useState, useEffect, useCallback } from 'react';
import TrackingHeader from '../../../components/Admin/CurriculaTracking/TrackingHeader/TrackingHeader';
import TrackingStats from '../../../components/Admin/CurriculaTracking/TrackingStats/TrackingStats';
import TrackingFilters from '../../../components/Admin/CurriculaTracking/TrackingFilters/TrackingFilters';
import CurriculumWorkflow from '../../../components/Admin/CurriculaTracking/CurriculumWorkflow/CurriculumWorkflow';
import TrackingTable from '../../../components/Admin/CurriculaTracking/TrackingTable/TrackingTable';
import StageDetailsModal from '../../../components/Admin/CurriculaTracking/StageDetailsModal/StageDetailsModal';
import DocumentUploadModal from '../../../components/Admin/CurriculaTracking/DocumentUploadModal/DocumentUploadModal';
import DocumentViewer from '../../../components/Admin/CurriculaTracking/DocumentViewer/DocumentViewer';
import NotesModal from '../../../components/Admin/CurriculaTracking/NotesModal/NotesModal';
import InitiateCurriculumModal from './InitiateCurriculumModal/InitiateCurriculumModal';
import EditTrackingModal from '../../../components/Admin/CurriculaTracking/EditTrackingModal/EditTrackingModal';
import AssignTrackingModal from '../../../components/Admin/CurriculaTracking/AssignTrackingModal/AssignTrackingModal';
import StatusManagementModal from '../../../components/Admin/CurriculaTracking/StatusManagementModal/StatusManagementModal';
import NotificationBanner from '../../../components/Admin/CurriculaTracking/NotificationBanner/NotificationBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import curriculumTrackingService from '../../../services/tracking/CurriculumTrackingService';
import documentManagementService from '../../../services/tracking/DocumentManagementService';
import curriculumService from '../../../services/curriculumService';
import './CurriculumTrackingPage.css';

const CurriculumTrackingPage = () => {
  const [curricula, setCurricula] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [error, setError] = useState(null);

  const [currentDataSource, setCurrentDataSource] = useState('all');
  const [currentIdentifier, setCurrentIdentifier] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    school: '',
    department: '',
    stage: '',
    status: '',
    schoolId: '',
    departmentId: '',
    assigneeId: '',
    initiatorId: ''
  });

  const [modals, setModals] = useState({
    stageDetails: false,
    documentUpload: false,
    documentViewer: false,
    notes: false,
    initiateCurriculum: false,
    editTracking: false,
    assignTracking: false,
    statusManagement: false
  });

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
    pageSize: 20
  });

  const [statsData, setStatsData] = useState({
    total: 0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
    overdue: 0,
    myInitiated: 0,
    myAssigned: 0,
    byStatus: {},
    byStage: {},
    byPriority: {}
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

  const handleViewDetails = useCallback(async (curriculumSummary) => {
    try {
      setSelectedCurriculum(curriculumSummary);
      setModals(prev => ({ ...prev, stageDetails: true }));

      const numericId = Number(curriculumSummary.id);
      
      // 1. Get the basic details
      const response = await curriculumTrackingService.getTrackingById(numericId, false);
      
      if (response.success && response.data) {
        let fullData = response.data;
        
        if (fullData.recentSteps && fullData.recentSteps.length > 0) {
           const stepsWithDocs = await Promise.all(fullData.recentSteps.map(async (step) => {
             // If documents list is empty, try to fetch it specifically
             if (!step.documents || step.documents.length === 0) {
               try {
                 const docResponse = await documentManagementService.getDocumentsByStep(step.id);
                 if (docResponse.success) {
                   return { ...step, documents: docResponse.data }; 
                 }
               } catch (e) {
                 console.warn(`Failed to fetch docs for step ${step.id}`, e);
               }
             }
             return step;
           }));
           
           fullData = { ...fullData, recentSteps: stepsWithDocs };
        }

        setSelectedCurriculum(fullData);
      } 
    } catch (error) {
      console.error('Failed to load full details:', error);
    }
  }, []);
  const loadCurriculaData = useCallback(async (page = 0, size = 20, showLoading = true, source = 'all', identifier = null) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      setCurrentDataSource(source);
      setCurrentIdentifier(identifier);

      let result;

      try {
        result = await curriculumTrackingService.getTrackingsForViewMode(source, identifier, page, size);
      } catch (serviceError) {
        console.error('Service method failed, trying fallback:', serviceError);
        // Fallback logic kept minimal for brevity, assumes service works
        result = await curriculumTrackingService.getAllCurricula(page, size);
      }

      if (result.success) {
        let filteredData = [];

        if (Array.isArray(result.data)) {
          filteredData = result.data;
        } else if (result.data && Array.isArray(result.data.trackings)) {
          filteredData = result.data.trackings;
          if (result.data.pagination) {
            setPagination(result.data.pagination);
          }
        } else if (result.data) {
          filteredData = [result.data];
        }

        if (source === 'all' || source === 'by-stage') {
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
            filteredData = filteredData.filter(curriculum => curriculum.school === filters.school);
          }
          if (filters.department) {
            filteredData = filteredData.filter(curriculum => curriculum.department === filters.department);
          }
          if (filters.status) {
            filteredData = filteredData.filter(curriculum => curriculum.status === filters.status);
          }
        }

        setCurricula(filteredData);
      } else {
        throw new Error(result.message || 'Failed to load curricula data');
      }

    } catch (error) {
      console.error('Error loading curricula data:', error);
      setError(error.message);
      setCurricula([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [filters, showNotification]);

  const loadSupportingData = useCallback(async () => {
    try {
      const schoolsResult = await curriculumService.getAllSchoolsEnhanced();
      setSchools(schoolsResult || []);
      const departmentsResult = await curriculumService.getDepartmentsFromCurriculums();
      setDepartments(departmentsResult || []);
    } catch (error) {
      console.error('Error loading supporting data:', error);
    }
  }, []);

  const loadStatistics = useCallback(async () => {
    try {
      const stats = await curriculumTrackingService.getTrackingStatistics();
      if (stats.success) {
        setStatsData(stats.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    setFilters(prev => ({ ...prev, schoolId: '', departmentId: '', assigneeId: '', initiatorId: '' }));
    loadCurriculaData(0, pagination.pageSize, true, mode);
  }, [pagination.pageSize, loadCurriculaData]);

  const handleShowMyInitiated = useCallback(() => {
    setViewMode('my-initiated');
    loadCurriculaData(0, pagination.pageSize, true, 'my-initiated');
  }, [pagination.pageSize, loadCurriculaData]);

  const handleShowMyAssigned = useCallback(() => {
    setViewMode('my-assigned');
    loadCurriculaData(0, pagination.pageSize, true, 'my-assigned');
  }, [pagination.pageSize, loadCurriculaData]);

  const handleShowBySchool = useCallback((schoolId) => {
    setViewMode('by-school');
    setFilters(prev => ({ ...prev, schoolId }));
    loadCurriculaData(0, pagination.pageSize, true, 'by-school', schoolId);
  }, [pagination.pageSize, loadCurriculaData]);

  const handleShowByDepartment = useCallback((departmentId) => {
    setViewMode('by-department');
    setFilters(prev => ({ ...prev, departmentId }));
    loadCurriculaData(0, pagination.pageSize, true, 'by-department', departmentId);
  }, [pagination.pageSize, loadCurriculaData]);

  const handleShowByAssignee = useCallback((assigneeId) => {
    setViewMode('by-assignee');
    setFilters(prev => ({ ...prev, assigneeId }));
    loadCurriculaData(0, pagination.pageSize, true, 'by-assignee', assigneeId);
  }, [pagination.pageSize, loadCurriculaData]);

  const handleShowByInitiator = useCallback((initiatorId) => {
    setViewMode('by-initiator');
    setFilters(prev => ({ ...prev, initiatorId }));
    loadCurriculaData(0, pagination.pageSize, true, 'by-initiator', initiatorId);
  }, [pagination.pageSize, loadCurriculaData]);

  const handleStageAction = useCallback(async (curriculumIdentifier, stage, action, data = {}) => {
    try {
      setIsActionLoading(true);
      const result = await curriculumTrackingService.performStageAction(
        curriculumIdentifier, stage, action, data
      );

      if (result.success) {
        setCurricula(prev => prev.map(curriculum => {
          const curriculumMatches =
            curriculum.trackingId === curriculumIdentifier ||
            curriculum.id === curriculumIdentifier ||
            (typeof curriculumIdentifier === 'object' && curriculum.id === curriculumIdentifier.id);

          if (curriculumMatches) {
            return result.data || curriculum;
          }
          return curriculum;
        }));

        showNotification(`Stage ${action} completed successfully`, 'success');
        setTimeout(() => {
          loadCurriculaData(pagination.currentPage, pagination.pageSize, false, currentDataSource, currentIdentifier);
        }, 1000);
      } else {
        throw new Error(result.message || `Failed to ${action} stage`);
      }
    } catch (error) {
      console.error('Error performing stage action:', error);
      showNotification(`Failed to ${action} stage: ${error.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, currentDataSource, currentIdentifier, loadCurriculaData, showNotification]);

  const handleUpdateTracking = useCallback(async (trackingId, updateData) => {
    try {
      setIsActionLoading(true);
      const result = await curriculumTrackingService.updateTracking(trackingId, updateData);

      if (result.success) {
        setCurricula(prev => prev.map(curriculum =>
          curriculum.id === trackingId ? result.data : curriculum
        ));
        showNotification('Tracking updated successfully', 'success');
        closeModal('editTracking');
        setTimeout(() => {
          loadCurriculaData(pagination.currentPage, pagination.pageSize, false, currentDataSource, currentIdentifier);
        }, 1000);
      } else {
        throw new Error(result.message || 'Failed to update tracking');
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      showNotification(`Failed to update tracking: ${error.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, currentDataSource, currentIdentifier, loadCurriculaData, showNotification, closeModal]);

  const handleToggleTrackingStatus = useCallback(async (trackingId, isActive) => {
    try {
      setIsActionLoading(true);
      const action = isActive ? 'deactivate' : 'reactivate';
      const result = await curriculumTrackingService.toggleTrackingStatus(trackingId, isActive);

      if (result.success) {
        setCurricula(prev => prev.map(curriculum =>
          curriculum.id === trackingId ? result.data : curriculum
        ));
        showNotification(`Tracking ${action}d successfully`, 'success');
        closeModal('statusManagement');
        setTimeout(() => {
          loadCurriculaData(pagination.currentPage, pagination.pageSize, false, currentDataSource, currentIdentifier);
        }, 1000);
      } else {
        throw new Error(result.message || `Failed to ${action} tracking`);
      }
    } catch (error) {
      console.error('Error toggling tracking status:', error);
      showNotification(`Failed to change tracking status: ${error.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, currentDataSource, currentIdentifier, loadCurriculaData, showNotification, closeModal]);

  const handleAssignTracking = useCallback(async (trackingId, userId) => {
    try {
      setIsActionLoading(true);
      const result = await curriculumTrackingService.assignTracking(trackingId, userId);

      if (result.success) {
        setCurricula(prev => prev.map(curriculum =>
          curriculum.id === trackingId ? result.data : curriculum
        ));
        showNotification('Tracking assigned successfully', 'success');
        closeModal('assignTracking');
        setTimeout(() => {
          loadCurriculaData(pagination.currentPage, pagination.pageSize, false, currentDataSource, currentIdentifier);
        }, 1000);
      } else {
        throw new Error(result.message || 'Failed to assign tracking');
      }
    } catch (error) {
      console.error('Error assigning tracking:', error);
      showNotification(`Failed to assign tracking: ${error.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, currentDataSource, currentIdentifier, loadCurriculaData, showNotification, closeModal]);

  const handleDocumentUpload = useCallback(async (curriculumId, stage, documents) => {
    try {
      setIsActionLoading(true);

      const fileObjects = documents.map(doc => {
        if (typeof doc === 'string') {
          return new File([''], doc, { type: 'application/octet-stream' });
        }
        return doc;
      });

      let result;
      if (fileObjects.length === 1) {
        result = await documentManagementService.uploadDocument({
          file: fileObjects[0],
          trackingId: curriculumId,
          stepId: stage,
          documentType: 'SUPPORTING_DOCUMENTS',
          description: `Document uploaded for ${stage} stage`
        });
      } else {
        result = await documentManagementService.uploadDocumentsBatch({
          files: fileObjects,
          trackingId: curriculumId,
          stepId: stage,
          documentType: 'SUPPORTING_DOCUMENTS',
          descriptions: fileObjects.map(() => `Document uploaded for ${stage} stage`)
        });
      }

      if (result.success) {
        showNotification(`${fileObjects.length} document(s) uploaded successfully`, 'success');

        loadCurriculaData(pagination.currentPage, pagination.pageSize, false, currentDataSource, currentIdentifier);

        if (selectedCurriculum && Number(selectedCurriculum.id) === Number(curriculumId)) {
          const updatedDetails = await curriculumTrackingService.getTrackingById(curriculumId, false);
          if (updatedDetails.success) {
            setSelectedCurriculum(updatedDetails.data);
          }
        }
      } else {
        throw new Error(result.message || 'Failed to upload documents');
      }

    } catch (error) {
      console.error('Error uploading documents:', error);
      showNotification(`Failed to upload documents: ${error.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, currentDataSource, currentIdentifier, loadCurriculaData, showNotification, selectedCurriculum]);
  const handleAddNotes = useCallback(async (curriculumId, stage, notes) => {
    try {
      setIsActionLoading(true);
      const result = await curriculumTrackingService.performTrackingAction(
        curriculumId, 'ADD_NOTES', notes, []
      );

      if (result.success) {
        showNotification('Notes added successfully', 'success');
        loadCurriculaData(pagination.currentPage, pagination.pageSize, false, currentDataSource, currentIdentifier);
      } else {
        throw new Error(result.message || 'Failed to add notes');
      }
    } catch (error) {
      console.error('Error adding notes:', error);
      showNotification(`Failed to add notes: ${error.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, currentDataSource, currentIdentifier, loadCurriculaData, showNotification]);

  const handleInitiateCurriculum = useCallback(async (trackingData, documents = []) => {
    try {
      setIsActionLoading(true);
      const result = await curriculumTrackingService.initiateCurriculumTracking(trackingData, documents);

      if (result.success) {
        showNotification(`Curriculum tracking initiated successfully: ${result.data?.trackingId}`, 'success');
        loadCurriculaData(0, pagination.pageSize, false, currentDataSource, currentIdentifier);
        closeModal('initiateCurriculum');
      } else {
        throw new Error(result.message || 'Failed to initiate curriculum tracking');
      }
    } catch (error) {
      console.error('Error initiating curriculum:', error);
      showNotification(`Failed to initiate curriculum: ${error.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  }, [pagination.pageSize, currentDataSource, currentIdentifier, loadCurriculaData, showNotification, closeModal]);

  const handleDocumentDownload = useCallback(async (documentId, filename) => {
    try {
      const result = await documentManagementService.downloadDocument(documentId, filename);
      if (result.success) {
        showNotification(`Document downloaded: ${result.filename}`, 'success');
      } else {
        throw new Error(result.message || 'Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      showNotification(`Failed to download document: ${error.message}`, 'error');
    }
  }, [showNotification]);

  const handleExportData = useCallback(async (format) => {
    try {
      const result = await curriculumTrackingService.exportTrackings(format, filters);
      if (result.success) {
        showNotification(`${result.count} trackings exported as ${format.toUpperCase()}`, 'success');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification(`Failed to export data: ${error.message}`, 'error');
    }
  }, [filters, showNotification]);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      school: '',
      department: '',
      stage: '',
      status: '',
      schoolId: '',
      departmentId: '',
      assigneeId: '',
      initiatorId: ''
    });
  }, []);

  const getUniqueValues = (field) => {
    return [...new Set(curricula.map(c => c[field]))].filter(Boolean);
  };

  const refreshData = useCallback(() => {
    loadCurriculaData(pagination.currentPage, pagination.pageSize, true, currentDataSource, currentIdentifier);
  }, [loadCurriculaData, pagination.currentPage, pagination.pageSize, currentDataSource, currentIdentifier]);

  useEffect(() => {
    const initializeData = async () => {
      await loadSupportingData();
      await loadCurriculaData();
      await loadStatistics();
    };
    initializeData();
  }, [loadSupportingData, loadCurriculaData, loadStatistics]);

  useEffect(() => {
    if (curricula.length > 0) {
      loadStatistics();
    }
  }, [curricula, loadStatistics]);

  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        const source = filters.schoolId ? 'by-school' :
          filters.departmentId ? 'by-department' :
          filters.assigneeId ? 'by-assignee' :
          filters.initiatorId ? 'by-initiator' :
          filters.stage ? 'by-stage' :
          filters.search ? 'search' : 'all';
        const identifier = filters.schoolId || filters.departmentId || filters.assigneeId || filters.initiatorId || filters.stage;
        loadCurriculaData(0, pagination.pageSize, false, source, identifier);
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
            <h3 style={{ color: 'var(--tracking-text-primary)', marginBottom: '0.5rem' }}>Failed to Load Tracking Data</h3>
            <p style={{ color: 'var(--tracking-text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
            <button className="tracking-btn tracking-btn-primary" onClick={refreshData}>
              <i className="fas fa-sync-alt"></i> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main-content">
      <div className="tracking-page">
        <NotificationBanner
          notification={notification}
          onClose={() => setNotification({ show: false, message: '', type: '' })}
        />

        <TrackingHeader
          onRefresh={refreshData}
          onInitiateCurriculum={() => openModal('initiateCurriculum')}
          onViewMode={handleViewModeChange}
          currentViewMode={viewMode}
          onShowMyInitiated={handleShowMyInitiated}
          onShowMyAssigned={handleShowMyAssigned}
          onShowBySchool={handleShowBySchool}
          onShowByDepartment={handleShowByDepartment}
          onShowByAssignee={handleShowByAssignee}
          onShowByInitiator={handleShowByInitiator}
          onExportData={handleExportData}
          trackingStats={statsData}
        />

        <TrackingStats
          stats={statsData}
          curricula={curricula}
          currentView={viewMode}
          currentDataSource={currentDataSource}
        />

        <TrackingFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          schools={getUniqueValues('school')}
          departments={getUniqueValues('department')}
          stages={['initiation', 'school_board', 'dean_committee', 'senate', 'qa_review', 'vice_chancellor', 'cue_review', 'site_inspection']}
          statuses={['under_review', 'pending_approval', 'on_hold', 'completed']}
          currentViewMode={viewMode}
        />

        {viewMode === 'workflow' ? (
          <CurriculumWorkflow
            curricula={curricula}
            onStageAction={handleStageAction}
            onViewDetails={handleViewDetails}
            onUploadDocument={(curriculum, stage) => {
              // Ensure we have full details before uploading too
              if (!curriculum.recentSteps) {
                handleViewDetails(curriculum);
              }
              setSelectedCurriculum({ ...curriculum, selectedStage: stage });
              openModal('documentUpload');
            }}
            onAddNotes={(curriculum, stage) => {
              if (!curriculum.recentSteps) {
                handleViewDetails(curriculum);
              }
              setSelectedCurriculum({ ...curriculum, selectedStage: stage });
              openModal('notes');
            }}
            isLoading={isActionLoading}
            onEditTracking={(curriculum) => {
              setSelectedCurriculum(curriculum);
              openModal('editTracking');
            }}
            onAssignTracking={(curriculum) => {
              setSelectedCurriculum(curriculum);
              openModal('assignTracking');
            }}
            onToggleStatus={(curriculum) => {
              setSelectedCurriculum(curriculum);
              openModal('statusManagement');
            }}
          />
        ) : (
          <TrackingTable
            curricula={curricula}
            onStageAction={handleStageAction}
            onViewDetails={handleViewDetails}
            onEditTracking={(curriculum) => {
              setSelectedCurriculum(curriculum);
              openModal('editTracking');
            }}
            onAssignTracking={(curriculum) => {
              setSelectedCurriculum(curriculum);
              openModal('assignTracking');
            }}
            onToggleStatus={(curriculum) => {
              setSelectedCurriculum(curriculum);
              openModal('statusManagement');
            }}
            isLoading={isActionLoading}
            currentViewMode={viewMode}
            currentDataSource={currentDataSource}
          />
        )}

        {pagination.totalElements > 0 && (
          <div className="tracking-pagination-info" style={{
            textAlign: 'center', padding: '1rem', color: 'var(--tracking-text-secondary)',
            fontSize: '0.875rem', backgroundColor: 'var(--tracking-bg-secondary)',
            borderRadius: '8px', border: '1px solid var(--tracking-border)', marginTop: '1rem'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              Showing {curricula.length} of {pagination.totalElements} curriculum tracking records
              {pagination.totalPages > 1 && (
                <span> • Page {pagination.currentPage + 1} of {pagination.totalPages}</span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)' }}>
              Data Source: <strong>{currentDataSource.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>
              {currentIdentifier && (
                <span> | Identifier: <strong>{currentIdentifier}</strong></span>
              )}
              {viewMode !== 'all' && (
                <span> | View Mode: <strong>{viewMode.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong></span>
              )}
            </div>
          </div>
        )}

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
            onUpload={async (files) => {
              try {
                const numericId = Number(selectedCurriculum.id);
                const currentStage = selectedCurriculum.selectedStage || selectedCurriculum.currentStage;

                let stepsToSearch = selectedCurriculum.recentSteps || [];

                if (!stepsToSearch.length) {
                  console.log('Fetching full tracking details to resolve Step IDs...');
                  const fullDetailsResponse = await curriculumTrackingService.getTrackingById(numericId);

                  if (fullDetailsResponse.success && fullDetailsResponse.data) {
                    stepsToSearch = fullDetailsResponse.data.recentSteps || [];
                  } else {
                    throw new Error('Failed to retrieve tracking workflow history.');
                  }
                }

                let stepId = null;
                const matchingStep = stepsToSearch.find(step =>
                  curriculumTrackingService.dataTransformer.mapApiStageToFrontend(step.stage) === currentStage
                );

                if (matchingStep) {
                  stepId = matchingStep.id;
                } else if (currentStage === selectedCurriculum.currentStage && stepsToSearch.length > 0) {
                  stepId = stepsToSearch[0].id;
                }

                if (!stepId) {
                  console.error('Step ID Resolution Failed:', { targetStage: currentStage, availableSteps: stepsToSearch });
                  throw new Error(`Unable to identify the system record for stage: "${currentStage}".`);
                }

                console.log('Uploading with resolved Step ID:', stepId);
                await handleDocumentUpload(numericId, stepId, files);
                closeModal('documentUpload');

              } catch (error) {
                console.error('Upload callback error:', error);
                showNotification(`Upload failed: ${error.message}`, 'error');
              }
            }}
          />
        )}

        {modals.documentViewer && selectedCurriculum && (
          <div className="tracking-modal-overlay" onClick={() => closeModal('documentViewer')}>
            <div className="tracking-modal-content" style={{ maxWidth: '95vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
              <div className="tracking-modal-header">
                <div className="tracking-modal-title">
                  <i className="fas fa-folder-open"></i>
                  Documents - {selectedCurriculum.title}
                </div>
                <button className="tracking-modal-close" onClick={() => closeModal('documentViewer')}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="tracking-modal-body" style={{ padding: 0 }}>
                <DocumentViewer
                  trackingId={selectedCurriculum.trackingId || selectedCurriculum.id}
                  stepId={selectedCurriculum.selectedStage || selectedCurriculum.currentStage}
                  showUploadButton={true}
                  onUploadClick={() => {
                    closeModal('documentViewer');
                    openModal('documentUpload');
                  }}
                  onDocumentAction={(action, document, data) => {
                    console.log('Document action:', action, document, data);
                    if (action === 'download') {
                      handleDocumentDownload(document.id, document.originalFilename);
                    }
                  }}
                  className="document-viewer-modal"
                />
              </div>
            </div>
          </div>
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

        {modals.initiateCurriculum && (
          <InitiateCurriculumModal
            onClose={() => closeModal('initiateCurriculum')}
            onInitiate={handleInitiateCurriculum}
          />
        )}

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

        {modals.statusManagement && selectedCurriculum && (
          <StatusManagementModal
            curriculum={selectedCurriculum}
            onClose={() => closeModal('statusManagement')}
            onStatusChange={handleToggleTrackingStatus}
          />
        )}
      </div>
    </div>
  );
};

export default CurriculumTrackingPage;