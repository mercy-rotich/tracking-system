import React, { useState, useEffect } from 'react';
import './AdminCurriculaPage.css'
import NotificationBanner from '../../../components/Admin/AdminAllCurricula/NotificationBanner';
import PageHeader from '../../../components/Admin/AdminAllCurricula/PageHeader';
import StatsGrid from '../../../components/Admin/AdminAllCurricula/StatusGrid';
import FilterSection from '../../../components/Admin/AdminAllCurricula/FilterSection';
import CurriculumTable from '../../../components/Admin/AdminAllCurricula/CurriculumTable';
import SchoolsView from '../../../components/Admin/AdminAllCurricula/SchoolsView';
import CurriculumModal from '../../../components/Admin/AdminAllCurricula/CurriculumModal';
import DeleteConfirmationModal from '../../../components/Admin/AdminAllCurricula/DeleteConfirmationModal';
import curriculumService from '../../../services/curriculumService';
import { useCurriculumData } from '../../../hooks/useCurriculumData';
import { useFilters } from '../../../hooks/useFilters';
import { usePagination } from '../../../hooks/usePagination';

const AdminCurriculaPage = () => {
  const [viewMode, setViewMode] = useState('schools');
  const [isInitialized, setIsInitialized] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
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
    refreshData
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
    isSearching
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
    changePageSize
  } = usePagination();

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🔄 Initializing AdminCurriculaPage...');
        await loadSchoolsAndDepartments();
        await loadStatsOverview();
        setIsInitialized(true);
        console.log('✅ AdminCurriculaPage initialized');
      } catch (error) {
        console.error('❌ Error initializing AdminCurriculaPage:', error);
        showNotification('Failed to initialize page data', 'error');
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
      });
    }
  }, [
    currentPage, pageSize, searchTerm, selectedSchool, 
    selectedProgram, selectedDepartment, statusFilter, 
    sortBy, viewMode, isInitialized
  ]);
  useEffect(() => {
    if (currentPage !== 0 && viewMode === 'table') {
      setCurrentPage(0);
    }
  }, [searchTerm, selectedSchool, selectedProgram, selectedDepartment, statusFilter]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const getSchoolName = (schoolId) => {
    const school = schools.find(s => s.id?.toString() === schoolId?.toString());
    return school ? school.name : 'Unknown School';
  };

  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  };

  const getAvailableDepartments = () => {
    return departments.map(dept => dept.name).sort();
  };

  const handleViewModeChange = async (newMode) => {
    console.log('🔄 Changing view mode to:', newMode);
    setViewMode(newMode);
    
    if (newMode === 'schools' && (!schools || schools.length === 0)) {
      try {
        await loadSchoolsAndDepartments();
      } catch (error) {
        console.error('❌ Error in handleViewModeChange:', error);
        showNotification('Failed to load schools view data', 'error');
      }
    }
  };

  const handleEdit = (curriculum) => {
    setSelectedCurriculum(curriculum);
    setShowEditModal(true);
  };

  const handleDelete = (curriculum) => {
    setSelectedCurriculum(curriculum);
    setShowDeleteModal(true);
  };

  const handleApprove = async (curriculum) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshData();
      showNotification(`"${curriculum.title}" has been approved successfully!`, 'success');
    } catch (error) {
      showNotification('Failed to approve curriculum. Please try again.', 'error');
    }
  };

  const handleReject = async (curriculum) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshData();
      showNotification(`"${curriculum.title}" has been rejected.`, 'success');
    } catch (error) {
      showNotification('Failed to reject curriculum. Please try again.', 'error');
    }
  };

  const handleSaveCurriculum = async (formData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshData();
      const action = showAddModal ? 'added' : 'updated';
      showNotification(`Curriculum ${action} successfully!`, 'success');
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshData();
      showNotification(`"${selectedCurriculum.title}" has been deleted.`, 'success');
    } catch (error) {
      showNotification(`Failed to delete curriculum: ${error.message}`, 'error');
    } finally {
      setShowDeleteModal(false);
      setSelectedCurriculum(null);
    }
  };

  if (!isInitialized) {
    return (
      <div className='curricula-main-page'>
        <div className="curricula-page">
          <div className="content-section">
            <div className="curricula-loading-spinner">
              <div className="spinner"></div>
              <p>Initializing admin page...</p>
            </div>
          </div>
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

        <PageHeader onAddNew={() => setShowAddModal(true)} />

        <StatsGrid stats={stats} />

        <FilterSection
         
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          isSearching={isSearching}
          
          e
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          
          // Advanced filters (only for table view)
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
        />

        {/* Main Content */}
        {viewMode === 'table' ? (
          <CurriculumTable
            curricula={curricula}
            isLoading={isLoading}
            
            // Pagination
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
            
            // Actions
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            
            // Utilities
            getSchoolName={getSchoolName}
            getProgramName={getProgramName}
            onRefresh={refreshData}
          />
        ) : (
          <SchoolsView
            schools={schools}
            programs={programs}
            isLoading={isLoading}
            
            // Filters for data processing
            searchTerm={searchTerm}
            selectedSchool={selectedSchool}
            selectedProgram={selectedProgram}
            selectedDepartment={selectedDepartment}
            statusFilter={statusFilter}
            sortBy={sortBy}
            
            // Actions
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            onRefresh={refreshData}
            
            // Service
            curriculumService={curriculumService}
          />
        )}

        {/* Modals */}
        {(showAddModal || showEditModal) && (
          <CurriculumModal
            isOpen={showAddModal || showEditModal}
            isEdit={showEditModal}
            curriculum={selectedCurriculum}
            schools={schools}
            programs={programs}
            onSave={handleSaveCurriculum}
            onClose={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setSelectedCurriculum(null);
            }}
          />
        )}

        {showDeleteModal && selectedCurriculum && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            curriculum={selectedCurriculum}
            onConfirm={handleDeleteConfirm}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedCurriculum(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCurriculaPage;