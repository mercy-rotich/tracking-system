
import React, { useState, useEffect } from 'react';
import documentManagementService from '../../../../services/tracking/DocumentManagementService';
import './DocumentViewer.css';

const DocumentViewer = ({ 
  trackingId, 
  stepId = null, 
  documentType = null, 
  showUploadButton = true,
  onUploadClick = null,
  onDocumentAction = null,
  className = '',
  viewMode = 'list' 
}) => {
  const [documents, setDocuments] = useState([]);
  const [groupedDocuments, setGroupedDocuments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  
  useEffect(() => {
    if (trackingId) {
      loadDocuments();
    }
  }, [trackingId, stepId, documentType]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading documents for tracking:', trackingId);
      
      const result = await documentManagementService.getDocumentsByTracking(trackingId, {
        stepId,
        documentType,
        includeInactive: false
      });

      if (result.success) {
        setDocuments(result.data);
        setGroupedDocuments(result.grouped);
        console.log('✅ Documents loaded successfully:', {
          count: result.data.length,
          types: result.metadata.documentTypes
        });
      } else {
        throw new Error(result.message || 'Failed to load documents');
      }

    } catch (error) {
      console.error('❌ Error loading documents:', error);
      setError(error.message);
      setDocuments([]);
      setGroupedDocuments({});
    } finally {
      setIsLoading(false);
    }
  };

 
  const getFilteredAndSortedDocuments = () => {
    let filtered = documents;

    
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.documentType === filterType);
    }

    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.originalFilename.toLowerCase().includes(search) ||
        doc.description?.toLowerCase().includes(search) ||
        doc.uploadedByName?.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.originalFilename.toLowerCase();
          bValue = b.originalFilename.toLowerCase();
          break;
        case 'size':
          aValue = a.fileSize || 0;
          bValue = b.fileSize || 0;
          break;
        case 'type':
          aValue = a.documentType;
          bValue = b.documentType;
          break;
        case 'uploader':
          aValue = a.uploadedByName || '';
          bValue = b.uploadedByName || '';
          break;
        case 'uploadedAt':
        default:
          aValue = new Date(a.uploadedAt);
          bValue = new Date(b.uploadedAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  // Handle document download
  const handleDownload = async (document) => {
    try {
      console.log('🔄 Downloading document:', document.originalFilename);
      
      await documentManagementService.downloadDocument(
        document.id, 
        document.originalFilename
      );
      
      if (onDocumentAction) {
        onDocumentAction('download', document);
      }
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert(`Failed to download document: ${error.message}`);
    }
  };

  // Handle getting download URL
  const handleGetDownloadUrl = async (document) => {
    try {
      console.log('🔄 Getting download URL for:', document.originalFilename);
      
      const result = await documentManagementService.getDownloadUrl(document.id);
      
      if (result.success) {
        // Open URL in new tab
        window.open(result.data.downloadUrl, '_blank');
        
        if (onDocumentAction) {
          onDocumentAction('view', document, result.data);
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to get download URL:', error);
      alert(`Failed to get download URL: ${error.message}`);
    }
  };

  // Handle document selection
  const handleDocumentSelect = (document, isSelected) => {
    setSelectedDocuments(prev => {
      if (isSelected) {
        return [...prev, document.id];
      } else {
        return prev.filter(id => id !== document.id);
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    const filteredDocs = getFilteredAndSortedDocuments();
    if (selectedDocuments.length === filteredDocs.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocs.map(doc => doc.id));
    }
  };

  // Get unique document types for filter
  const getDocumentTypes = () => {
    const types = [...new Set(documents.map(doc => doc.documentType))];
    return types.map(type => ({
      value: type,
      label: documents.find(doc => doc.documentType === type)?.documentTypeDisplayName || type
    }));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  // Get file icon
  const getFileIcon = (document) => {
    return document.fileIcon || 'fas fa-file';
  };

  // Get file color
  const getFileColor = (contentType) => {
    if (!contentType) return 'var(--tracking-text-muted)';
    
    const type = contentType.toLowerCase();
    if (type.includes('pdf')) return '#dc2626';
    if (type.includes('word')) return '#2563eb';
    if (type.includes('excel')) return '#059669';
    if (type.includes('image')) return '#7c3aed';
    return 'var(--tracking-text-muted)';
  };

  const filteredDocuments = getFilteredAndSortedDocuments();

  if (isLoading) {
    return (
      <div className={`document-viewer ${className}`}>
        <div className="document-viewer-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading documents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`document-viewer ${className}`}>
        <div className="document-viewer-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Error loading documents: {error}</span>
          <button 
            className="tracking-btn tracking-btn-outline tracking-btn-sm"
            onClick={loadDocuments}
          >
            <i className="fas fa-sync-alt"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`document-viewer ${className}`}>
      {/* Header */}
      <div className="document-viewer-header">
        <div className="document-viewer-title">
          <h3>
            <i className="fas fa-folder-open"></i>
            Documents
            {filteredDocuments.length > 0 && (
              <span className="document-count">({filteredDocuments.length})</span>
            )}
          </h3>
        </div>

        <div className="document-viewer-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`tracking-btn tracking-btn-sm ${viewMode === 'list' ? 'tracking-btn-primary' : 'tracking-btn-outline'}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <i className="fas fa-list"></i>
            </button>
            <button
              className={`tracking-btn tracking-btn-sm ${viewMode === 'grid' ? 'tracking-btn-primary' : 'tracking-btn-outline'}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <i className="fas fa-th"></i>
            </button>
            <button
              className={`tracking-btn tracking-btn-sm ${viewMode === 'detailed' ? 'tracking-btn-primary' : 'tracking-btn-outline'}`}
              onClick={() => setViewMode('detailed')}
              title="Detailed view"
            >
              <i className="fas fa-th-list"></i>
            </button>
          </div>

          {/* Upload Button */}
          {showUploadButton && (
            <button
              className="tracking-btn tracking-btn-primary tracking-btn-sm"
              onClick={onUploadClick}
            >
              <i className="fas fa-plus"></i>
              Upload
            </button>
          )}

          {/* Refresh Button */}
          <button
            className="tracking-btn tracking-btn-outline tracking-btn-sm"
            onClick={loadDocuments}
          >
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      {documents.length > 0 && (
        <div className="document-viewer-filters">
          <div className="document-filters-row">
            {/* Search */}
            <div className="document-search">
              <div className="search-input-wrapper">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="tracking-form-control"
                />
                {searchTerm && (
                  <button
                    className="search-clear"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Type Filter */}
            <div className="document-type-filter">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="tracking-form-control"
              >
                <option value="all">All Types</option>
                {getDocumentTypes().map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="document-sort">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="tracking-form-control"
              >
                <option value="uploadedAt">Upload Date</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="type">Type</option>
                <option value="uploader">Uploader</option>
              </select>
              <button
                className="tracking-btn tracking-btn-outline tracking-btn-sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedDocuments.length > 0 && (
            <div className="document-bulk-actions">
              <div className="bulk-actions-info">
                <span>{selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected</span>
              </div>
              <div className="bulk-actions-buttons">
                <button className="tracking-btn tracking-btn-outline tracking-btn-sm">
                  <i className="fas fa-download"></i>
                  Download Selected
                </button>
                <button className="tracking-btn tracking-btn-outline tracking-btn-sm">
                  <i className="fas fa-share"></i>
                  Share
                </button>
                <button 
                  className="tracking-btn tracking-btn-outline tracking-btn-sm"
                  onClick={() => setSelectedDocuments([])}
                >
                  <i className="fas fa-times"></i>
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document List */}
      <div className="document-viewer-content">
        {filteredDocuments.length === 0 ? (
          <div className="document-viewer-empty">
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <h4>No Documents Found</h4>
              <p>
                {documents.length === 0 
                  ? 'No documents have been uploaded for this tracking yet.'
                  : 'No documents match your current filters.'
                }
              </p>
              {showUploadButton && documents.length === 0 && (
                <button
                  className="tracking-btn tracking-btn-primary"
                  onClick={onUploadClick}
                >
                  <i className="fas fa-plus"></i>
                  Upload First Document
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={`document-list document-list-${viewMode}`}>
            {/* Select All Header */}
            {viewMode === 'list' && (
              <div className="document-list-header">
                <div className="document-select-all">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.length === filteredDocuments.length}
                    onChange={handleSelectAll}
                  />
                  <span>Select All</span>
                </div>
                <div className="document-list-columns">
                  <span>Name</span>
                  <span>Type</span>
                  <span>Size</span>
                  <span>Uploaded</span>
                  <span>Actions</span>
                </div>
              </div>
            )}

            {/* Document Items */}
            {filteredDocuments.map(document => (
              <div
                key={document.id}
                className={`document-item document-item-${viewMode} ${
                  selectedDocuments.includes(document.id) ? 'selected' : ''
                }`}
              >
                {/* Selection Checkbox */}
                <div className="document-select">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document.id)}
                    onChange={(e) => handleDocumentSelect(document, e.target.checked)}
                  />
                </div>

                {/* Document Icon */}
                <div className="document-icon">
                  <i 
                    className={getFileIcon(document)}
                    style={{ color: getFileColor(document.contentType) }}
                  ></i>
                </div>

                {/* Document Info */}
                <div className="document-info">
                  <div className="document-name">
                    <span title={document.originalFilename}>
                      {document.originalFilename}
                    </span>
                    {document.versionNumber > 1 && (
                      <span className="version-badge">v{document.versionNumber}</span>
                    )}
                  </div>
                  
                  {viewMode !== 'list' && (
                    <div className="document-meta">
                      <span className="document-type">
                        {document.documentTypeDisplayName}
                      </span>
                      <span className="document-size">
                        {document.formattedFileSize}
                      </span>
                      <span className="document-date">
                        {document.uploadedAtFormatted}
                      </span>
                    </div>
                  )}

                  {document.description && viewMode === 'detailed' && (
                    <div className="document-description">
                      {document.description}
                    </div>
                  )}

                  {viewMode === 'detailed' && (
                    <div className="document-uploader">
                      <i className="fas fa-user"></i>
                      <span>{document.uploadedByName}</span>
                    </div>
                  )}
                </div>
''
                {/* List View Columns */}
                {viewMode === 'list' && (
                  <>
                    <div className="document-type-column">
                      <span className="tracking-badge tracking-badge-neutral">
                        {document.documentTypeDisplayName}
                      </span>
                    </div>
                    <div className="document-size-column">
                      {document.formattedFileSize}
                    </div>
                    <div className="document-date-column">
                      <div>{document.uploadedAtFormatted}</div>
                      <div className="document-uploader-small">
                        by {document.uploadedByName}
                      </div>
                    </div>
                  </>
                )}

                {/* Document Actions */}
                <div className="document-actions">
                  <button
                    className="tracking-btn tracking-btn-outline tracking-btn-sm"
                    onClick={() => handleGetDownloadUrl(document)}
                    title="View document"
                  >
                    <i className="fas fa-eye"></i>
                    {viewMode === 'detailed' && <span>View</span>}
                  </button>
                  
                  <button
                    className="tracking-btn tracking-btn-outline tracking-btn-sm"
                    onClick={() => handleDownload(document)}
                    title="Download document"
                  >
                    <i className="fas fa-download"></i>
                    {viewMode === 'detailed' && <span>Download</span>}
                  </button>

                  {viewMode === 'detailed' && (
                    <button
                      className="tracking-btn tracking-btn-outline tracking-btn-sm"
                      onClick={() => onDocumentAction && onDocumentAction('info', document)}
                      title="Document information"
                    >
                      <i className="fas fa-info-circle"></i>
                      <span>Info</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Statistics */}
      {documents.length > 0 && (
        <div className="document-viewer-footer">
          <div className="document-stats">
            <span>{documents.length} total document{documents.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{formatFileSize(documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0))} total size</span>
            {filteredDocuments.length !== documents.length && (
              <>
                <span>•</span>
                <span>{filteredDocuments.length} shown</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;