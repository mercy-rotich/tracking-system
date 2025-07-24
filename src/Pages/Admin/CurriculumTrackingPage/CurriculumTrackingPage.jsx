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

  const mockCurricula = [
    {
      id: 'CURR-2024-001',
      trackingId: 'TRK-CS-2024-001',
      title: 'Bachelor of Computer Science (Revised)',
      school: 'School of Engineering & Technology',
      department: 'Computer Science',
      currentStage: 'dean_committee',
      status: 'under_review',
      priority: 'high',
      submittedDate: '2024-01-15',
      lastUpdated: '2024-01-20',
      daysInCurrentStage: 5,
      totalDays: 45,
      estimatedCompletion: '2024-03-15',
      stages: {
        initiation: {
          status: 'completed',
          completedDate: '2024-01-15',
          assignedTo: 'Computer Science Dept',
          documents: ['curriculum_proposal.pdf', 'rationale.pdf'],
          notes: 'Initial curriculum proposal submitted with detailed rationale.'
        },
        school_board: {
          status: 'completed',
          completedDate: '2024-01-18',
          assignedTo: 'Dr. John Smith (QA)',
          documents: ['school_board_review.pdf', 'duplicate_check.pdf'],
          notes: 'No duplicates found. Curriculum approved to proceed to Dean Committee.',
          feedback: 'Minor adjustments needed in course sequencing.'
        },
        dean_committee: {
          status: 'under_review',
          startedDate: '2024-01-19',
          assignedTo: 'Prof. Mary Johnson (Dean)',
          documents: ['dean_committee_review.pdf'],
          notes: 'Currently reviewing curriculum alignment with academic standards.',
          feedback: 'Waiting for external reviewer comments.',
          dueDate: '2024-01-25'
        },
        senate: {
          status: 'pending',
          assignedTo: 'Senate Committee',
          documents: [],
          notes: '',
          estimatedStart: '2024-01-26'
        },
        qa_review: {
          status: 'pending',
          assignedTo: 'QA Team',
          documents: [],
          notes: '',
          estimatedStart: '2024-02-05'
        },
        vice_chancellor: {
          status: 'pending',
          assignedTo: 'Vice Chancellor Office',
          documents: [],
          notes: '',
          estimatedStart: '2024-02-15'
        },
        cue_review: {
          status: 'pending',
          assignedTo: 'CUE External Team',
          documents: [],
          notes: '',
          estimatedStart: '2024-02-25'
        },
        site_inspection: {
          status: 'pending',
          assignedTo: 'CUE Inspectors',
          documents: [],
          notes: '',
          estimatedStart: '2024-03-10'
        }
      }
    },
    {
      id: 'CURR-2024-002',
      trackingId: 'TRK-BUS-2024-002',
      title: 'Master of Business Administration',
      school: 'School of Business',
      department: 'Business Administration',
      currentStage: 'senate',
      status: 'pending_approval',
      priority: 'medium',
      submittedDate: '2024-01-10',
      lastUpdated: '2024-01-22',
      daysInCurrentStage: 3,
      totalDays: 50,
      estimatedCompletion: '2024-03-20',
      stages: {
        initiation: { status: 'completed', completedDate: '2024-01-10' },
        school_board: { status: 'completed', completedDate: '2024-01-15' },
        dean_committee: { status: 'completed', completedDate: '2024-01-22' },
        senate: { 
          status: 'under_review', 
          startedDate: '2024-01-22',
          assignedTo: 'Senate Academic Committee',
          dueDate: '2024-01-30'
        },
        qa_review: { status: 'pending' },
        vice_chancellor: { status: 'pending' },
        cue_review: { status: 'pending' },
        site_inspection: { status: 'pending' }
      }
    },
    {
      id: 'CURR-2024-003',
      trackingId: 'TRK-MED-2024-003',
      title: 'Bachelor of Medicine and Bachelor of Surgery',
      school: 'School of Medicine',
      department: 'Medical Sciences',
      currentStage: 'qa_review',
      status: 'on_hold',
      priority: 'high',
      submittedDate: '2023-12-01',
      lastUpdated: '2024-01-18',
      daysInCurrentStage: 7,
      totalDays: 85,
      estimatedCompletion: '2024-04-15',
      stages: {
        initiation: { status: 'completed', completedDate: '2023-12-01' },
        school_board: { status: 'completed', completedDate: '2023-12-08' },
        dean_committee: { status: 'completed', completedDate: '2023-12-20' },
        senate: { status: 'completed', completedDate: '2024-01-10' },
        qa_review: { 
          status: 'on_hold', 
          startedDate: '2024-01-11',
          assignedTo: 'QA Medical Team',
          notes: 'Waiting for additional laboratory documentation.',
          dueDate: '2024-01-25'
        },
        vice_chancellor: { status: 'pending' },
        cue_review: { status: 'pending' },
        site_inspection: { status: 'pending' }
      }
    }
  ];

  // Load curricula data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCurricula(mockCurricula);
        showNotification('Curriculum tracking data loaded successfully', 'success');
      } catch (error) {
        console.error('Error loading tracking data:', error);
        showNotification('Failed to load tracking data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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

  // Get filtered curricula
  const filteredCurricula = curricula.filter(curriculum => {
    const matchesSearch = !filters.search || 
      curriculum.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      curriculum.trackingId.toLowerCase().includes(filters.search.toLowerCase());
    
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
      const estimatedDate = new Date(c.estimatedCompletion);
      return estimatedDate < new Date() && c.status !== 'completed';
    }).length
  };

  
  const handleStageAction = useCallback(async (curriculumId, stage, action, data = {}) => {
    try {
      setIsLoading(true);
      
     
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurricula(prev => prev.map(curriculum => {
        if (curriculum.id === curriculumId) {
          const updatedStages = { ...curriculum.stages };
          
          switch (action) {
            case 'approve':
              updatedStages[stage] = {
                ...updatedStages[stage],
                status: 'completed',
                completedDate: new Date().toISOString().split('T')[0],
                feedback: data.feedback || ''
              };
              
              // Move to next stage
              const nextStage = getNextStage(stage);
              if (nextStage && updatedStages[nextStage]) {
                updatedStages[nextStage] = {
                  ...updatedStages[nextStage],
                  status: 'under_review',
                  startedDate: new Date().toISOString().split('T')[0]
                };
              }
              break;
              
            case 'reject':
              updatedStages[stage] = {
                ...updatedStages[stage],
                status: 'rejected',
                feedback: data.feedback || '',
                rejectedDate: new Date().toISOString().split('T')[0]
              };
              break;
              
            case 'hold':
              updatedStages[stage] = {
                ...updatedStages[stage],
                status: 'on_hold',
                notes: data.notes || '',
                holdDate: new Date().toISOString().split('T')[0]
              };
              break;
              
            case 'add_notes':
              updatedStages[stage] = {
                ...updatedStages[stage],
                notes: data.notes || ''
              };
              break;
              
            case 'upload_documents':
              updatedStages[stage] = {
                ...updatedStages[stage],
                documents: [...(updatedStages[stage].documents || []), ...data.documents]
              };
              break;
          }
          
          return {
            ...curriculum,
            stages: updatedStages,
            lastUpdated: new Date().toISOString().split('T')[0],
            currentStage: getCurrentStage(updatedStages)
          };
        }
        return curriculum;
      }));
      
      showNotification(`Stage ${action} completed successfully`, 'success');
    } catch (error) {
      console.error('Error updating stage:', error);
      showNotification(`Failed to ${action} stage`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getNextStage = (currentStage) => {
    const stages = ['initiation', 'school_board', 'dean_committee', 'senate', 'qa_review', 'vice_chancellor', 'cue_review', 'site_inspection'];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  };

  const getCurrentStage = (stages) => {
    const stageOrder = ['initiation', 'school_board', 'dean_committee', 'senate', 'qa_review', 'vice_chancellor', 'cue_review', 'site_inspection'];
    
    for (const stage of stageOrder) {
      if (stages[stage] && ['under_review', 'pending', 'on_hold'].includes(stages[stage].status)) {
        return stage;
      }
    }
    
    return stageOrder[stageOrder.length - 1]; 
  };

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
          onRefresh={() => window.location.reload()}
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