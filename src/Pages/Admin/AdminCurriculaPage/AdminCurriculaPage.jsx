import React, { useState, useEffect } from 'react';
import './AdminCurriculaPage.css'
import NotificationBanner from '../../../components/Admin/AdminAllCurricula/NotificationBanner';
import PageHeader from '../../../components/Admin/AdminAllCurricula/PageHeader';
import StatsGrid from '../../../components/Admin/AdminAllCurricula/StatusGrid';
import FilterSection from '../../../components/Admin/AdminAllCurricula/FilterSection';
import CurriculumTable from '../../../components/Admin/AdminAllCurricula/CurriculumTable';
import SchoolsView from '../../../components/Admin/AdminAllCurricula/SchoolsView/SchoolsView';
import CurriculumModal from '../../../components/Admin/AdminAllCurricula/CurriculumModal';
import DeleteConfirmationModal from '../../../components/Admin/AdminAllCurricula/DeleteConfirmationModal';
import curriculumService from '../../../services/curriculumService';
import departmentService from '../../../services/departmentService';
import { useCurriculumData } from '../../../hooks/useCurriculumData';
import { useFilters } from '../../../hooks/useFilters';
import { usePagination } from '../../../hooks/usePagination';
import { useDepartments } from '../../../hooks/useDepartments';
import LoadingSpinner from '../../../components/common/LoadingSpinner';


const AdminCurriculaPage = () => {
  const [viewMode, setViewMode] = useState('schools');
  const [isInitialized, setIsInitialized] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [deleteType, setDeleteType] = useState('soft'); 

 
  const [expiringCurriculums, setExpiringCurriculums] = useState([]);
  const [showExpiringAlert, setShowExpiringAlert] = useState(false);

  const {
    curricula,
    schools,
    departments,
    programs,
    stats,
    isLoading,
    loadCurriculaData,
    loadSchoolsAndDepartments,
    loadStatsOverview,
    loadExpiringCurriculums,
    refreshData,
    findSchool,
    getSchoolName,
    toggleCurriculumStatus,
    putCurriculumUnderReview
  } = useCurriculumData();

  const {
    searchTerm,
    setSearchTerm,
    selectedSchool,
    setSelectedSchool,
    selectedProgram,
    setSelectedProgram,
    selectedDepartment,
    setSelectedDepartment,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    isSearching,
    resetFilters,
    hasActiveFilters
  } = useFilters();

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    updatePagination,
    setPageSize,
    totalElements,
    totalPages,
    hasNext,
    hasPrevious,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    changePageSize,
    resetToFirstPage
  } = usePagination();

  const {
    departments: allDepartments,
    loading: departmentsLoading,
    error: departmentsError,
    refetch: refetchDepartments,
    getDepartmentsBySchoolId,
    getDepartmentStatistics
  } = useDepartments(null, {
    autoLoad: true,
    enableSearch: false,
    size: 1000 
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsInitialized(false);
        
    
        await loadSchoolsAndDepartments();
        await loadStatsOverview();
        
        // Load expiring curriculums and show alert if any
        try {
          const expiring = await loadExpiringCurriculums();
          setExpiringCurriculums(expiring);
          if (expiring.length > 0) {
            setShowExpiringAlert(true);
            showNotification(`⚠️ ${expiring.length} curricula are expiring soon!`, 'warning');
          }
        } catch (expiringError) {
          console.warn('Could not load expiring curriculums:', expiringError);
        }
        
        if (viewMode === 'schools') {
          await refetchDepartments();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing AdminCurriculaPage:', error);
        showNotification('Failed to initialize page data. Some features may not work correctly.', 'error');
        setIsInitialized(true);
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    if (isInitialized && viewMode === 'table') {
      loadCurriculaData({
        currentPage,
        pageSize,
        searchTerm,
        selectedSchool,
        selectedProgram,
        selectedDepartment,
        statusFilter,
        sortBy
      }).then((result) => {
        if (result?.pagination) {
          updatePagination(result.pagination);
        }
      }).catch(error => {
        console.error('Error loading curricula:', error);
        showNotification('Failed to load curricula data', 'error');
      });
    }
  }, [
    currentPage, pageSize, searchTerm, selectedSchool,
    selectedProgram, selectedDepartment, statusFilter, 
    sortBy, viewMode, isInitialized
  ]);

  useEffect(() => {
    if (currentPage !== 0 && viewMode === 'table') {
      resetToFirstPage();
    }
  }, [searchTerm, selectedSchool, selectedProgram, selectedDepartment, statusFilter]);

  useEffect(() => {
    if (viewMode === 'schools' && isInitialized && !departmentsLoading && allDepartments.length === 0) {
      refetchDepartments();
    }
  }, [viewMode, isInitialized]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const getSchoolNameEnhanced = (schoolId) => {
    if (!schoolId) return 'Unknown School';
    
    const name = getSchoolName(schoolId);
    if (name !== 'Unknown School') return name;
    
    const curriculum = curricula.find(c => c.schoolId?.toString() === schoolId?.toString());
    if (curriculum?.schoolName) {
      return curriculum.schoolName;
    }
    
    return 'Unknown School';
  };

  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  };

  const getAvailableDepartments = () => {
    const departmentNames = new Set();
    
    departments.forEach(dept => {
      if (dept.name) departmentNames.add(dept.name);
    });
    
    allDepartments.forEach(dept => {
      if (dept.name) departmentNames.add(dept.name);
    });
    
    curricula.forEach(curriculum => {
      if (curriculum.department) departmentNames.add(curriculum.department);
    });
    
    return Array.from(departmentNames).sort();
  };

  const handleViewModeChange = async (newMode) => {
    setViewMode(newMode);
    
    if (newMode === 'schools') {
      try {
        if (!schools || schools.length === 0) {
          await loadSchoolsAndDepartments();
        }
        
        if (allDepartments.length === 0 && !departmentsLoading) {
          await refetchDepartments();
        }
      } catch (error) {
        console.error('Error in handleViewModeChange:', error);
        showNotification('Failed to load schools view data', 'error');
      }
    }
  };

  const handleEdit = (curriculum) => {
    setSelectedCurriculum(curriculum);
    setShowEditModal(true);
  };

  const handleDelete = (curriculum, isPermanent = false) => {
    setSelectedCurriculum(curriculum);
    setDeleteType(isPermanent ? 'permanent' : 'soft');
    setShowDeleteModal(true);
  };

  const handleApprove = async (curriculum) => {
    try {
      const result = await toggleCurriculumStatus(curriculum);
      await refreshData();
      
      if (viewMode === 'table') {
        await loadCurriculaData({
          currentPage, pageSize, searchTerm, selectedSchool,
          selectedProgram, selectedDepartment, statusFilter, sortBy
        }).then((result) => {
          if (result?.pagination) {
            updatePagination(result.pagination);
          }
        });
      }
      
      showNotification(`"${curriculum.title}" status has been toggled successfully!`, 'success');
    } catch (error) {
      showNotification('Failed to update curriculum status. Please try again.', 'error');
    }
  };

  const handleReject = async (curriculum) => {
    try {
      const curriculumData = {
        name: curriculum.title,
        code: curriculum.code,
        durationSemesters: curriculum.durationSemesters,
        schoolId: parseInt(curriculum.schoolId),
        departmentId: curriculum.departmentId,
        academicLevelId: curriculumService.mapProgramToAcademicLevel(curriculum.programId)
      };

      if (curriculum.effectiveDate) {
        curriculumData.effectiveDate = curriculum.effectiveDate;
      }
      if (curriculum.expiryDate) {
        curriculumData.expiryDate = curriculum.expiryDate;
      }

      const result = await curriculumService.inactivateCurriculum(curriculum.id, curriculumData);
      
      await refreshData();
      
      if (viewMode === 'table') {
        await loadCurriculaData({
          currentPage, pageSize, searchTerm, selectedSchool,
          selectedProgram, selectedDepartment, statusFilter, sortBy
        }).then((result) => {
          if (result?.pagination) {
            updatePagination(result.pagination);
          }
        });
      }
      
      showNotification(`"${curriculum.title}" has been rejected and inactivated.`, 'success');
    } catch (error) {
      showNotification('Failed to reject curriculum. Please try again.', 'error');
    }
  };

  const handlePutUnderReview = async (curriculum) => {
    try {
      const result = await putCurriculumUnderReview(curriculum);
      await refreshData();
      
      if (viewMode === 'table') {
        await loadCurriculaData({
          currentPage, pageSize, searchTerm, selectedSchool,
          selectedProgram, selectedDepartment, statusFilter, sortBy
        }).then((result) => {
          if (result?.pagination) {
            updatePagination(result.pagination);
          }
        });
      }
      
      showNotification(`"${curriculum.title}" has been put under review.`, 'success');
    } catch (error) {
      showNotification('Failed to put curriculum under review. Please try again.', 'error');
    }
  };

  const handleSaveCurriculum = async (formDataOrResult) => {
    try {
      await refreshData();
      
      if (viewMode === 'schools') {
        await refetchDepartments();
      }
      
      if (viewMode === 'table') {
        await loadCurriculaData({
          currentPage,
          pageSize,
          searchTerm,
          selectedSchool,
          selectedProgram,
          selectedDepartment,
          statusFilter,
          sortBy
        }).then((result) => {
          if (result?.pagination) {
            updatePagination(result.pagination);
          }
        });
      }
      
      const actionPast = showAddModal ? 'created' : 'updated';
      showNotification(`Curriculum ${actionPast} successfully!`, 'success');
      
    } catch (error) {
      showNotification(`Failed to save curriculum: ${error.message}`, 'error');
    } finally {
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedCurriculum(null);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedCurriculum) {
        throw new Error('No curriculum selected for deletion');
      }

      let result;
      if (deleteType === 'permanent') {
        result = await curriculumService.deleteCurriculumPermanently(selectedCurriculum.id);
      } else {
        const curriculumData = {
          name: selectedCurriculum.title,
          code: selectedCurriculum.code,
          durationSemesters: selectedCurriculum.durationSemesters,
          schoolId: parseInt(selectedCurriculum.schoolId),
          departmentId: selectedCurriculum.departmentId,
          academicLevelId: curriculumService.mapProgramToAcademicLevel(selectedCurriculum.programId)
        };

        if (selectedCurriculum.effectiveDate) {
          curriculumData.effectiveDate = new Date(selectedCurriculum.effectiveDate).toISOString();
        }
        if (selectedCurriculum.expiryDate) {
          curriculumData.expiryDate = new Date(selectedCurriculum.expiryDate).toISOString();
        }

        result = await curriculumService.inactivateCurriculum(selectedCurriculum.id, curriculumData);
      }

      await refreshData();
      
      if (viewMode === 'schools') {
        await refetchDepartments();
      }
      
      const actionText = deleteType === 'permanent' ? 'permanently deleted' : 'inactivated';
      showNotification(`"${selectedCurriculum.title}" has been ${actionText}.`, 'success');
      
    } catch (error) {
      const actionText = deleteType === 'permanent' ? 'permanently delete' : 'inactivate';
      showNotification(`Failed to ${actionText} curriculum: ${error.message}`, 'error');
    } finally {
      setShowDeleteModal(false);
      setSelectedCurriculum(null);
      setDeleteType('soft');
    }
  };

  const handleRefreshData = async () => {
    try {
      await refreshData();
      
      if (viewMode === 'schools') {
        await refetchDepartments();
      }
      
      try {
        const expiring = await loadExpiringCurriculums();
        setExpiringCurriculums(expiring);
      } catch (expiringError) {
      }
      
      showNotification('Data refreshed successfully', 'success');
    } catch (error) {
      showNotification('Failed to refresh data', 'error');
    }
  };

  const findSchoolEnhanced = (schoolId) => {
    const school = findSchool ? findSchool(schoolId) : null;
    if (school) return school;
    
    return schools.find(s => s.id === schoolId || s.code === schoolId);
  };

  const handleViewExpiringCurriculums = () => {
    if (expiringCurriculums.length > 0) {
      setViewMode('table');
      showNotification(`Viewing ${expiringCurriculums.length} expiring curricula`, 'info');
    }
    setShowExpiringAlert(false);
  };

  const dismissExpiringAlert = () => {
    setShowExpiringAlert(false);
  };

  if (!isInitialized || (isLoading && !curricula.length)) {
    return (
      <div className='curricula-main-page'>
        <div className="curricula-page">
          <LoadingSpinner 
            message="Loading Curricula System..." 
            subtext="Initializing dashboard and fetching data..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className='curricula-main-page'>
      <div className="curricula-page">
        <NotificationBanner 
          notification={notification}
          onClose={() => setNotification({ show: false, message: '', type: '' })}
        />

        {/* Expiring Curriculums Alert */}
        {showExpiringAlert && expiringCurriculums.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fas fa-clock" style={{ color: '#d97706', fontSize: '1.25rem' }}></i>
              <div>
                <strong style={{ color: '#92400e' }}>
                  {expiringCurriculums.length} Curricula Expiring Soon
                </strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#d97706' }}>
                  Some curricula are approaching their expiry dates and may need attention.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-sm"
                onClick={handleViewExpiringCurriculums}
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#92400e'
                }}
              >
                <i className="fas fa-eye"></i>
                View Details
              </button>
              <button 
                onClick={dismissExpiringAlert}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#d97706',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}

        <PageHeader onAddNew={() => setShowAddModal(true)} />

        <StatsGrid stats={stats} />

        <FilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          isSearching={isSearching}
          
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          
          showAdvancedFilters={viewMode === 'table'}
          selectedSchool={selectedSchool}
          setSelectedSchool={setSelectedSchool}
          selectedProgram={selectedProgram}
          setSelectedProgram={setSelectedProgram}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          sortBy={sortBy}
          setSortBy={setSortBy}
          
          schools={schools}
          programs={programs}
          departments={getAvailableDepartments()}
          
          resetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {viewMode === 'table' ? (
          <CurriculumTable
            curricula={curricula}
            isLoading={isLoading}
            
            currentPage={currentPage}
            pageSize={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onPageChange={goToPage}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
            onPageSizeChange={changePageSize}
            
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            onPutUnderReview={handlePutUnderReview}
            
            getSchoolName={getSchoolNameEnhanced}
            getProgramName={getProgramName}
            onRefresh={handleRefreshData}
          />
        ) : (
          <SchoolsView
            schools={schools}
            programs={programs}
            isLoading={isLoading}
            
            searchTerm={searchTerm}
            selectedSchool={selectedSchool}
            selectedProgram={selectedProgram}
            selectedDepartment={selectedDepartment}
            statusFilter={statusFilter}
            sortBy={sortBy}
            
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            onPutUnderReview={handlePutUnderReview}
            onRefresh={handleRefreshData}
            
            curriculumService={curriculumService}
            departmentService={departmentService}
            getSchoolName={getSchoolNameEnhanced}
            findSchool={findSchoolEnhanced}
            
            allDepartments={allDepartments}
            departmentsLoading={departmentsLoading}
            departmentsError={departmentsError}
            getDepartmentsBySchoolId={getDepartmentsBySchoolId}
            getDepartmentStatistics={getDepartmentStatistics}
          />
        )}

        {/* Add/Edit Modal with Enhanced Department Loading */}
        {(showAddModal || showEditModal) && (
          <CurriculumModal
            isOpen={showAddModal || showEditModal}
            isEdit={showEditModal}
            curriculum={selectedCurriculum}
            schools={schools}
            programs={programs}
            departments={allDepartments} 
            onSave={handleSaveCurriculum}
            onClose={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setSelectedCurriculum(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedCurriculum && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            curriculum={selectedCurriculum}
            deleteType={deleteType}
            onConfirm={handleDeleteConfirm}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedCurriculum(null);
              setDeleteType('soft');
            }}
          />
        )}
        
      </div>
    </div>
  );
};

export default AdminCurriculaPage;