import React, { useState, useEffect } from 'react';

const CurriculumModal = ({ isOpen, isEdit, curriculum, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    author: '',
    duration: '',
    difficulty: 'Beginner',
    status: 'draft',
    description: ''
  });

  useEffect(() => {
    if (isEdit && curriculum) {
      setFormData({
        title: curriculum.title || '',
        category: curriculum.category || '',
        author: curriculum.author || '',
        duration: curriculum.duration || '',
        difficulty: curriculum.difficulty || 'Beginner',
        status: curriculum.status || 'draft',
        description: curriculum.description || ''
      });
    } else {
      setFormData({
        title: '',
        category: '',
        author: '',
        duration: '',
        difficulty: 'Beginner',
        status: 'draft',
        description: ''
      });
    }
  }, [isEdit, curriculum]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Edit Curriculum' : 'Add New Curriculum'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form className="curriculum-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Course Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter course title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                required
              >
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
                name="author"
                placeholder="Enter author name"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                name="duration"
                placeholder="e.g., 8 weeks"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Difficulty Level</label>
              <select 
                name="difficulty" 
                value={formData.difficulty} 
                onChange={handleChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
              >
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
              name="description"
              rows="4"
              placeholder="Enter course description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-save"></i>
              {isEdit ? 'Save Changes' : 'Add Curriculum'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CurriculumModal;