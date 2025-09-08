import authService from "./authService";

class CurriculumTrackingService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    console.log('🔄 Curriculum Tracking Service initialized with base URL:', this.baseURL);
    
    // Cache for tracking data
    this.trackingCache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_DURATION = 2 * 60 * 1000; 

    // Configuration constants
    this.STAGE_ORDER = [
      'initiation', 'school_board', 'dean_committee', 'senate', 
      'qa_review', 'vice_chancellor', 'cue_review', 'site_inspection'
    ];

    this.STAGE_MAPPINGS = {
      API_TO_FRONTEND: {
        'IDEATION': 'initiation',
        'CURRICULUM_IDEATION': 'initiation',
        'DEPARTMENT_APPROVAL': 'school_board',
        'SCHOOL_BOARD_APPROVAL': 'school_board', 
        'DEAN_APPROVAL': 'dean_committee',
        'DEAN_COMMITTEE': 'dean_committee',
        'SENATE_APPROVAL': 'senate',
        'SENATE': 'senate',
        'QA_REVIEW': 'qa_review',
        'QUALITY_ASSURANCE': 'qa_review',
        'VICE_CHANCELLOR_APPROVAL': 'vice_chancellor',
        'VICE_CHANCELLOR': 'vice_chancellor',
        'CUE_SUBMISSION': 'cue_review',
        'CUE_REVIEW': 'cue_review',
        'SITE_INSPECTION': 'site_inspection',
        'ACCREDITED': 'site_inspection', 
        'COMPLETED': 'site_inspection'
      },
      STATUS_TO_FRONTEND: {
        'INITIATED': 'under_review',
        'IN_PROGRESS': 'under_review',
        'UNDER_REVIEW': 'under_review',
        'PENDING_APPROVAL': 'pending_approval',
        'APPROVED': 'pending_approval',
        'ON_HOLD': 'on_hold',
        'REJECTED': 'rejected',
        'COMPLETED': 'completed',
        'ACCREDITED': 'completed'
      },
      ACTION_TO_BACKEND: {
        'approve': 'APPROVE',
        'reject': 'REJECT', 
        'hold': 'HOLD',
        'resume': 'RESUME',
        'request_changes': 'REQUEST_CHANGES'
      }
    };

    this.STAGE_ESTIMATES = {
      'IDEATION': 30,
      'DEPARTMENT_APPROVAL': 14,
      'SCHOOL_BOARD_APPROVAL': 21,
      'DEAN_APPROVAL': 21,
      'SENATE_APPROVAL': 30,
      'QA_REVIEW': 45,
      'VICE_CHANCELLOR_APPROVAL': 14,
      'CUE_REVIEW': 60,
      'SITE_INSPECTION': 30
    };
  }

  // Utility Methods
  buildApiUrl(endpoint) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('📍 [Tracking Service] Building API URL:', url);
    return url;
  }

  async getHeaders(isFormData = false) {
    try {
      const token = await authService.getValidToken();
      const headers = { 'Authorization': `Bearer ${token}` };
      if (!isFormData) headers['Content-Type'] = 'application/json';
      return headers;
    } catch (error) {
      console.error('❌ [Tracking Service] Failed to get valid token:', error);
      throw new Error('Authentication required. Please log in again.');
    }
  }

  formatDate(dateString) {
    if (!dateString) return null;
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  calculateDaysFromDate(dateString) {
    if (!dateString) return 0;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  // Mapping Methods
  mapApiStageToFrontend(apiStage) {
    return this.STAGE_MAPPINGS.API_TO_FRONTEND[apiStage] || 'initiation';
  }

  mapApiStatusToFrontend(apiStatus) {
    return this.STAGE_MAPPINGS.STATUS_TO_FRONTEND[apiStatus] || 'under_review';
  }

  mapFrontendActionToBackend(frontendAction) {
    return this.STAGE_MAPPINGS.ACTION_TO_BACKEND[frontendAction] || frontendAction.toUpperCase();
  }

  // Business Logic Methods
  determinePriority(apiData) {
    const stage = apiData.currentStage;
    const isOverdue = this.isOverdue(apiData);
    
    if (isOverdue) return 'high';
    if (['CUE_REVIEW', 'SITE_INSPECTION'].includes(stage)) return 'high';
    if (['VICE_CHANCELLOR_APPROVAL', 'SENATE_APPROVAL'].includes(stage)) return 'medium';
    if (apiData.isIdeationStage) return 'low';
    
    return 'medium';
  }

  isOverdue(apiData) {
    if (!apiData.expectedCompletionDate || apiData.isCompleted) return false;
    return new Date(apiData.expectedCompletionDate) < new Date();
  }

  calculateEstimatedCompletion(apiData) {
    if (apiData.expectedCompletionDate) {
      return this.formatDate(apiData.expectedCompletionDate);
    }
    
    const estimatedDays = this.STAGE_ESTIMATES[apiData.currentStage] || 30;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
    
    return this.formatDate(estimatedDate.toISOString());
  }

  // Create default stage object
  createDefaultStageObject() {
    return {
      status: 'pending',
      documents: [],
      notes: '',
      assignedTo: null,
      startedDate: null,
      completedDate: null,
      estimatedStart: null,
      feedback: null
    };
  }

  // Simplified stages creation
  createStagesObject(apiData) {
    // Create all stages with default values
    const stages = this.STAGE_ORDER.reduce((acc, stage) => {
      acc[stage] = this.createDefaultStageObject();
      return acc;
    }, {});

    const currentFrontendStage = this.mapApiStageToFrontend(apiData.currentStage);
    const currentIndex = this.STAGE_ORDER.indexOf(currentFrontendStage);

    // Mark completed stages
    for (let i = 0; i < currentIndex; i++) {
      stages[this.STAGE_ORDER[i]] = {
        ...stages[this.STAGE_ORDER[i]],
        status: 'completed',
        completedDate: apiData.createdAt // Placeholder
      };
    }

    // Set current stage data
    if (currentIndex >= 0) {
      const mappedStatus = this.mapApiStatusToFrontend(apiData.status);
      stages[currentFrontendStage] = {
        ...stages[currentFrontendStage],
        status: mappedStatus === 'completed' ? 'completed' : 'under_review',
        assignedTo: apiData.currentAssigneeName,
        notes: apiData.initialNotes || '',
        startedDate: apiData.createdAt,
        completedDate: mappedStatus === 'completed' ? (apiData.actualCompletionDate || apiData.updatedAt) : null
      };
    }

    return stages;
  }

  // Simplified data transformation
  transformTrackingData(apiData) {
    if (!apiData) return null;

    console.log('🔄 [Tracking Service] Transforming API data:', apiData);

    // Core data extraction
    const coreData = {
      id: apiData.trackingId || apiData.id,
      trackingId: apiData.trackingId,
      title: apiData.displayCurriculumName || apiData.proposedCurriculumName,
      displayTitle: apiData.displayCurriculumName,
      displayCode: apiData.displayCurriculumCode
    };

    // Academic structure
    const academicData = {
      school: apiData.schoolName,
      schoolId: apiData.schoolId,
      department: apiData.departmentName,
      departmentId: apiData.departmentId,
      academicLevel: apiData.academicLevelName,
      academicLevelId: apiData.academicLevelId
    };

    // Workflow status
    const workflowData = {
      currentStage: this.mapApiStageToFrontend(apiData.currentStage),
      currentStageDisplayName: apiData.currentStageDisplayName,
      status: this.mapApiStatusToFrontend(apiData.status),
      statusDisplayName: apiData.statusDisplayName
    };

    // People information
    const peopleData = {
      initiatedByName: apiData.initiatedByName,
      initiatedByEmail: apiData.initiatedByEmail,
      currentAssigneeName: apiData.currentAssigneeName,
      currentAssigneeEmail: apiData.currentAssigneeEmail
    };

    // Curriculum details
    const curriculumDetails = {
      proposedCurriculumName: apiData.proposedCurriculumName,
      proposedCurriculumCode: apiData.proposedCurriculumCode,
      proposedDurationSemesters: apiData.proposedDurationSemesters,
      curriculumDescription: apiData.curriculumDescription,
      proposedEffectiveDate: apiData.proposedEffectiveDate,
      proposedExpiryDate: apiData.proposedExpiryDate
    };

    // Timeline data
    const timelineData = {
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
      expectedCompletionDate: apiData.expectedCompletionDate,
      actualCompletionDate: apiData.actualCompletionDate,
      submittedDate: this.formatDate(apiData.createdAt),
      lastUpdated: this.formatDate(apiData.updatedAt),
      daysInCurrentStage: this.calculateDaysFromDate(apiData.updatedAt),
      totalDays: this.calculateDaysFromDate(apiData.createdAt),
      estimatedCompletion: this.calculateEstimatedCompletion(apiData)
    };

    // Status flags and metadata
    const metadata = {
      priority: this.determinePriority(apiData),
      isActive: apiData.isActive,
      isCompleted: apiData.isCompleted,
      isIdeationStage: apiData.isIdeationStage,
      initialNotes: apiData.initialNotes,
      recentSteps: apiData.recentSteps,
      stages: this.createStagesObject(apiData),
      _rawApiData: apiData 
    };

  
    return {
      ...coreData,
      ...academicData,
      ...workflowData,
      ...peopleData,
      ...curriculumDetails,
      ...timelineData,
      ...metadata
    };
  }

  // Cache Management 
  getCacheKey(key) { return `tracking_${key}`; }
  
  isCacheValid(key) {
    const cacheKey = this.getCacheKey(key);
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry && Date.now() < expiry;
  }

  getFromCache(key) {
    if (this.isCacheValid(key)) {
      console.log(`📦 [Tracking Service] Using cached data for: ${key}`);
      return this.trackingCache.get(this.getCacheKey(key));
    }
    return null;
  }

  setCache(key, data) {
    const cacheKey = this.getCacheKey(key);
    this.trackingCache.set(cacheKey, data);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);
    console.log(`💾 [Tracking Service] Cached data for: ${key}`);
  }

  clearCache(key = null) {
    if (key) {
      const cacheKey = this.getCacheKey(key);
      this.trackingCache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);
      console.log(`🧹 [Tracking Service] Cleared cache for: ${key}`);
    } else {
      this.trackingCache.clear();
      this.cacheExpiry.clear();
      console.log('🧹 [Tracking Service] Cleared all cache');
    }
  }

  // API Methods
  async initiateCurriculumTracking(trackingData, documents = []) {
    try {
      console.log('🔄 [Tracking Service] Initiating curriculum tracking:', trackingData);

      // Validation
      const requiredFields = [
        'schoolId', 'departmentId', 'academicLevelId', 
        'proposedCurriculumName', 'proposedCurriculumCode', 
        'proposedDurationSemesters', 'curriculumDescription'
      ];

      const missingFields = requiredFields.filter(field => !trackingData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

    
      const formData = new FormData();
      
      // Add required fields
      requiredFields.forEach(field => {
        formData.append(field, String(trackingData[field]));
      });

      // Add optional fields
      ['proposedEffectiveDate', 'proposedExpiryDate', 'initialNotes'].forEach(field => {
        if (trackingData[field]) {
          formData.append(field, trackingData[field]);
        }
      });

      // Add documents
      documents.forEach((file, index) => {
        formData.append('documents', file);
        console.log(`📎 [Tracking Service] Added document ${index + 1}: ${file.name}`);
      });

      // Make API call
      const response = await fetch(this.buildApiUrl('/tracking/initiate'), {
        method: 'POST',
        headers: await this.getHeaders(true),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to initiate tracking: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [Tracking Service] Tracking initiated successfully:', result);

      const transformedData = result.data ? this.transformTrackingData(result.data) : null;
      this.clearCache();

      return {
        success: true,
        message: result.message || 'Curriculum tracking initiated successfully',
        data: transformedData,
        raw: result
      };

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to initiate tracking:', error);
      throw new Error(`Failed to initiate curriculum tracking: ${error.message}`);
    }
  }

  async performTrackingAction(trackingId, action, notes = '', documents = []) {
    try {
      console.log('🔄 [Tracking Service] Performing tracking action:', { trackingId, action, notes });

      // Validation
      if (!trackingId || !action) {
        throw new Error('Tracking ID and action are required');
      }

      const validActions = Object.values(this.STAGE_MAPPINGS.ACTION_TO_BACKEND);
      if (!validActions.includes(action.toUpperCase())) {
        throw new Error(`Invalid action: ${action}. Valid actions are: ${validActions.join(', ')}`);
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('trackingId', String(trackingId));
      formData.append('action', action.toUpperCase());
      
      if (notes) formData.append('notes', notes);

      documents.forEach((file, index) => {
        formData.append('documents', file);
        console.log(`📎 [Tracking Service] Added action document ${index + 1}: ${file.name}`);
      });

      // Make API call
      const response = await fetch(this.buildApiUrl('/tracking/action'), {
        method: 'POST',
        headers: await this.getHeaders(true),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to perform tracking action: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [Tracking Service] Tracking action performed successfully:', result);

      const transformedData = result.data ? this.transformTrackingData(result.data) : null;
      this.clearCache();

      return {
        success: true,
        message: result.message || 'Tracking action performed successfully',
        data: transformedData,
        action: action.toUpperCase(),
        raw: result
      };

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to perform tracking action:', error);
      throw new Error(`Failed to perform tracking action: ${error.message}`);
    }
  }

  async downloadTrackingDocument(documentId, filename = null) {
    try {
      console.log('🔄 [Tracking Service] Downloading document:', documentId);

      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const response = await fetch(this.buildApiUrl(`/tracking/documents/download/${documentId}`), {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download document: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      
      // Determine filename
      let downloadFilename = filename;
      if (!downloadFilename) {
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          downloadFilename = filenameMatch ? filenameMatch[1] : `document_${documentId}`;
        } else {
          downloadFilename = `tracking_document_${documentId}`;
        }
      }

      // Trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log('✅ [Tracking Service] Document downloaded successfully:', downloadFilename);

      return {
        success: true,
        message: 'Document downloaded successfully',
        filename: downloadFilename
      };

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to download document:', error);
      throw new Error(`Failed to download document: ${error.message}`);
    }
  }

  async getTrackingsByStage(stage, page = 0, size = 20) {
    try {
      console.log('🔄 [Tracking Service] Getting trackings by stage:', { stage, page, size });

      if (!stage) {
        throw new Error('Stage is required');
      }

      const cacheKey = `stage_${stage}_${page}_${size}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const url = new URL(this.buildApiUrl(`/tracking/stage/${stage.toUpperCase()}`));
      url.searchParams.append('page', String(page));
      url.searchParams.append('size', String(size));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get trackings by stage: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [Tracking Service] Trackings by stage retrieved successfully:', result);

      const trackings = result.data?.trackings || [];
      const transformedTrackings = trackings.map(tracking => this.transformTrackingData(tracking));

      const processedResult = {
        success: true,
        message: result.message || 'Trackings retrieved successfully',
        data: transformedTrackings,
        pagination: {
          currentPage: result.data?.currentPage || page,
          totalPages: result.data?.totalPages || 1,
          totalElements: result.data?.totalElements || transformedTrackings.length,
          pageSize: result.data?.pageSize || size,
          hasNext: result.data?.hasNext || false,
          hasPrevious: result.data?.hasPrevious || false,
          first: result.data?.first || true,
          last: result.data?.last || true
        },
        stage: stage.toUpperCase(),
        raw: result
      };

      this.setCache(cacheKey, processedResult);
      return processedResult;

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to get trackings by stage:', error);
      throw new Error(`Failed to get trackings by stage: ${error.message}`);
    }
  }

  async getAllCurricula(page = 0, size = 20) {
    try {
      console.log('🔄 [Tracking Service] Getting all curriculum trackings...');
      return await this.getTrackingsByStage('IDEATION', page, size);
    } catch (error) {
      console.warn('⚠️ [Tracking Service] Could not get from IDEATION stage, returning empty result');
      return {
        success: true,
        message: 'No trackings found',
        data: [],
        pagination: { currentPage: page, totalPages: 0, totalElements: 0, pageSize: size, hasNext: false, hasPrevious: false, first: true, last: true }
      };
    }
  }

  // Convenience method for stage actions
  async performStageAction(curriculumId, stage, action, data = {}) {
    try {
      const backendAction = this.mapFrontendActionToBackend(action);
      const notes = data.feedback || data.notes || '';
      const documents = data.documents || [];
      return await this.performTrackingAction(curriculumId, backendAction, notes, documents);
    } catch (error) {
      console.error('❌ [Tracking Service] Failed to perform stage action:', error);
      throw error;
    }
  }

  async getTrackingById(trackingId) {
    throw new Error('getTrackingById endpoint not yet implemented');
  }

  async getMyInitiatedTrackings(page = 0, size = 20) {
    throw new Error('getMyInitiatedTrackings endpoint not yet implemented');
  }

  async getMyAssignedTrackings(page = 0, size = 20) {
    throw new Error('getMyAssignedTrackings endpoint not yet implemented');
  }

  async getTrackingBySchool(schoolId, page = 0, size = 20) {
    throw new Error('getTrackingBySchool endpoint not yet implemented');
  }
}

const curriculumTrackingService = new CurriculumTrackingService();

// Debug helpers 
if (typeof window !== 'undefined') {
  window.curriculumTrackingService = curriculumTrackingService;
  window.testTrackingInitiate = (data, docs) => curriculumTrackingService.initiateCurriculumTracking(data, docs);
  window.testTrackingAction = (id, action, notes, docs) => curriculumTrackingService.performTrackingAction(id, action, notes, docs);
  window.testTrackingStage = (stage) => curriculumTrackingService.getTrackingsByStage(stage);
  window.testDocumentDownload = (id) => curriculumTrackingService.downloadTrackingDocument(id);
  
  // Debug function to check field mappings
  window.debugTrackingMappings = (curriculum) => {
    console.log('🔍 Debugging Curriculum Mappings:');
    console.log('Raw API Data:', curriculum._rawApiData);
    console.log('Transformed Data:', curriculum);
    
    const criticalFields = [
      'initiatedByName', 'initiatedByEmail', 
      'currentAssigneeName', 'currentAssigneeEmail',
      'displayCurriculumName', 'currentStageDisplayName', 'statusDisplayName'
    ];
    
    const mappingReport = {};
    criticalFields.forEach(field => {
      mappingReport[field] = {
        'API Value': curriculum._rawApiData?.[field] || 'NOT FOUND',
        'Frontend Value': curriculum[field] || 'NOT MAPPED',
        'Status': curriculum[field] ? '✅ MAPPED' : '❌ MISSING'
      };
    });
    
    console.table(mappingReport);
    return mappingReport;
  };
  
  // Quick test function
  window.testFieldMappings = async () => {
    try {
      const result = await curriculumTrackingService.getAllCurricula(0, 5);
      if (result.data && result.data.length > 0) {
        const firstCurriculum = result.data[0];
        return window.debugTrackingMappings(firstCurriculum);
      } else {
        console.log('No curricula found to test mappings');
        return null;
      }
    } catch (error) {
      console.error('Error testing field mappings:', error);
      return null;
    }
  };
}

export default curriculumTrackingService;