import React, { useState, useEffect } from 'react';
import './AdminCurriculaPage.css';
import NotificationBanner from '../../../components/Admin/AdminAllCurricula/NotificationBanner';
import PageHeader from '../../../components/Admin/AdminAllCurricula/PageHeader';
import StatsGrid from '../../../components/Admin/AdminAllCurricula/StatusGrid';
import FiltersSection from '../../../components/Admin/AdminAllCurricula/FilterSection';
import CurriculumModal from '../../../components/Admin/AdminAllCurricula/CurriculumModal';
import DeleteConfirmationModal from '../../../components/Admin/AdminAllCurricula/DeleteConfirmationModal';
import { mockCurriculaData, mockSchools, mockPrograms } from '../../../components/Admin/AdminAllCurricula/MockData';
import { getStatusBadge } from '../../../components/Admin/AdminAllCurricula/BadgeComponents';

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
  const [viewMode, setViewMode] = useState('schools'); 
  const [expandedSchools, setExpandedSchools] = useState(new Set());
  const [selectedProgramView, setSelectedProgramView] = useState(null);
  const [showingCurriculaFor, setShowingCurriculaFor] = useState(null);

  const getSchoolName = (schoolId) => {
    const school = mockSchools.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };

  const getProgramName = (programId) => {
    const program = mockPrograms.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  };

 
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

   
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdDate) - new Date(a.createdDate);
        case 'oldest':
          return new Date(a.createdDate) - new Date(b.createdDate);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'department':
          return a.department.localeCompare(b.department);
        default:
          return 0;
      }
    });

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
        id: `CUR-${String(curricula.length + 1).padStart(3, '0')}`,
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

 
  const toggleSchool = (schoolId) => {
    const newExpanded = new Set(expandedSchools);
    if (newExpanded.has(schoolId)) {
      newExpanded.delete(schoolId);
      
      if (showingCurriculaFor && showingCurriculaFor.schoolId === schoolId) {
        setShowingCurriculaFor(null);
        setSelectedProgramView(null);
      }
    } else {
      newExpanded.add(schoolId);
    }
    setExpandedSchools(newExpanded);
  };

  
  const handleProgramClick = (schoolId, programId) => {
    setShowingCurriculaFor({ schoolId, programId });
    setSelectedProgramView({ schoolId, programId });
  };

  // Get curricula for specific school and program
  const getCurriculaForProgram = (schoolId, programId) => {
    return filteredCurricula.filter(c => c.schoolId === schoolId && c.programId === programId);
  };

  // Get programs for a school with curriculum counts
  const getProgramsForSchool = (schoolId) => {
    const schoolCurricula = filteredCurricula.filter(c => c.schoolId === schoolId);
    
    return mockPrograms.map(program => {
      const programCurricula = schoolCurricula.filter(c => c.programId === program.id);
      const departments = [...new Set(programCurricula.map(c => c.department))];
      
      return {
        ...program,
        count: programCurricula.length,
        departments: departments.length
      };
    }).filter(program => program.count > 0);
  };

  const getSchoolStats = (schoolId) => {
    const schoolCurricula = filteredCurricula.filter(c => c.schoolId === schoolId);
    const departments = [...new Set(schoolCurricula.map(c => c.department))];
    
    return {
      total: schoolCurricula.length,
      departments: departments.length
    };
  };

  const stats = {
    total: curricula.length,
    approved: curricula.filter(c => c.status === 'approved').length,
    pending: curricula.filter(c => c.status === 'pending').length,
    draft: curricula.filter(c => c.status === 'draft').length,
    rejected: curricula.filter(c => c.status === 'rejected').length
  };

  // Render actions for curriculum table
  const renderCurriculumActions = (curriculum) => {
    if (curriculum.status === 'pending') {
      return (
        <div className="curricula-table-actions">
          <button 
            className="curricula-table-action-btn curricula-table-approve"
            onClick={() => handleApprove(curriculum)}
            disabled={isLoading}
            title="Approve"
          >
            <i className="fas fa-check"></i>
          </button>
          <button 
            className="curricula-table-action-btn curricula-table-reject"
            onClick={() => handleReject(curriculum)}
            disabled={isLoading}
            title="Reject"
          >
            <i className="fas fa-times"></i>
          </button>
          <button 
            className="curricula-table-action-btn curricula-table-view"
            onClick={() => handleEdit(curriculum)}
            disabled={isLoading}
            title="Edit"
          >
            <i className="fas fa-edit"></i>
            Edit
          </button>
        </div>
      );
    }

    return (
      <div className="curricula-table-actions">
        <button 
          className="curricula-table-action-btn curricula-table-view"
          onClick={() => handleEdit(curriculum)}
          disabled={isLoading}
          title="Edit"
        >
          <i className="fas fa-edit"></i>
          Edit
        </button>
        <button 
          className="curricula-table-action-btn curricula-table-delete"
          onClick={() => handleDelete(curriculum)}
          disabled={isLoading}
          title="Delete"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    );
  };

  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  };

  
  const renderAllCurriculaTable = () => {
    const enrichedCurricula = filteredCurricula.map(curriculum => ({
      ...curriculum,
      schoolName: getSchoolName(curriculum.schoolId),
      programName: getProgramName(curriculum.programId)
    }));

    if (isLoading) {
      return (
        <div className="content-section">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      );
    }

    if (enrichedCurricula.length === 0) {
      return (
        <div className="empty-state">
          <i className="fas fa-book-open"></i>
          <h3>No curricula found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      );
    }

    return (
      <div className="curricula-table-container">
        <div className="curricula-table-wrapper">
          <table className="curricula-table">
            <thead className="curricula-table-header">
              <tr>
                <th className="curricula-table-th curricula-table-th-title">Curriculum Title</th>
                <th className="curricula-table-th curricula-table-th-school">School</th>
                <th className="curricula-table-th curricula-table-th-department">Department</th>
                <th className="curricula-table-th curricula-table-th-status">Status</th>
                <th className="curricula-table-th curricula-table-th-updated">Last Updated</th>
                <th className="curricula-table-th curricula-table-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody className="curricula-table-body">
              {enrichedCurricula.map((curriculum) => (
                <tr key={curriculum.id} className="curricula-table-row">
                  <td className="curricula-table-td curricula-table-td-title">
                    <div className="curricula-table-title-content">
                      <span className="curricula-table-title-text">{curriculum.title}</span>
                      <span className="curricula-table-title-id">{curriculum.id}</span>
                    </div>
                  </td>
                  <td className="curricula-table-td curricula-table-td-school">
                    {curriculum.schoolName}
                  </td>
                  <td className="curricula-table-td curricula-table-td-department">
                    {curriculum.department}
                  </td>
                  <td className="curricula-table-td curricula-table-td-status">
                    {getStatusBadge(curriculum.status)}
                  </td>
                  <td className="curricula-table-td curricula-table-td-updated">
                    <div className="curricula-table-date-content">
                      <span className="curricula-table-date-main">{formatDate(curriculum.lastModified)}</span>
                      <span className="curricula-table-date-relative">{getTimeSince(curriculum.lastModified)}</span>
                    </div>
                  </td>
                  <td className="curricula-table-td curricula-table-td-actions">
                    {renderCurriculumActions(curriculum)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {enrichedCurricula.length > 0 && (
          <div className="curricula-table-footer">
            <p className="curricula-table-footer-text">
              Showing {enrichedCurricula.length} of {curricula.length} curricula
              {enrichedCurricula.length !== curricula.length && (
                <span> (filtered)</span>
              )}
            </p>
          </div>
        )}
      </div>
    );
  };

 
  const renderCurriculaTable = () => {
    if (!showingCurriculaFor) return null;

    const programCurricula = getCurriculaForProgram(showingCurriculaFor.schoolId, showingCurriculaFor.programId);
    const school = mockSchools.find(s => s.id === showingCurriculaFor.schoolId);
    const program = mockPrograms.find(p => p.id === showingCurriculaFor.programId);

    if (programCurricula.length === 0) {
      return (
        <div className="curricula-table-container" style={{ marginTop: '2rem' }}>
          <div className="curricula-table-program-header">
            <div className="curricula-table-program-info">
              <h3 className="curricula-table-program-title">
                {program?.name} - {school?.name}
              </h3>
              <div className="curricula-table-program-actions">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => setShowingCurriculaFor(null)}
                >
                  <i className="fas fa-arrow-left"></i>
                  Back to Schools
                </button>
              </div>
            </div>
          </div>
          <div className="empty-state">
            <i className="fas fa-book-open"></i>
            <h3>No curricula found</h3>
            <p>No curricula available for this program with current filters.</p>
          </div>
        </div>
      );
    }

   
    const groupedByDepartment = programCurricula.reduce((acc, curriculum) => {
      const department = curriculum.department;
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(curriculum);
      return acc;
    }, {});

    const departmentNames = Object.keys(groupedByDepartment).sort();
    const totalDepartments = departmentNames.length;

    return (
      <div className="curricula-table-container" style={{ marginTop: '2rem' }}>
        <div className="curricula-table-program-header">
          <div className="curricula-table-program-info">
            <h3 className="curricula-table-program-title">
              {program?.name} - {school?.name}
            </h3>
            <p className="curricula-table-program-subtitle">
              {programCurricula.length} curricula across {totalDepartments} departments
            </p>
          </div>
          <div className="curricula-table-program-actions">
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => setShowingCurriculaFor(null)}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Schools
            </button>
            <button className="btn btn-sm btn-outline">
              <i className="fas fa-download"></i>
              Export
            </button>
          </div>
        </div>

        {/* Render each department section */}
        <div className="admin-departments-container">
          {departmentNames.map((departmentName) => {
            const departmentCurricula = groupedByDepartment[departmentName];
            
            return (
              <div key={departmentName} className="admin-department-section">
                {/* Department Header */}
                <div className="admin-department-header">
                  <div className="admin-department-info">
                    <i className="fas fa-layer-group admin-department-icon"></i>
                    <span className="admin-department-name">{departmentName}</span>
                  </div>
                  <div className="admin-department-count">
                    {departmentCurricula.length}
                  </div>
                </div>

                {/* Department Curricula Table */}
                <div className="admin-department-content">
                  <div className="curricula-table-wrapper">
                    <table className="curricula-table">
                      <thead className="curricula-table-header">
                        <tr>
                          <th className="curricula-table-th">Curriculum Title</th>
                          <th className="curricula-table-th">Status</th>
                          <th className="curricula-table-th">Last Updated</th>
                          <th className="curricula-table-th">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="curricula-table-body">
                        {departmentCurricula.map((curriculum) => (
                          <tr key={curriculum.id} className="curricula-table-row">
                            <td className="curricula-table-td">
                              <div className="curricula-table-title-content">
                                <span className="curricula-table-title-text">{curriculum.title}</span>
                                <span className="curricula-table-title-id">{curriculum.id}</span>
                              </div>
                            </td>
                            <td className="curricula-table-td">
                              {getStatusBadge(curriculum.status)}
                            </td>
                            <td className="curricula-table-td">
                              <div className="curricula-table-date-content">
                                <span className="curricula-table-date-main">{formatDate(curriculum.lastModified)}</span>
                                <span className="curricula-table-date-relative">{getTimeSince(curriculum.lastModified)}</span>
                              </div>
                            </td>
                            <td className="curricula-table-td">
                              {renderCurriculumActions(curriculum)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="curricula-table-footer">
          <p className="curricula-table-footer-text">
            Showing {programCurricula.length} curricula across {totalDepartments} departments for {program?.name} in {school?.name}
          </p>
        </div>
      </div>
    );
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

        {/* View Mode Toggle */}
        <div className="view-mode-toggle">
          <div className="view-toggle-buttons">
            <button 
              className={`view-toggle-btn ${viewMode === 'schools' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('schools');
                setShowingCurriculaFor(null);
              }}
            >
              <i className="fas fa-sitemap"></i>
              Schools View
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('table');
                setShowingCurriculaFor(null);
              }}
            >
              <i className="fas fa-table"></i>
              All Curricula
            </button>
          </div>
        </div>

        {/* Basic Filters - Show in both views */}
        <FiltersSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          viewMode={viewMode}
          setViewMode={() => {}} 
        />

        {/* Advanced Filters - Only show in table view */}
        {viewMode === 'table' && (
          <div className="advanced-filters-section">
            <div className="advanced-filters-content">
              <div className="filter-group">
                <label className="filter-label">School</label>
                <select 
                  className="filter-select"
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                >
                  <option value="all">All Schools</option>
                  {mockSchools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Program</label>
                <select 
                  className="filter-select"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                >
                  <option value="all">All Programs</option>
                  {mockPrograms.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Department</label>
                <select 
                  className="filter-select"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {getAvailableDepartments().map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select 
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="department">Department A-Z</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'table' ? (
          renderAllCurriculaTable()
        ) : (
          
          showingCurriculaFor ? (
            renderCurriculaTable()
          ) : (
            /* Schools Overview */
            <div className="admin-schools-section">
              <div className="admin-section-header">
                <h2 className="admin-section-title">
                  <i className="fas fa-university"></i>
                  Academic Schools
                </h2>
                <span className="admin-schools-count">
                  {mockSchools.length} schools found
                </span>
              </div>
              
              <div className="admin-schools-list">
                {mockSchools.map((school) => {
                  const schoolStats = getSchoolStats(school.id);
                  const schoolPrograms = getProgramsForSchool(school.id);
                  const isExpanded = expandedSchools.has(school.id);

                  if (schoolStats.total === 0) return null;

                  return (
                    <div key={school.id} className="admin-school-item">
                      <div 
                        className="admin-school-header" 
                        onClick={() => toggleSchool(school.id)}
                      >
                        <div className="admin-school-info">
                          <div className="admin-school-icon">
                            <i className={`fas fa-${school.icon}`}></i>
                          </div>
                          <div className="admin-school-details">
                            <h3>School of {school.name}</h3>
                            <div className="admin-school-meta">
                              {schoolStats.departments} departments • {schoolStats.total} curricula
                            </div>
                          </div>
                        </div>
                        <div className="admin-school-stats">
                          <span className="admin-stat-badge">{schoolStats.total}</span>
                          <i className={`fas fa-chevron-down admin-expand-icon ${isExpanded ? 'expanded' : ''}`}></i>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="admin-programs-container">
                          <div className="admin-programs-grid">
                            {schoolPrograms.map(program => (
                              <div 
                                key={program.id} 
                                className="admin-program-card"
                                onClick={() => handleProgramClick(school.id, program.id)}
                              >
                                <div className="admin-program-header">
                                  <span className="admin-program-name">{program.name}</span>
                                  <span className="admin-program-count">{program.count}</span>
                                </div>
                                <div className="admin-program-meta">
                                  {program.departments} departments
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

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