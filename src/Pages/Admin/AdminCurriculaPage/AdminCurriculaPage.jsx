import React, { useState, useEffect } from 'react';
import './AdminCurriculaPage.css';
import NotificationBanner from '../../../components/Admin/AdminAllCurricula/NotificationBanner';
import PageHeader from '../../../components/Admin/AdminAllCurricula/PageHeader';
import StatsGrid from '../../../components/Admin/AdminAllCurricula/StatusGrid';
import FiltersSection from '../../../components/Admin/AdminAllCurricula/FilterSection';
import CurriculaGrid from '../../../components/Admin/AdminAllCurricula/CurriculaGrid';
import CurriculumModal from '../../../components/Admin/AdminAllCurricula/CurriculumModal';
import DeleteConfirmationModal from '../../../components/Admin/AdminAllCurricula/DeleteConfirmationModal';
import { mockCurriculaData,mockSchools,mockPrograms } from '../../../components/Admin/AdminAllCurricula/MockData';
import SchoolNavigation from '../../../components/Admin/AdminAllCurricula/SchoolNavigation';


const AdminCurriculaPage = () => {
  const [curricula, setCurricula] = useState(mockCurriculaData);
  const [filteredCurricula, setFilteredCurricula] = useState(mockCurriculaData);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  
  
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [viewMode, setViewMode] = useState('grid');

  
  const getSchoolName = (schoolId) => {
    const school = mockSchools.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };

  const getProgramName = (programId) => {
    const program = mockPrograms.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  };

  // Get unique departments for the selected school and program
  const getAvailableDepartments = () => {
    let filtered = curricula;
    
    if (selectedSchool !== 'all') {
      filtered = filtered.filter(c => c.schoolId === selectedSchool);
    }
    
    if (selectedProgram !== 'all') {
      filtered = filtered.filter(c => c.programId === selectedProgram);
    }
    
    const departments = [...new Set(filtered.map(c => c.department))];
    return departments.sort();
  };

  
  useEffect(() => {
    setCurricula(mockCurriculaData);
    setFilteredCurricula(mockCurriculaData);
  }, []);

  
  useEffect(() => {
    let filtered = curricula;

    if (searchTerm) {
      filtered = filtered.filter(curriculum => 
        curriculum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curriculum.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSchoolName(curriculum.schoolId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProgramName(curriculum.programId).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    
    if (selectedSchool !== 'all') {
      filtered = filtered.filter(curriculum => curriculum.schoolId === selectedSchool);
    }

    
    if (selectedProgram !== 'all') {
      filtered = filtered.filter(curriculum => curriculum.programId === selectedProgram);
    }

    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(curriculum => curriculum.department === selectedDepartment);
    }

    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(curriculum => curriculum.status === statusFilter);
    }
    
    

    setFilteredCurricula(filtered);
  }, [curricula, searchTerm, selectedSchool, selectedProgram, selectedDepartment, statusFilter, sortBy]);




  useEffect(() => {
    if (selectedSchool !== 'all') {
      setSelectedDepartment('all');
    }
  }, [selectedSchool]);

  useEffect(() => {
    if (selectedProgram !== 'all') {
      setSelectedDepartment('all');
    }
  }, [selectedProgram]);




  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
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
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurricula(prev => prev.map(c => 
        c.id === curriculum.id ? { ...c, status: 'approved' } : c
      ));
      showNotification(`"${curriculum.title}" has been approved successfully!`, 'success');
    } catch (error) {
      showNotification('Failed to approve curriculum. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (curriculum) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurricula(prev => prev.map(c => 
        c.id === curriculum.id ? { ...c, status: 'rejected' } : c
      ));
      showNotification(`"${curriculum.title}" has been rejected.`, 'success');
    } catch (error) {
      showNotification('Failed to reject curriculum. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurriculum = (formData) => {
    if (showAddModal) {
      const newCurriculum = {
        id: curricula.length + 1,
        ...formData,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        enrollments: 0,
        rating: 0
      };
      setCurricula(prev => [...prev, newCurriculum]);
      showNotification('Curriculum added successfully!', 'success');
    } else {
      setCurricula(prev => prev.map(c => 
        c.id === selectedCurriculum.id ? { ...c, ...formData, lastModified: new Date().toISOString().split('T')[0] } : c
      ));
      showNotification('Curriculum updated successfully!', 'success');
    }
    
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedCurriculum(null);
  };

  const handleDeleteConfirm = () => {
    setCurricula(prev => prev.filter(c => c.id !== selectedCurriculum.id));
    showNotification(`"${selectedCurriculum.title}" has been deleted.`, 'success');
    setShowDeleteModal(false);
    setSelectedCurriculum(null);
  };

  const stats = {
    total: curricula.length,
    approved: curricula.filter(c => c.status === 'approved').length,
    pending: curricula.filter(c => c.status === 'pending').length,
    draft: curricula.filter(c => c.status === 'draft').length,
    rejected: curricula.filter(c => c.status === 'rejected').length
  };

  return (
    <div className='curricula-main-page'>
    <div className="curricula-page">
      <NotificationBanner 
        notification={notification}
        onClose={() => setNotification({ show: false, message: '', type: '' })}
      />

      <PageHeader onAddNew={() => setShowAddModal(true)} />

      <StatsGrid stats={stats} />

      

      <FiltersSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}

        viewMode={viewMode}
        setViewMode={setViewMode}
      />

<SchoolNavigation
          schools={mockSchools}
          programs={mockPrograms}
          departments={getAvailableDepartments()}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedSchool={selectedSchool}
          setSelectedSchool={setSelectedSchool}
          selectedProgram={selectedProgram}
          setSelectedProgram={setSelectedProgram}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />


<CurriculaGrid
          curricula={filteredCurricula.map(curriculum => ({
            ...curriculum,
            schoolName: getSchoolName(curriculum.schoolId),
            programName: getProgramName(curriculum.programId)
          }))}
          totalCount={curricula.length}
          filteredCount={filteredCurricula.length}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onApprove={handleApprove}
          onReject={handleReject}
        />


{(showAddModal || showEditModal) && (
          <CurriculumModal
            isOpen={showAddModal || showEditModal}
            isEdit={showEditModal}
            curriculum={selectedCurriculum}
            schools={mockSchools}
            programs={mockPrograms}
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