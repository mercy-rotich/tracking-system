import React, { useState, useEffect } from 'react';
import './AdminCurriculaPage.css';
import NotificationBanner from '../../../components/Admin/AdminAllCurricula/NotificationBanner';
import PageHeader from '../../../components/Admin/AdminAllCurricula/PageHeader';
import StatsGrid from '../../../components/Admin/AdminAllCurricula/StatusGrid';
import FiltersSection from '../../../components/Admin/AdminAllCurricula/FilterSection';
import CurriculaGrid from '../../../components/Admin/AdminAllCurricula/CurriculaGrid';
import CurriculumModal from '../../../components/Admin/AdminAllCurricula/CurriculumModal';
import DeleteConfirmationModal from '../../../components/Admin/AdminAllCurricula/DeleteConfirmationModal';
import { mockCurriculaData } from '../../../components/Admin/AdminAllCurricula/MockData';

const AdminCurriculaPage = () => {
  const [curricula, setCurricula] = useState([]);
  const [filteredCurricula, setFilteredCurricula] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [viewMode, setViewMode] = useState('grid');

  
  useEffect(() => {
    setCurricula(mockCurriculaData);
    setFilteredCurricula(mockCurriculaData);
  }, []);

  
  useEffect(() => {
    let filtered = curricula.filter(curriculum => {
      const matchesSearch = curriculum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          curriculum.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          curriculum.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || curriculum.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || curriculum.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdDate) - new Date(a.createdDate);
        case 'oldest':
          return new Date(a.createdDate) - new Date(b.createdDate);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'enrollments':
          return b.enrollments - a.enrollments;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredCurricula(filtered);
  }, [curricula, searchTerm, statusFilter, categoryFilter, sortBy]);

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
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <CurriculaGrid
        curricula={filteredCurricula}
        totalCount={curricula.length}
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