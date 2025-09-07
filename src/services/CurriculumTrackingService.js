import authService from "./authService";

class CurriculumTrackingService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    console.log('🔄 Curriculum Tracking Service initialized with base URL:', this.baseURL);
    
    // Cache for tracking data
    this.trackingCache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_DURATION = 2 * 60 * 1000; 
  }

  

  buildApiUrl(endpoint) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('📍 [Tracking Service] Building API URL:', url);
    return url;
  }

  async getHeaders(isFormData = false) {
    try {
      const token = await authService.getValidToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
    
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      
      return headers;
    } catch (error) {
      console.error('❌ [Tracking Service] Failed to get valid token:', error);
      throw new Error('Authentication required. Please log in again.');
    }
  }

  transformTrackingData(apiData) {
    if (!apiData) return null;

    return {
      id: apiData.trackingId || apiData.id,
      trackingId: apiData.trackingId,
      title: apiData.displayCurriculumName || apiData.proposedCurriculumName,
      school: apiData.schoolName,
      department: apiData.departmentName,
      currentStage: this.mapApiStageToFrontend(apiData.currentStage),
      status: this.mapApiStatusToFrontend(apiData.status),
      priority: this.determinePriority(apiData),
      submittedDate: this.formatDate(apiData.createdAt),
      lastUpdated: this.formatDate(apiData.updatedAt),
      daysInCurrentStage: this.calculateDaysInStage(apiData.updatedAt),
      totalDays: this.calculateTotalDays(apiData.createdAt),
      estimatedCompletion: this.calculateEstimatedCompletion(apiData),
      
      // Additional details
      schoolId: apiData.schoolId,
      departmentId: apiData.departmentId,
      academicLevelId: apiData.academicLevelId,
      academicLevelName: apiData.academicLevelName,
      proposedCurriculumName: apiData.proposedCurriculumName,
      proposedCurriculumCode: apiData.proposedCurriculumCode,
      proposedDurationSemesters: apiData.proposedDurationSemesters,
      curriculumDescription: apiData.curriculumDescription,
      proposedEffectiveDate: apiData.proposedEffectiveDate,
      proposedExpiryDate: apiData.proposedExpiryDate,
      
      // People
      initiatedByName: apiData.initiatedByName,
      initiatedByEmail: apiData.initiatedByEmail,
      currentAssigneeName: apiData.currentAssigneeName,
      currentAssigneeEmail: apiData.currentAssigneeEmail,
      
      // Status flags
      isActive: apiData.isActive,
      isCompleted: apiData.isCompleted,
      isIdeationStage: apiData.isIdeationStage,
      
      // Dates
      expectedCompletionDate: apiData.expectedCompletionDate,
      actualCompletionDate: apiData.actualCompletionDate,
      
      // Notes
      initialNotes: apiData.initialNotes,
      
     
      stages: this.createStagesObject(apiData)
    };
  }

 
  mapApiStageToFrontend(apiStage) {
    const stageMapping = {
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
    };
    
    return stageMapping[apiStage] || 'initiation';
  }

  
  mapApiStatusToFrontend(apiStatus) {
    const statusMapping = {
      'INITIATED': 'under_review',
      'IN_PROGRESS': 'under_review',
      'UNDER_REVIEW': 'under_review',
      'PENDING_APPROVAL': 'pending_approval',
      'APPROVED': 'pending_approval',
      'ON_HOLD': 'on_hold',
      'REJECTED': 'rejected',
      'COMPLETED': 'completed',
      'ACCREDITED': 'completed'
    };
    
    return statusMapping[apiStatus] || 'under_review';
  }

 
  determinePriority(apiData) {
    
    if (apiData.currentStage === 'CUE_REVIEW' || apiData.currentStage === 'SITE_INSPECTION') {
      return 'high';
    }
    if (apiData.isIdeationStage) {
      return 'low';
    }
    return 'medium';
  }

  
  createStagesObject(apiData) {
    const stages = {
      initiation: { status: 'pending', documents: [], notes: '' },
      school_board: { status: 'pending', documents: [], notes: '' },
      dean_committee: { status: 'pending', documents: [], notes: '' },
      senate: { status: 'pending', documents: [], notes: '' },
      qa_review: { status: 'pending', documents: [], notes: '' },
      vice_chancellor: { status: 'pending', documents: [], notes: '' },
      cue_review: { status: 'pending', documents: [], notes: '' },
      site_inspection: { status: 'pending', documents: [], notes: '' }
    };

    // Mark completed stages
    const currentFrontendStage = this.mapApiStageToFrontend(apiData.currentStage);
    const stageOrder = Object.keys(stages);
    const currentIndex = stageOrder.indexOf(currentFrontendStage);

    // Mark previous stages as completed
    for (let i = 0; i < currentIndex; i++) {
      stages[stageOrder[i]].status = 'completed';
    }

    // Set current stage status
    if (currentIndex >= 0) {
      const mappedStatus = this.mapApiStatusToFrontend(apiData.status);
      stages[currentFrontendStage].status = mappedStatus === 'completed' ? 'completed' : 'under_review';
      
      // Add assignee info to current stage
      stages[currentFrontendStage].assignedTo = apiData.currentAssigneeName;
      stages[currentFrontendStage].notes = apiData.initialNotes || '';
    }

    return stages;
  }

  
  formatDate(dateString) {
    if (!dateString) return null;
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  calculateDaysInStage(updatedAt) {
    if (!updatedAt) return 0;
    try {
      const updated = new Date(updatedAt);
      const now = new Date();
      const diffTime = Math.abs(now - updated);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  calculateTotalDays(createdAt) {
    if (!createdAt) return 0;
    try {
      const created = new Date(createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - created);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  calculateEstimatedCompletion(apiData) {
    if (apiData.expectedCompletionDate) {
      return this.formatDate(apiData.expectedCompletionDate);
    }
    
    // Estimate based on current stage and average processing time
    const stageEstimates = {
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
    
    const estimatedDays = stageEstimates[apiData.currentStage] || 30;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
    
    return this.formatDate(estimatedDate.toISOString());
  }


  getCacheKey(key) {
    return `tracking_${key}`;
  }

  isCacheValid(key) {
    const cacheKey = this.getCacheKey(key);
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry && Date.now() < expiry;
  }

  getFromCache(key) {
    const cacheKey = this.getCacheKey(key);
    if (this.isCacheValid(key)) {
      console.log(`📦 [Tracking Service] Using cached data for: ${key}`);
      return this.trackingCache.get(cacheKey);
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

  

  
  async initiateCurriculumTracking(trackingData, documents = []) {
    try {
      console.log('🔄 [Tracking Service] Initiating curriculum tracking:', trackingData);

      const requiredFields = [
        'schoolId', 'departmentId', 'academicLevelId', 
        'proposedCurriculumName', 'proposedCurriculumCode', 
        'proposedDurationSemesters', 'curriculumDescription'
      ];

      for (const field of requiredFields) {
        if (!trackingData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const headers = await this.getHeaders(true); // true for FormData
      const url = this.buildApiUrl('/tracking/initiate');

      const formData = new FormData();
      
      formData.append('schoolId', String(trackingData.schoolId));
      formData.append('departmentId', String(trackingData.departmentId));
      formData.append('academicLevelId', String(trackingData.academicLevelId));
      formData.append('proposedCurriculumName', trackingData.proposedCurriculumName);
      formData.append('proposedCurriculumCode', trackingData.proposedCurriculumCode);
      formData.append('proposedDurationSemesters', String(trackingData.proposedDurationSemesters));
      formData.append('curriculumDescription', trackingData.curriculumDescription);

    
      if (trackingData.proposedEffectiveDate) {
        formData.append('proposedEffectiveDate', trackingData.proposedEffectiveDate);
      }
      if (trackingData.proposedExpiryDate) {
        formData.append('proposedExpiryDate', trackingData.proposedExpiryDate);
      }
      if (trackingData.initialNotes) {
        formData.append('initialNotes', trackingData.initialNotes);
      }

      
      if (documents && documents.length > 0) {
        documents.forEach((file, index) => {
          formData.append('documents', file);
          console.log(`📎 [Tracking Service] Added document ${index + 1}: ${file.name}`);
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
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

  
  async downloadTrackingDocument(documentId, filename = null) {
    try {
      console.log('🔄 [Tracking Service] Downloading document:', documentId);

      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const headers = await this.getHeaders();
      const url = this.buildApiUrl(`/tracking/documents/download/${documentId}`);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download document: ${response.status} - ${errorText}`);
      }

      
      const blob = await response.blob();
      
      
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

  
  async performTrackingAction(trackingId, action, notes = '', documents = []) {
    try {
      console.log('🔄 [Tracking Service] Performing tracking action:', { trackingId, action, notes });

      if (!trackingId) {
        throw new Error('Tracking ID is required');
      }

      if (!action) {
        throw new Error('Action is required');
      }

      
      const validActions = ['APPROVE', 'REJECT', 'HOLD', 'RESUME', 'REQUEST_CHANGES'];
      if (!validActions.includes(action.toUpperCase())) {
        throw new Error(`Invalid action: ${action}. Valid actions are: ${validActions.join(', ')}`);
      }

      const headers = await this.getHeaders(true); 
      const url = this.buildApiUrl('/tracking/action');

     
      const formData = new FormData();
      formData.append('trackingId', String(trackingId));
      formData.append('action', action.toUpperCase());
      
      if (notes) {
        formData.append('notes', notes);
      }

     
      if (documents && documents.length > 0) {
        documents.forEach((file, index) => {
          formData.append('documents', file);
          console.log(`📎 [Tracking Service] Added action document ${index + 1}: ${file.name}`);
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
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

 
  async getTrackingsByStage(stage, page = 0, size = 20) {
    try {
      console.log('🔄 [Tracking Service] Getting trackings by stage:', { stage, page, size });

      if (!stage) {
        throw new Error('Stage is required');
      }

      const cacheKey = `stage_${stage}_${page}_${size}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const headers = await this.getHeaders();
      const url = this.buildApiUrl(`/tracking/stage/${stage.toUpperCase()}`);

     
      const urlWithParams = new URL(url);
      urlWithParams.searchParams.append('page', String(page));
      urlWithParams.searchParams.append('size', String(size));

      const response = await fetch(urlWithParams.toString(), {
        method: 'GET',
        headers,
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


  
   //Get all curriculum trackings 
   
  async getAllCurricula(page = 0, size = 20) {
    try {
      console.log('🔄 [Tracking Service] Getting all curriculum trackings...');

      // Get trackings from multiple stages and combine
      const stages = [
        'IDEATION', 'DEPARTMENT_APPROVAL', 'SCHOOL_BOARD_APPROVAL', 
        'DEAN_APPROVAL', 'SENATE_APPROVAL', 'QA_REVIEW', 
        'VICE_CHANCELLOR_APPROVAL', 'CUE_REVIEW', 'SITE_INSPECTION', 'ACCREDITED'
      ];

      const allTrackings = [];
      let totalElements = 0;

     
      try {
        const result = await this.getTrackingsByStage('IDEATION', page, size);
        return result;
      } catch (error) {
        console.warn('⚠️ [Tracking Service] Could not get from IDEATION stage, returning empty result');
        return {
          success: true,
          message: 'No trackings found',
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalElements: 0,
            pageSize: size,
            hasNext: false,
            hasPrevious: false,
            first: true,
            last: true
          }
        };
      }

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to get all curricula:', error);
      throw new Error(`Failed to get all curriculum trackings: ${error.message}`);
    }
  }

  
  mapFrontendActionToBackend(frontendAction) {
    const actionMapping = {
      'approve': 'APPROVE',
      'reject': 'REJECT', 
      'hold': 'HOLD',
      'resume': 'RESUME',
      'request_changes': 'REQUEST_CHANGES'
    };
    
    return actionMapping[frontendAction] || frontendAction.toUpperCase();
  }

 
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
    
    console.log('🔄 [Tracking Service] getTrackingById - Not yet implemented');
    throw new Error('getTrackingById endpoint not yet implemented');
  }

  async getMyInitiatedTrackings(page = 0, size = 20) {
    
    console.log('🔄 [Tracking Service] getMyInitiatedTrackings - Not yet implemented');
    throw new Error('getMyInitiatedTrackings endpoint not yet implemented');
  }

  async getMyAssignedTrackings(page = 0, size = 20) {
    
    console.log('🔄 [Tracking Service] getMyAssignedTrackings - Not yet implemented');
    throw new Error('getMyAssignedTrackings endpoint not yet implemented');
  }

  async getTrackingBySchool(schoolId, page = 0, size = 20) {
    
    console.log('🔄 [Tracking Service] getTrackingBySchool - Not yet implemented');
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
}

export default curriculumTrackingService;