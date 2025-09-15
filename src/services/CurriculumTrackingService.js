import authService from "./authService";

class CurriculumTrackingService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    console.log('🔄 Curriculum Tracking Service initialized with base URL:', this.baseURL);
    
    // Cache for tracking data
    this.trackingCache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_DURATION = 2 * 60 * 1000; 

    
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
        'CUE_EXTERNAL_AUDIT': 'cue_review',
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
      'CUE_EXTERNAL_AUDIT': 60,
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

  
  extractNumericId(curriculum) {
   
    if (curriculum.id && typeof curriculum.id === 'number') {
      return curriculum.id;
    }
    
    if (curriculum.id && typeof curriculum.id === 'string' && /^\d+$/.test(curriculum.id)) {
      return parseInt(curriculum.id);
    }

   
    if (curriculum.trackingId && typeof curriculum.trackingId === 'string') {
      
      if (curriculum._rawApiData && curriculum._rawApiData.id) {
        return curriculum._rawApiData.id;
      }
      
      
      const numMatch = curriculum.trackingId.match(/\d+/);
      if (numMatch) {
        console.warn(`⚠️ [Tracking Service] Using extracted number ${numMatch[0]} from trackingId ${curriculum.trackingId}`);
        return parseInt(numMatch[0]);
      }
    }

    throw new Error(`Cannot extract numeric ID from curriculum object. Available: ${JSON.stringify({
      id: curriculum.id,
      trackingId: curriculum.trackingId,
      hasRawData: !!curriculum._rawApiData
    })}`);
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
    if (['CUE_REVIEW', 'CUE_EXTERNAL_AUDIT', 'SITE_INSPECTION'].includes(stage)) return 'high';
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

 
  createStagesObject(apiData) {
    const stages = this.STAGE_ORDER.reduce((acc, stage) => {
      acc[stage] = this.createDefaultStageObject();
      return acc;
    }, {});

    const currentFrontendStage = this.mapApiStageToFrontend(apiData.currentStage);
    const currentIndex = this.STAGE_ORDER.indexOf(currentFrontendStage);

   
    for (let i = 0; i < currentIndex; i++) {
      stages[this.STAGE_ORDER[i]] = {
        ...stages[this.STAGE_ORDER[i]],
        status: 'completed',
        completedDate: apiData.createdAt
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

  
  transformTrackingData(apiData) {
    if (!apiData) return null;

    console.log('🔄 [Tracking Service] Transforming API data:', apiData);

   
    const coreData = {
      id: apiData.id, 
      trackingId: apiData.trackingId,
      title: apiData.displayCurriculumName || apiData.proposedCurriculumName || apiData.curriculumName,
      displayTitle: apiData.displayCurriculumName,
      displayCode: apiData.displayCurriculumCode,
      curriculumId: apiData.curriculumId,
      curriculumName: apiData.curriculumName,
      curriculumCode: apiData.curriculumCode
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
      statusDisplayName: apiData.statusDisplayName,
      originalCurrentStage: apiData.currentStage,
      originalStatus: apiData.status 
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
      _rawApiData: apiData // Keep for debugging and future use
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

  
  async performTrackingAction(trackingIdentifier, action, notes = '', documents = []) {
    try {
      console.log('🔄 [Tracking Service] Performing tracking action:', { trackingIdentifier, action, notes });

      // Validation
      if (!trackingIdentifier || !action) {
        throw new Error('Tracking identifier and action are required');
      }

      const validActions = Object.values(this.STAGE_MAPPINGS.ACTION_TO_BACKEND);
      if (!validActions.includes(action.toUpperCase())) {
        throw new Error(`Invalid action: ${action}. Valid actions are: ${validActions.join(', ')}`);
      }

      // Extract numeric ID 
      let numericId;
      if (typeof trackingIdentifier === 'object') {
        numericId = this.extractNumericId(trackingIdentifier);
      } else if (typeof trackingIdentifier === 'string' && /^\d+$/.test(trackingIdentifier)) {
        numericId = parseInt(trackingIdentifier);
      } else if (typeof trackingIdentifier === 'number') {
        numericId = trackingIdentifier;
      } else {
        throw new Error(`Invalid tracking identifier: ${trackingIdentifier}. Expected numeric ID or curriculum object.`);
      }

      console.log(`🔍 [Tracking Service] Using numeric ID: ${numericId} for tracking action`);

      // Prepare form data
      const formData = new FormData();
      formData.append('trackingId', String(numericId)); // Use numeric ID
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

  //  Get tracking by ID
  async getTrackingById(trackingId) {
    try {
      console.log('🔄 [Tracking Service] Getting tracking by ID:', trackingId);

      if (!trackingId) {
        throw new Error('Tracking ID is required');
      }

      const cacheKey = `tracking_${trackingId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(this.buildApiUrl(`/tracking/${trackingId}`), {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get tracking by ID: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [Tracking Service] Tracking by ID retrieved successfully:', result);

      const transformedData = result.data ? this.transformTrackingData(result.data) : null;

      const processedResult = {
        success: true,
        message: result.message || 'Tracking retrieved successfully',
        data: transformedData,
        raw: result
      };

      this.setCache(cacheKey, processedResult);
      return processedResult;

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to get tracking by ID:', error);
      throw new Error(`Failed to get tracking by ID: ${error.message}`);
    }
  }

  //  Get my initiated trackings
  async getMyInitiatedTrackings(page = 0, size = 20) {
    try {
      console.log('🔄 [Tracking Service] Getting my initiated trackings:', { page, size });

      const cacheKey = `my_initiated_${page}_${size}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const url = new URL(this.buildApiUrl('/tracking/my-trackings'));
      url.searchParams.append('page', String(page));
      url.searchParams.append('size', String(size));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get my initiated trackings: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [Tracking Service] My initiated trackings retrieved successfully:', result);

      const trackings = result.data?.trackings || [];
      const transformedTrackings = trackings.map(tracking => this.transformTrackingData(tracking));

      const processedResult = {
        success: true,
        message: result.message || 'Initiated trackings retrieved successfully',
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
        raw: result
      };

      this.setCache(cacheKey, processedResult);
      return processedResult;

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to get my initiated trackings:', error);
      throw new Error(`Failed to get my initiated trackings: ${error.message}`);
    }
  }

  //  Get my assigned trackings
  async getMyAssignedTrackings(page = 0, size = 20) {
    try {
      console.log('🔄 [Tracking Service] Getting my assigned trackings:', { page, size });

      const cacheKey = `my_assigned_${page}_${size}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const url = new URL(this.buildApiUrl('/tracking/my-assignments'));
      url.searchParams.append('page', String(page));
      url.searchParams.append('size', String(size));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get my assigned trackings: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [Tracking Service] My assigned trackings retrieved successfully:', result);

      const trackings = result.data?.trackings || [];
      const transformedTrackings = trackings.map(tracking => this.transformTrackingData(tracking));

      const processedResult = {
        success: true,
        message: result.message || 'Assigned trackings retrieved successfully',
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
        raw: result
      };

      this.setCache(cacheKey, processedResult);
      return processedResult;

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to get my assigned trackings:', error);
      throw new Error(`Failed to get my assigned trackings: ${error.message}`);
    }
  }

  //  Get tracking by school 
  async getTrackingBySchool(schoolId, page = 0, size = 20) {
    try {
      console.log('🔄 [Tracking Service] Getting tracking by school:', { schoolId, page, size });

      if (!schoolId) {
        throw new Error('School ID is required');
      }

      const cacheKey = `school_${schoolId}_${page}_${size}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const url = new URL(this.buildApiUrl(`/tracking/school/${schoolId}`));
      url.searchParams.append('page', String(page));
      url.searchParams.append('size', String(size));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get tracking by school: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [Tracking Service] Tracking by school retrieved successfully:', result);

      const trackings = result.data?.trackings || [];
      const transformedTrackings = trackings.map(tracking => this.transformTrackingData(tracking));

      const processedResult = {
        success: true,
        message: result.message || 'School trackings retrieved successfully',
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
        schoolId: schoolId,
        raw: result
      };

      this.setCache(cacheKey, processedResult);
      return processedResult;

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to get tracking by school:', error);
      throw new Error(`Failed to get tracking by school: ${error.message}`);
    }
  }

 

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
      
    
      requiredFields.forEach(field => {
        formData.append(field, String(trackingData[field]));
      });

     
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

 
  async performStageAction(curriculumIdentifier, stage, action, data = {}) {
    try {
      console.log('🔄 [Tracking Service] Performing stage action:', { curriculumIdentifier, stage, action, data });
      
      const backendAction = this.mapFrontendActionToBackend(action);
      const notes = data.feedback || data.notes || '';
      const documents = data.documents || [];
      
      // Use the enhanced performTrackingAction which handles ID extraction
      return await this.performTrackingAction(curriculumIdentifier, backendAction, notes, documents);
    } catch (error) {
      console.error('❌ [Tracking Service] Failed to perform stage action:', error);
      throw error;
    }
  }

  
  async searchTrackings(searchParams = {}, page = 0, size = 20) {
    try {
      console.log('🔄 [Tracking Service] Searching trackings:', { searchParams, page, size });

     
      let allTrackings = [];
      
      if (searchParams.schoolId) {
        const schoolResult = await this.getTrackingBySchool(searchParams.schoolId, 0, 1000);
        allTrackings = schoolResult.data;
      } else if (searchParams.stage) {
        const stageResult = await this.getTrackingsByStage(searchParams.stage, 0, 1000);
        allTrackings = stageResult.data;
      } else {
        const allResult = await this.getAllCurricula(0, 1000);
        allTrackings = allResult.data;
      }

      // Apply filters
      let filteredTrackings = allTrackings;

      if (searchParams.search) {
        const searchTerm = searchParams.search.toLowerCase();
        filteredTrackings = filteredTrackings.filter(tracking =>
          tracking.title?.toLowerCase().includes(searchTerm) ||
          tracking.trackingId?.toLowerCase().includes(searchTerm) ||
          tracking.department?.toLowerCase().includes(searchTerm) ||
          tracking.school?.toLowerCase().includes(searchTerm)
        );
      }

      if (searchParams.status) {
        filteredTrackings = filteredTrackings.filter(tracking =>
          tracking.status === searchParams.status
        );
      }

      if (searchParams.department) {
        filteredTrackings = filteredTrackings.filter(tracking =>
          tracking.department === searchParams.department
        );
      }

      // Apply pagination
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedTrackings = filteredTrackings.slice(startIndex, endIndex);

      return {
        success: true,
        message: `Found ${filteredTrackings.length} matching trackings`,
        data: paginatedTrackings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredTrackings.length / size),
          totalElements: filteredTrackings.length,
          pageSize: size,
          hasNext: endIndex < filteredTrackings.length,
          hasPrevious: page > 0,
          first: page === 0,
          last: endIndex >= filteredTrackings.length
        },
        searchParams
      };

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to search trackings:', error);
      throw new Error(`Failed to search trackings: ${error.message}`);
    }
  }

  // Get tracking statistics
  async getTrackingStatistics() {
    try {
      console.log('🔄 [Tracking Service] Getting tracking statistics...');

      const cacheKey = 'tracking_statistics';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Get data from multiple sources
      const [myInitiated, myAssigned, allTrackings] = await Promise.allSettled([
        this.getMyInitiatedTrackings(0, 1000),
        this.getMyAssignedTrackings(0, 1000),
        this.getAllCurricula(0, 1000)
      ]);

      const stats = {
        myInitiated: myInitiated.status === 'fulfilled' ? myInitiated.value.data.length : 0,
        myAssigned: myAssigned.status === 'fulfilled' ? myAssigned.value.data.length : 0,
        total: allTrackings.status === 'fulfilled' ? allTrackings.value.data.length : 0,
        byStatus: {},
        byStage: {},
        byPriority: {}
      };

      if (allTrackings.status === 'fulfilled') {
        const trackings = allTrackings.value.data;
        
        // Calculate status distribution
        stats.byStatus = trackings.reduce((acc, tracking) => {
          acc[tracking.status] = (acc[tracking.status] || 0) + 1;
          return acc;
        }, {});

        // Calculate stage distribution
        stats.byStage = trackings.reduce((acc, tracking) => {
          acc[tracking.currentStage] = (acc[tracking.currentStage] || 0) + 1;
          return acc;
        }, {});

        // Calculate priority distribution
        stats.byPriority = trackings.reduce((acc, tracking) => {
          acc[tracking.priority] = (acc[tracking.priority] || 0) + 1;
          return acc;
        }, {});

        // Calculate completion metrics
        stats.completed = stats.byStatus.completed || 0;
        stats.inProgress = (stats.byStatus.under_review || 0) + (stats.byStatus.pending_approval || 0);
        stats.onHold = stats.byStatus.on_hold || 0;
        stats.overdue = trackings.filter(t => this.isOverdue(t._rawApiData)).length;
      }

      const result = {
        success: true,
        message: 'Tracking statistics retrieved successfully',
        data: stats
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to get tracking statistics:', error);
      throw new Error(`Failed to get tracking statistics: ${error.message}`);
    }
  }

  // Batch operations
  async batchUpdateTrackings(trackingIds, action, notes = '') {
    try {
      console.log('🔄 [Tracking Service] Performing batch update:', { trackingIds, action, notes });

      const results = [];
      const errors = [];

      for (const trackingId of trackingIds) {
        try {
          const result = await this.performTrackingAction(trackingId, action, notes);
          results.push({ trackingId, success: true, data: result.data });
        } catch (error) {
          errors.push({ trackingId, error: error.message });
        }
      }

      return {
        success: errors.length === 0,
        message: `Batch operation completed. ${results.length} successful, ${errors.length} failed.`,
        results,
        errors,
        totalProcessed: trackingIds.length
      };

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to perform batch update:', error);
      throw new Error(`Failed to perform batch update: ${error.message}`);
    }
  }

  async exportTrackings(format = 'json', filters = {}) {
    try {
      console.log('🔄 [Tracking Service] Exporting trackings:', { format, filters });

      
      const searchResult = await this.searchTrackings(filters, 0, 10000);
      const trackings = searchResult.data;

      if (format === 'json') {
        const jsonData = JSON.stringify(trackings, null, 2);
        this.downloadFile(jsonData, 'curriculum-trackings.json', 'application/json');
      } else if (format === 'csv') {
        const csvData = this.convertToCsv(trackings);
        this.downloadFile(csvData, 'curriculum-trackings.csv', 'text/csv');
      }

      return {
        success: true,
        message: `${trackings.length} trackings exported successfully`,
        count: trackings.length,
        format
      };

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to export trackings:', error);
      throw new Error(`Failed to export trackings: ${error.message}`);
    }
  }

  // Helper method to download file
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Helper method to convert to CSV
  convertToCsv(trackings) {
    if (trackings.length === 0) return '';

    const headers = [
      'Tracking ID', 'Title', 'School', 'Department', 'Current Stage', 
      'Status', 'Priority', 'Initiated By', 'Current Assignee', 
      'Created Date', 'Days in Stage', 'Total Days'
    ];

    const rows = trackings.map(tracking => [
      tracking.trackingId,
      tracking.title,
      tracking.school,
      tracking.department,
      tracking.currentStage,
      tracking.status,
      tracking.priority,
      tracking.initiatedByName,
      tracking.currentAssigneeName,
      tracking.submittedDate,
      tracking.daysInCurrentStage,
      tracking.totalDays
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // VALIDATION AND HELPER METHODS

  validateTrackingData(data) {
    const errors = [];
    
    if (!data.proposedCurriculumName) errors.push('Curriculum name is required');
    if (!data.proposedCurriculumCode) errors.push('Curriculum code is required');
    if (!data.schoolId) errors.push('School is required');
    if (!data.departmentId) errors.push('Department is required');
    if (!data.academicLevelId) errors.push('Academic level is required');
    if (!data.proposedDurationSemesters) errors.push('Duration is required');
    if (!data.curriculumDescription) errors.push('Description is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getTrackingDisplayData(tracking) {
    return {
      title: tracking.title,
      id: tracking.trackingId,
      status: tracking.statusDisplayName || tracking.status,
      stage: tracking.currentStageDisplayName || tracking.currentStage,
      school: tracking.school,
      department: tracking.department,
      priority: tracking.priority,
      daysInStage: tracking.daysInCurrentStage,
      assignee: tracking.currentAssigneeName,
      initiator: tracking.initiatedByName
    };
  }
}

const curriculumTrackingService = new CurriculumTrackingService();

//  debug helpers
if (typeof window !== 'undefined') {
  window.curriculumTrackingService = curriculumTrackingService;
  
 
  window.testTrackingInitiate = (data, docs) => curriculumTrackingService.initiateCurriculumTracking(data, docs);
  window.testTrackingAction = (id, action, notes, docs) => curriculumTrackingService.performTrackingAction(id, action, notes, docs);
  window.testTrackingStage = (stage) => curriculumTrackingService.getTrackingsByStage(stage);
  window.testDocumentDownload = (id) => curriculumTrackingService.downloadTrackingDocument(id);
  
 
  window.testGetTrackingById = (id) => curriculumTrackingService.getTrackingById(id);
  window.testGetMyInitiated = (page, size) => curriculumTrackingService.getMyInitiatedTrackings(page, size);
  window.testGetMyAssigned = (page, size) => curriculumTrackingService.getMyAssignedTrackings(page, size);
  window.testGetBySchool = (schoolId, page, size) => curriculumTrackingService.getTrackingBySchool(schoolId, page, size);
  window.testSearchTrackings = (params, page, size) => curriculumTrackingService.searchTrackings(params, page, size);
  window.testTrackingStats = () => curriculumTrackingService.getTrackingStatistics();
  window.testExportTrackings = (format, filters) => curriculumTrackingService.exportTrackings(format, filters);
  
  // Debug function to test ID extraction
  window.testIdExtraction = (curriculum) => {
    try {
      const numericId = curriculumTrackingService.extractNumericId(curriculum);
      console.log(`✅ Extracted ID: ${numericId} from curriculum:`, curriculum);
      return numericId;
    } catch (error) {
      console.error(`❌ Failed to extract ID from curriculum:`, curriculum, error);
      return null;
    }
  };
  
  
  window.debugTrackingMappings = (curriculum) => {
    console.log('🔍 Enhanced Debugging Curriculum Mappings:');
    console.log('Raw API Data:', curriculum._rawApiData);
    console.log('Transformed Data:', curriculum);
    
    const criticalFields = [
      'id', 'trackingId', 'initiatedByName', 'initiatedByEmail', 
      'currentAssigneeName', 'currentAssigneeEmail',
      'displayCurriculumName', 'currentStageDisplayName', 'statusDisplayName',
      'proposedCurriculumName', 'proposedCurriculumCode', 'proposedDurationSemesters',
      'curriculumDescription', 'schoolId', 'schoolName', 'departmentId', 'departmentName',
      'academicLevelId', 'academicLevelName', 'currentStage', 'status',
      'proposedEffectiveDate', 'proposedExpiryDate', 'initialNotes'
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
  
 
  window.testAllNewEndpoints = async () => {
    console.log('🔄 Testing all new endpoints...');
    
    try {
     
      console.log('1. Testing getTrackingById...');
      const byId = await curriculumTrackingService.getTrackingById(2);
      console.log('✅ getTrackingById result:', byId);
      
      
      console.log('2. Testing getMyInitiatedTrackings...');
      const myInitiated = await curriculumTrackingService.getMyInitiatedTrackings(0, 5);
      console.log('✅ getMyInitiatedTrackings result:', myInitiated);
      
      
      console.log('3. Testing getMyAssignedTrackings...');
      const myAssigned = await curriculumTrackingService.getMyAssignedTrackings(0, 5);
      console.log('✅ getMyAssignedTrackings result:', myAssigned);
      
     
      console.log('4. Testing getTrackingBySchool...');
      const bySchool = await curriculumTrackingService.getTrackingBySchool(1, 0, 5);
      console.log('✅ getTrackingBySchool result:', bySchool);
      
      
      console.log('5. Testing getTrackingStatistics...');
      const stats = await curriculumTrackingService.getTrackingStatistics();
      console.log('✅ getTrackingStatistics result:', stats);
      
      console.log('🎉 All new endpoints tested successfully!');
      return {
        byId, myInitiated, myAssigned, bySchool, stats
      };
      
    } catch (error) {
      console.error('❌ Error testing new endpoints:', error);
      return { error: error.message };
    }
  };
  
 
  window.testTrackingActionFixed = async (curriculum) => {
    try {
      console.log('🔄 Testing fixed tracking action with curriculum:', curriculum);
      const numericId = curriculumTrackingService.extractNumericId(curriculum);
      console.log(`✅ Extracted numeric ID: ${numericId}`);
      
      const result = await curriculumTrackingService.performTrackingAction(
        numericId, 
        'APPROVE', 
        'Testing fixed action with numeric ID'
      );
      console.log('✅ Fixed tracking action result:', result);
      return result;
    } catch (error) {
      console.error('❌ Fixed tracking action failed:', error);
      return { error: error.message };
    }
  };
}

export default curriculumTrackingService;