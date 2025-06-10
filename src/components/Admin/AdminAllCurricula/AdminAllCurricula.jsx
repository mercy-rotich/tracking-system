import React, { useState, useEffect } from 'react';
import './AdminAllCurricula.css'

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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Mock data
  useEffect(() => {
    const mockCurricula = [
      {
        id: 1,
        title: "Advanced JavaScript Programming",
        category: "Programming",
        status: "approved",
        createdDate: "2024-01-15",
        lastModified: "2024-02-10",
        author: "Dr. Sarah Johnson",
        enrollments: 156,
        rating: 4.8,
        duration: "12 weeks",
        difficulty: "Advanced",
        description: "Comprehensive JavaScript course covering ES6+, async programming, and modern frameworks."
      },
      {
        id: 2,
        title: "Digital Marketing Fundamentals",
        category: "Marketing",
        status: "pending",
        createdDate: "2024-02-01",
        lastModified: "2024-02-15",
        author: "Mark Williams",
        enrollments: 89,
        rating: 4.5,
        duration: "8 weeks",
        difficulty: "Beginner",
        description: "Learn the basics of digital marketing including SEO, social media, and email marketing."
      },
      {
        id: 3,
        title: "Data Science with Python",
        category: "Data Science",
        status: "approved",
        createdDate: "2024-01-20",
        lastModified: "2024-02-05",
        author: "Dr. Michael Chen",
        enrollments: 234,
        rating: 4.9,
        duration: "16 weeks",
        difficulty: "Intermediate",
        description: "Complete data science curriculum using Python, pandas, and machine learning libraries."
      },
      {
        id: 4,
        title: "UX/UI Design Principles",
        category: "Design",
        status: "draft",
        createdDate: "2024-02-10",
        lastModified: "2024-02-18",
        author: "Emily Rodriguez",
        enrollments: 67,
        rating: 4.6,
        duration: "10 weeks",
        difficulty: "Intermediate",
        description: "Learn user experience and interface design principles with hands-on projects."
      },
      {
        id: 5,
        title: "Business Strategy & Planning",
        category: "Business",
        status: "rejected",
        createdDate: "2024-01-25",
        lastModified: "2024-02-12",
        author: "Robert Thompson",
        enrollments: 45,
        rating: 4.2,
        duration: "6 weeks",
        difficulty: "Beginner",
        description: "Strategic planning and business development for entrepreneurs and managers."
      }
    ];
    setCurricula(mockCurricula);
    setFilteredCurricula(mockCurricula);
  }, []);

  // Filter and sort curricula
  useEffect(() => {
    let filtered = curricula.filter(curriculum => {
      const matchesSearch = curriculum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          curriculum.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          curriculum.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || curriculum.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || curriculum.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort curricula
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { class: 'status-approved', icon: 'fa-check-circle', text: 'Approved' },
      pending: { class: 'status-pending', icon: 'fa-clock', text: 'Pending Review' },
      draft: { class: 'status-draft', icon: 'fa-edit', text: 'Draft' },
      rejected: { class: 'status-rejected', icon: 'fa-times-circle', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`status-badge ${config.class}`}>
        <i className={`fas ${config.icon}`}></i>
        {config.text}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      Beginner: { class: 'difficulty-beginner', color: '#00BF63' },
      Intermediate: { class: 'difficulty-intermediate', color: '#f0b41c' },
      Advanced: { class: 'difficulty-advanced', color: '#1a3a6e' }
    };
    
    const config = difficultyConfig[difficulty] || difficultyConfig.Beginner;
    return (
      <span className={`difficulty-badge ${config.class}`} style={{ backgroundColor: config.color }}>
        {difficulty}
      </span>
    );
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
      // Simulate API call
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
      // Simulate API call
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

  const stats = {
    total: curricula.length,
    approved: curricula.filter(c => c.status === 'approved').length,
    pending: curricula.filter(c => c.status === 'pending').length,
    draft: curricula.filter(c => c.status === 'draft').length,
    rejected: curricula.filter(c => c.status === 'rejected').length
  };

  return (
    <div className="curricula-page">

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification({ show: false, message: '', type: '' })}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">All Curricula</h1>
            <p className="page-subtitle">Manage and oversee all educational curricula in the system</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => window.print()}
            >
              <i className="fas fa-print"></i>
              Print Report
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <i className="fas fa-plus"></i>
              Add New Curriculum
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-header">
            <span className="stat-title">Total Curricula</span>
            <div className="stat-icon total">
              <i className="fas fa-book"></i>
            </div>
          </div>
          <h3 className="stat-value">{stats.total}</h3>
        </div>
        <div className="stat-card approved">
          <div className="stat-header">
            <span className="stat-title">Approved</span>
            <div className="stat-icon approved">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <h3 className="stat-value">{stats.approved}</h3>
        </div>
        <div className="stat-card pending">
          <div className="stat-header">
            <span className="stat-title">Pending Review</span>
            <div className="stat-icon pending">
              <i className="fas fa-clock"></i>
            </div>
          </div>
          <h3 className="stat-value">{stats.pending}</h3>
        </div>
        <div className="stat-card rejected">
          <div className="stat-header">
            <span className="stat-title">Rejected</span>
            <div className="stat-icon rejected">
              <i className="fas fa-times-circle"></i>
            </div>
          </div>
          <h3 className="stat-value">{stats.rejected}</h3>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header">
          <h2 className="filters-title">Filter & Search</h2>
          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <i className="fas fa-th"></i>
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Search Curricula</label>
            <input
              type="text"
              className="search-input"
              placeholder="Search by title, author, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Review</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Programming">Programming</option>
              <option value="Marketing">Marketing</option>
              <option value="Data Science">Data Science</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
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
              <option value="enrollments">Most Enrollments</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="content-header">
          <span className="results-count">
            Showing {filteredCurricula.length} of {curricula.length} curricula
          </span>
        </div>

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : filteredCurricula.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-book-open"></i>
            <h3>No curricula found</h3>
            <p>Try adjusting your search criteria or add a new curriculum.</p>
          </div>
        ) : (
          <div className="curricula-grid">
            {filteredCurricula.map((curriculum) => (
              <div key={curriculum.id} className="curriculum-card">
                <div className="card-header">
                  <h3 className="card-title">{curriculum.title}</h3>
                  <div className="card-meta">
                    <span className="card-author">
                      <i className="fas fa-user"></i>
                      {curriculum.author}
                    </span>
                    <span className="card-category">{curriculum.category}</span>
                    {getDifficultyBadge(curriculum.difficulty)}
                  </div>
                  <p className="card-description">{curriculum.description}</p>
                </div>

                <div className="card-stats">
                  <div className="stat-item">
                    <h4 className="stat-item-value">{curriculum.enrollments}</h4>
                    <p className="stat-item-label">Enrollments</p>
                  </div>
                  <div className="stat-item">
                    <h4 className="stat-item-value">★ {curriculum.rating}</h4>
                    <p className="stat-item-label">Rating</p>
                  </div>
                  <div className="stat-item">
                    <h4 className="stat-item-value">{curriculum.duration}</h4>
                    <p className="stat-item-label">Duration</p>
                  </div>
                </div>

                <div className="card-actions">
                  {getStatusBadge(curriculum.status)}
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => handleEdit(curriculum)}
                    >
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                    {curriculum.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleApprove(curriculum)}
                          disabled={isLoading}
                        >
                          <i className="fas fa-check"></i>
                          Approve
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(curriculum)}
                          disabled={isLoading}
                        >
                          <i className="fas fa-times"></i>
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(curriculum)}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="modal-overlay" onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedCurriculum(null);
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {showAddModal ? 'Add New Curriculum' : 'Edit Curriculum'}
                </h2>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedCurriculum(null);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="curriculum-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Course Title</label>
                    <input
                      type="text"
                      placeholder="Enter course title"
                      defaultValue={selectedCurriculum?.title || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select defaultValue={selectedCurriculum?.category || ''}>
                      <option value="">Select Category</option>
                      <option value="Programming">Programming</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Design">Design</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Author</label>
                    <input
                      type="text"
                      placeholder="Enter author name"
                      defaultValue={selectedCurriculum?.author || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      placeholder="e.g., 8 weeks"
                      defaultValue={selectedCurriculum?.duration || ''}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Difficulty Level</label>
                    <select defaultValue={selectedCurriculum?.difficulty || 'Beginner'}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select defaultValue={selectedCurriculum?.status || 'draft'}>
                      <option value="draft">Draft</option>
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows="4"
                    placeholder="Enter course description"
                    defaultValue={selectedCurriculum?.description || ''}
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedCurriculum(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => {
                      // Handle save logic here
                      showNotification(
                        showAddModal ? 'Curriculum added successfully!' : 'Curriculum updated successfully!', 
                        'success'
                      );
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedCurriculum(null);
                    }}
                  >
                    <i className="fas fa-save"></i>
                    {showAddModal ? 'Add Curriculum' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedCurriculum && (
          <div className="modal-overlay" onClick={() => {
            setShowDeleteModal(false);
            setSelectedCurriculum(null);
          }}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Confirm Delete</h2>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCurriculum(null);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="delete-content">
                <div className="delete-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Delete Curriculum</h3>
                <p>
                  Are you sure you want to delete <strong>"{selectedCurriculum.title}"</strong>? 
                  This action cannot be undone and will affect {selectedCurriculum.enrollments} enrolled students.
                </p>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCurriculum(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    // Handle delete logic here
                    setCurricula(prev => prev.filter(c => c.id !== selectedCurriculum.id));
                    showNotification(`"${selectedCurriculum.title}" has been deleted.`, 'success');
                    setShowDeleteModal(false);
                    setSelectedCurriculum(null);
                  }}
                >
                  <i className="fas fa-trash"></i>
                  Delete Curriculum
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      
      
    </div>
  );
};

export default AdminCurriculaPage;