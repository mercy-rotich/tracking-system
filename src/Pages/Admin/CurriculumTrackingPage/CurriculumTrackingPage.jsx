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
import curriculumService from '../../../services/curriculumService';
import './CurriculumTrackingPage.css';

const CurriculumTrackingPage = () => {
  
  const [curricula, setCurricula] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('workflow'); 
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  
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
    notes: false
  });

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

 
  useEffect(() => {
    loadCurriculaData();
  }, []);

  const loadCurriculaData = async () => {
    setIsLoading(true);
    try {
      
      const response = await curriculumService.getAllCurriculums(0, 1000);
      
      if (response.curriculums) {
        
        setCurricula(response.curriculums);
        showNotification('Curriculum tracking data loaded successfully', 'success');
      } else {
        showNotification('No curriculum data found', 'warning');
        setCurricula([]);
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
      showNotification(error.message || 'Failed to load tracking data', 'error');
      setCurricula([]);
    } finally {
      setIsLoading(false);
    }
  };

  
  useEffect(() => {
    if (!isLoading) {
      loadCurriculaData();
    }
  }, [filters.school, filters.department, filters.stage, filters.status]);

  
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

  // Filter functions
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

  
  const filteredCurricula = curricula.filter(curriculum => {
    const matchesSearch = !filters.search || 
      curriculum.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      curriculum.trackingId.toLowerCase().includes(filters.search.toLowerCase()) ||
      curriculum.curriculumCode?.toLowerCase().includes(filters.search.toLowerCase());

    return matchesSearch;
  });

 
  const getUniqueValues = (field) => {
    return [...new Set(curricula.map(c => c[field]))].filter(Boolean);
  };

 
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

  
  const handleStageAction = useCallback(async (curriculumId, stage, action, data = {}) => {
    try {
      setIsLoading(true);
      
      const curriculum = curricula.find(c => c.id === curriculumId);
      if (!curriculum) {
        throw new Error('Curriculum not found');
      }

      let response;
      
      switch (action) {
        case 'approve':
        case 'reject':
        case 'hold':
          response = await curriculumTrackingService.updateStage(curriculum.trackingId, {
            stage,
            action,
            feedback: data.feedback,
            notes: data.notes
          });
          break;
          
        case 'add_notes':
          response = await curriculumTrackingService.addNotes(
            curriculum.trackingId, 
            data.notes, 
            stage
          );
          break;
          
        case 'upload_documents':
          response = await curriculumTrackingService.uploadDocuments(
            curriculum.trackingId, 
            data.documents, 
            stage
          );
          break;
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      if (response.success) {
        
        await loadCurriculaData();
        showNotification(response.message || `Stage ${action} completed successfully`, 'success');
      } else {
        showNotification(response.error, 'error');
      }
    } catch (error) {
      console.error(`Error performing ${action} on stage:`, error);
      showNotification(error.message || `Failed to ${action} stage`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [curricula]);

  
  const handleRefresh = useCallback(async () => {
    await loadCurriculaData();
  }, []);

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

        {/* Page Header */}
        <TrackingHeader 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={handleRefresh}
        />

        {/* Statistics Cards */}
        <TrackingStats stats={stats} />

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
            isLoading={isLoading}
          />
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
          />
        )}

        {modals.documentUpload && selectedCurriculum && (
          <DocumentUploadModal
            curriculum={selectedCurriculum}
            onClose={() => closeModal('documentUpload')}
            onUpload={(documents) => {
              handleStageAction(
                selectedCurriculum.id, 
                selectedCurriculum.selectedStage || selectedCurriculum.currentStage,
                'upload_documents',
                { documents }
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
      </div>
    </div>
  );
};

export default CurriculumTrackingPage;