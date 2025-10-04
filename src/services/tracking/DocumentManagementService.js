
import { TrackingApiClient } from './TrackingApiClient.js';
import { TrackingEndpointsRegistry } from './TrackingEndpointsRegistry.js';
import authService from '../authService.js';

export const DOCUMENT_TYPES = {
  SUPPORTING_DOCUMENTS: 'SUPPORTING_DOCUMENTS',
  APPROVAL_DOCUMENTS: 'APPROVAL_DOCUMENTS',
  REVIEW_DOCUMENTS: 'REVIEW_DOCUMENTS',
  CURRICULUM_PROPOSAL: 'CURRICULUM_PROPOSAL',
  ASSESSMENT_DOCUMENTS: 'ASSESSMENT_DOCUMENTS',
  EXTERNAL_REVIEW: 'EXTERNAL_REVIEW'
};

export const DOCUMENT_TYPE_DISPLAY_NAMES = {
  [DOCUMENT_TYPES.SUPPORTING_DOCUMENTS]: 'Supporting Documents',
  [DOCUMENT_TYPES.APPROVAL_DOCUMENTS]: 'Approval Documents',
  [DOCUMENT_TYPES.REVIEW_DOCUMENTS]: 'Review Documents',
  [DOCUMENT_TYPES.CURRICULUM_PROPOSAL]: 'Curriculum Proposal',
  [DOCUMENT_TYPES.ASSESSMENT_DOCUMENTS]: 'Assessment Documents',
  [DOCUMENT_TYPES.EXTERNAL_REVIEW]: 'External Review'
};

const UPLOAD_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.txt']
};


class DocumentDataTransformer {
  /**
   
   * @param {Object} apiDocument - Raw document data from API
   * @returns {Object} Transformed document object
   */
  transformDocument(apiDocument) {
    if (!apiDocument) return null;

    return {
     
      id: apiDocument.id,
      documentName: apiDocument.documentName,
      originalFilename: apiDocument.originalFilename,
      
      // Document classification
      documentType: apiDocument.documentType,
      documentTypeDisplayName: apiDocument.documentTypeDisplayName || 
                              DOCUMENT_TYPE_DISPLAY_NAMES[apiDocument.documentType] || 
                              apiDocument.documentType,
      
      // File information
      filePath: apiDocument.filePath,
      fileSize: apiDocument.fileSize,
      formattedFileSize: apiDocument.formattedFileSize || this.formatFileSize(apiDocument.fileSize),
      contentType: apiDocument.contentType,
      fileExtension: apiDocument.fileExtension,
      
      // Metadata
      description: apiDocument.description,
      versionNumber: apiDocument.versionNumber || 1,
      
      // User information
      uploadedByName: apiDocument.uploadedByName,
      uploadedByEmail: apiDocument.uploadedByEmail,
      uploadedById: apiDocument.uploadedById,
      
      // Timestamps
      uploadedAt: apiDocument.uploadedAt,
      updatedAt: apiDocument.updatedAt,
      createdAt: apiDocument.createdAt,
      
      // Status flags
      isActive: apiDocument.isActive !== false,
      isDeleted: apiDocument.isDeleted || false,
      
      // Additional metadata
      tags: apiDocument.tags || [],
      category: apiDocument.category,
      priority: apiDocument.priority || 'normal',
      
      // Access control
      isPublic: apiDocument.isPublic || false,
      accessLevel: apiDocument.accessLevel || 'internal',
      
      // Formatted display data
      displayName: apiDocument.documentName || apiDocument.originalFilename,
      uploadedAtFormatted: this.formatDateTime(apiDocument.uploadedAt),
      fileIcon: this.getFileIcon(apiDocument.contentType || apiDocument.fileExtension),
      
      // data for debugging
      _rawApiData: apiDocument,
      _transformedAt: new Date().toISOString()
    };
  }

  /**
   
   * @param {Array} documents - Array of document objects
   * @returns {Array} Transformed documents
   */
  transformDocuments(documents) {
    if (!Array.isArray(documents)) return [];
    return documents.map(doc => this.transformDocument(doc));
  }

  /**
  
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
  
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date time
   */
  formatDateTime(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  /**
   
   * @param {string} contentType - MIME type or file extension
   * @returns {string} Font Awesome icon class
   */
  getFileIcon(contentType) {
    if (!contentType) return 'fas fa-file';
    
    const type = contentType.toLowerCase();
    
    if (type.includes('pdf')) return 'fas fa-file-pdf';
    if (type.includes('word') || type.includes('doc')) return 'fas fa-file-word';
    if (type.includes('excel') || type.includes('sheet')) return 'fas fa-file-excel';
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return 'fas fa-file-image';
    if (type.includes('text') || type.includes('txt')) return 'fas fa-file-alt';
    if (type.includes('zip') || type.includes('rar')) return 'fas fa-file-archive';
    
    return 'fas fa-file';
  }
}

//Document Validation Utilities
 
class DocumentValidator {
  /**
   * Validate file before upload
   * @param {File} file - File object to validate
   * @returns {Object} Validation result
   */
  validateFile(file) {
    const errors = [];
    
    // Check if file exists
    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }
    
    // Check file size
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(UPLOAD_CONFIG.maxFileSize)})`);
    }
    
    // Check file type
    if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
      errors.push(`File type "${file.type}" is not allowed`);
    }
    
    // Check file extension
    const extension = this.getFileExtension(file.name);
    if (!UPLOAD_CONFIG.allowedExtensions.includes(extension)) {
      errors.push(`File extension "${extension}" is not allowed`);
    }
    
    // Check filename
    if (!file.name || file.name.trim().length === 0) {
      errors.push('File must have a valid name');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        extension: extension,
        formattedSize: this.formatFileSize(file.size)
      }
    };
  }

  /**
   * Validate multiple files
   * @param {FileList|Array} files - Files to validate
   * @returns {Object} Validation results
   */
  validateFiles(files) {
    const fileArray = Array.from(files);
    const results = fileArray.map(file => this.validateFile(file));
    
    const validFiles = fileArray.filter((_, index) => results[index].isValid);
    const invalidFiles = fileArray.filter((_, index) => !results[index].isValid);
    
    return {
      isValid: validFiles.length > 0 && invalidFiles.length === 0,
      validFiles,
      invalidFiles,
      results,
      summary: {
        total: fileArray.length,
        valid: validFiles.length,
        invalid: invalidFiles.length
      }
    };
  }

  /**
   
   * @param {string} filename 
   * @returns {string} File extension
   */
  getFileExtension(filename) {
    if (!filename || typeof filename !== 'string') return '';
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
  }

  /**
 
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

//Document Cache Manager
 
class DocumentCacheManager {
  constructor() {
    this.cache = new Map();
    this.expiry = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; 
  }

  generateKey(trackingId, stepId = null, documentType = null) {
    return `documents_${trackingId}_${stepId || 'all'}_${documentType || 'all'}`;
  }

  set(key, data) {
    this.cache.set(key, data);
    this.expiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  get(key) {
    const expiry = this.expiry.get(key);
    if (expiry && Date.now() < expiry) {
      return this.cache.get(key);
    }
    this.delete(key);
    return null;
  }

  delete(key) {
    this.cache.delete(key);
    this.expiry.delete(key);
  }

  clear() {
    this.cache.clear();
    this.expiry.clear();
  }

  clearTrackingCache(trackingId) {
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.includes(`documents_${trackingId}`));
    
    keysToDelete.forEach(key => this.delete(key));
  }
}


class DocumentManagementService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    this.endpointsRegistry = new TrackingEndpointsRegistry();
    this.apiClient = new TrackingApiClient(this.baseURL, this.endpointsRegistry);
    this.transformer = new DocumentDataTransformer();
    this.validator = new DocumentValidator();
    this.cache = new DocumentCacheManager();
    
    console.log('🔄 Document Management Service initialized');
  }

  // DOCUMENT UPLOAD OPERATIONS
  

  /**
   * Upload a single document
   * @param {Object} params - Upload parameters
   * @returns {Promise<Object>} Upload result
   */
  async uploadDocument({ file, trackingId, stepId, documentType = DOCUMENT_TYPES.SUPPORTING_DOCUMENTS, description = '' }) {
    try {
      console.log('🔄 [Document Service] Uploading single document:', {
        filename: file?.name,
        trackingId,
        stepId,
        documentType
      });
  
      // Validate inputs
      const numericTrackingId = Number(trackingId);
      const numericStepId = Number(stepId);
      
      if (!trackingId || isNaN(numericTrackingId)) {
        throw new Error('Invalid trackingId: must be a valid number');
      }
      
      if (!stepId || isNaN(numericStepId)) {
        throw new Error('Invalid stepId: must be a valid number');
      }
  
    
      const validation = this.validator.validateFile(file);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }
  
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('trackingId', String(numericTrackingId));
      formData.append('stepId', String(numericStepId));
      formData.append('documentType', documentType);
      
      if (description) {
        formData.append('description', description);
      }
  
      
      const result = await this.apiClient.makeRequest('UPLOAD_DOCUMENT', {
        body: formData,
        useCache: false
      });
  
      
      const transformedDocument = this.transformer.transformDocument(result.data);
  
     
      this.cache.clearTrackingCache(numericTrackingId);
  
      console.log('✅ [Document Service] Document uploaded successfully:', transformedDocument);
  
      return {
        success: true,
        message: result.message || 'Document uploaded successfully',
        data: transformedDocument,
        uploadInfo: {
          originalSize: file.size,
          processedSize: transformedDocument.fileSize,
          uploadTime: new Date().toISOString()
        }
      };
  
    } catch (error) {
      console.error('❌ [Document Service] Upload failed:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }
  /**
   * Upload multiple documents in batch
   * @param {Object} params - Batch upload parameters
   * @returns {Promise<Object>} Batch upload result
   */
  async uploadDocumentsBatch({ files, trackingId, stepId, documentType = DOCUMENT_TYPES.SUPPORTING_DOCUMENTS, descriptions = [] }) {
    try {
      console.log('🔄 [Document Service] Uploading batch documents:', {
        fileCount: files?.length,
        trackingId,
        stepId,
        documentType
      });
  
      // Validate inputs
      const numericTrackingId = Number(trackingId);
      const numericStepId = Number(stepId);
      
      if (!trackingId || isNaN(numericTrackingId)) {
        throw new Error('Invalid trackingId: must be a valid number');
      }
      
      if (!stepId || isNaN(numericStepId)) {
        throw new Error('Invalid stepId: must be a valid number');
      }
  
      const validation = this.validator.validateFiles(files);
      if (!validation.isValid) {
        const errorMessages = validation.results
          .filter(result => !result.isValid)
          .map(result => result.errors.join(', '))
          .join('; ');
        throw new Error(`File validation failed: ${errorMessages}`);
      }
  
      
      const formData = new FormData();
      
      validation.validFiles.forEach(file => {
        formData.append('files', file);
      });
      
      formData.append('trackingId', String(numericTrackingId));
      formData.append('stepId', String(numericStepId));
      formData.append('documentType', documentType);
      
      if (descriptions && descriptions.length > 0) {
        descriptions.forEach(desc => {
          formData.append('descriptions', desc);
        });
      }
  
      
      const result = await this.apiClient.makeRequest('UPLOAD_BATCH', {
        body: formData,
        useCache: false
      });
  
      
      const transformedDocuments = this.transformer.transformDocuments(result.data);
  
      
      this.cache.clearTrackingCache(numericTrackingId);
  
      console.log('✅ [Document Service] Batch upload completed:', {
        uploaded: transformedDocuments.length,
        failed: validation.invalidFiles.length
      });
  
      return {
        success: true,
        message: result.message || `${transformedDocuments.length} documents uploaded successfully`,
        data: transformedDocuments,
        uploadSummary: {
          total: files.length,
          successful: transformedDocuments.length,
          failed: validation.invalidFiles.length,
          failedFiles: validation.invalidFiles.map(file => file.name),
          uploadTime: new Date().toISOString()
        }
      };
  
    } catch (error) {
      console.error('❌ [Document Service] Batch upload failed:', error);
      throw new Error(`Failed to upload documents: ${error.message}`);
    }
  }
 
  // DOCUMENT RETRIEVAL OPERATIONS
 

  /**
   * Get documents by tracking ID
   * @param {number} trackingId - Tracking ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Documents list
   */
  async getDocumentsByTracking(trackingId, options = {}) {
    try {
      console.log('🔄 [Document Service] Getting documents for tracking:', trackingId);

      const cacheKey = this.cache.generateKey(trackingId, options.stepId, options.documentType);
      
      
      if (options.useCache !== false) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          console.log('📦 [Document Service] Using cached documents');
          return cached;
        }
      }

      
      const result = await this.apiClient.makeRequest('GET_DOCUMENTS_BY_TRACKING', {
        pathParams: { trackingId },
        queryParams: {
          stepId: options.stepId,
          documentType: options.documentType,
          includeInactive: options.includeInactive || false
        }
      });

      
      const transformedDocuments = this.transformer.transformDocuments(result.data);

      // Group documents by type and step
      const groupedDocuments = this.groupDocuments(transformedDocuments);

      const finalResult = {
        success: true,
        message: result.message || `Found ${transformedDocuments.length} documents`,
        data: transformedDocuments,
        grouped: groupedDocuments,
        metadata: {
          trackingId,
          totalDocuments: transformedDocuments.length,
          documentTypes: [...new Set(transformedDocuments.map(doc => doc.documentType))],
          stepIds: [...new Set(transformedDocuments.map(doc => doc.stepId))].filter(Boolean),
          totalSize: transformedDocuments.reduce((sum, doc) => sum + (doc.fileSize || 0), 0),
          formattedTotalSize: this.transformer.formatFileSize(
            transformedDocuments.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
          )
        }
      };

      
      this.cache.set(cacheKey, finalResult);

      console.log('✅ [Document Service] Documents retrieved successfully:', {
        count: transformedDocuments.length,
        types: finalResult.metadata.documentTypes
      });

      return finalResult;

    } catch (error) {
      console.error('❌ [Document Service] Failed to get documents:', error);
      throw new Error(`Failed to get documents: ${error.message}`);
    }
  }

  /**
   * Get document metadata by ID
   * @param {number} documentId - Document ID
   * @returns {Promise<Object>} Document metadata
   */
  async getDocumentMetadata(documentId) {
    try {
      console.log('🔄 [Document Service] Getting document metadata:', documentId);

      const result = await this.apiClient.makeRequest('GET_DOCUMENT_METADATA', {
        pathParams: { documentId }
      });

      const transformedDocument = this.transformer.transformDocument(result.data);

      console.log('✅ [Document Service] Document metadata retrieved:', transformedDocument.originalFilename);

      return {
        success: true,
        message: result.message || 'Document metadata retrieved successfully',
        data: transformedDocument
      };

    } catch (error) {
      console.error('❌ [Document Service] Failed to get document metadata:', error);
      throw new Error(`Failed to get document metadata: ${error.message}`);
    }
  }
  // DOCUMENT DOWNLOAD OPERATIONS
 

  /**
   * Download document directly
   * @param {number} documentId - Document ID
   * @param {string} filename - Optional filename override
   * @returns {Promise<Object>} Download result
   */
  async downloadDocument(documentId, filename = null) {
    try {
      console.log('🔄 [Document Service] Downloading document:', documentId);

     
      const headers = await this.apiClient.getHeaders();
      
      
      const response = await fetch(
        this.apiClient.endpointsRegistry.buildUrl(this.baseURL, 'DOWNLOAD_DOCUMENT', { documentId }),
        {
          method: 'GET',
          headers
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      // Get filename from headers or use provided one
      let downloadFilename = filename;
      if (!downloadFilename) {
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          downloadFilename = filenameMatch ? filenameMatch[1].replace(/['"]/g, '') : `document_${documentId}`;
        } else {
          downloadFilename = `document_${documentId}`;
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);

      console.log('✅ [Document Service] Document downloaded:', downloadFilename);

      return {
        success: true,
        message: 'Document downloaded successfully',
        filename: downloadFilename,
        documentId
      };

    } catch (error) {
      console.error('❌ [Document Service] Download failed:', error);
      throw new Error(`Failed to download document: ${error.message}`);
    }
  }

  /**
   * Get secure download URL for document
   * @param {number} documentId - Document ID
   * @returns {Promise<Object>} Download URL with expiry
   */
  async getDownloadUrl(documentId) {
    try {
      console.log('🔄 [Document Service] Getting download URL:', documentId);

      const result = await this.apiClient.makeRequest('GET_DOWNLOAD_URL', {
        pathParams: { documentId }
      });

      console.log('✅ [Document Service] Download URL generated:', {
        documentId,
        expiresIn: result.data.expiresInMinutes
      });

      return {
        success: true,
        message: result.message || 'Download URL generated successfully',
        data: {
          downloadUrl: result.data.downloadUrl,
          expiresInMinutes: result.data.expiresInMinutes,
          expiresAt: new Date(Date.now() + (result.data.expiresInMinutes * 60 * 1000)).toISOString(),
          documentId
        }
      };

    } catch (error) {
      console.error('❌ [Document Service] Failed to get download URL:', error);
      throw new Error(`Failed to get download URL: ${error.message}`);
    }
  }

  // UTILITY METHODS
 

  /**
   * Group documents by type and step
   * @param {Array} documents - Array of documents
   * @returns {Object} Grouped documents
   */
  groupDocuments(documents) {
    const grouped = {
      byType: {},
      byStep: {},
      byUploader: {}
    };

    documents.forEach(doc => {
      // Group by document type
      if (!grouped.byType[doc.documentType]) {
        grouped.byType[doc.documentType] = [];
      }
      grouped.byType[doc.documentType].push(doc);

      // Group by step ID
      const stepId = doc.stepId || 'unknown';
      if (!grouped.byStep[stepId]) {
        grouped.byStep[stepId] = [];
      }
      grouped.byStep[stepId].push(doc);

      // Group by uploader
      const uploader = doc.uploadedByName || 'Unknown';
      if (!grouped.byUploader[uploader]) {
        grouped.byUploader[uploader] = [];
      }
      grouped.byUploader[uploader].push(doc);
    });

    return grouped;
  }

  /**
   * Get supported file types
   * @returns {Object} Supported file types information
   */
  getSupportedFileTypes() {
    return {
      types: UPLOAD_CONFIG.allowedTypes,
      extensions: UPLOAD_CONFIG.allowedExtensions,
      maxSize: UPLOAD_CONFIG.maxFileSize,
      formattedMaxSize: this.transformer.formatFileSize(UPLOAD_CONFIG.maxFileSize),
      documentTypes: DOCUMENT_TYPES,
      documentTypeNames: DOCUMENT_TYPE_DISPLAY_NAMES
    };
  }

  
  clearAllCaches() {
    this.cache.clear();
    console.log('🧹 [Document Service] All caches cleared');
  }

  /**
   
   * @returns {Object} Service information
   */
  getServiceInfo() {
    return {
      baseURL: this.baseURL,
      supportedFileTypes: this.getSupportedFileTypes(),
      cacheStats: {
        size: this.cache.cache.size,
        keys: Array.from(this.cache.cache.keys())
      },
      transformer: {
        version: '1.0.0',
        features: ['fileSize', 'dateTime', 'fileIcon', 'validation']
      }
    };
  }
}

const documentManagementService = new DocumentManagementService();

// Development debugging tools
if (typeof window !== 'undefined') {
  window.documentService = documentManagementService;
  window.testDocumentUpload = (file, trackingId, stepId) => 
    documentManagementService.uploadDocument({ file, trackingId, stepId });
  window.testBatchUpload = (files, trackingId, stepId) => 
    documentManagementService.uploadDocumentsBatch({ files, trackingId, stepId });
  window.testGetDocuments = (trackingId) => 
    documentManagementService.getDocumentsByTracking(trackingId);
  window.getDocumentServiceInfo = () => documentManagementService.getServiceInfo();
}

export default documentManagementService;
