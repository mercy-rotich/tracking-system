import authService from "./authService";


class TrackingEndpointsRegistry {
  constructor() {
   
    this.endpoints = {
      
      GET_BY_ID: { path: '/tracking/{id}', method: 'GET' },
      GET_MY_INITIATED: { path: '/tracking/my-trackings', method: 'GET' },
      GET_MY_ASSIGNED: { path: '/tracking/my-assignments', method: 'GET' },
      GET_BY_SCHOOL: { path: '/tracking/school/{schoolId}', method: 'GET' },
      GET_BY_STAGE: { path: '/tracking/stage/{stage}', method: 'GET' },
      
      
      GET_BY_ASSIGNEE: { path: '/tracking/assignee/{assigneeId}', method: 'GET' },
      GET_BY_INITIATOR: { path: '/tracking/initiator/{initiatorId}', method: 'GET' },
      GET_BY_DEPARTMENT: { path: '/tracking/department/{departmentId}', method: 'GET' },
      
      // Action endpoints
      INITIATE: { path: '/tracking/initiate', method: 'POST' },
      PERFORM_ACTION: { path: '/tracking/action', method: 'POST' },
      DOWNLOAD_DOCUMENT: { path: '/tracking/documents/download/{documentId}', method: 'GET' },
      
      
      GET_STATISTICS: { path: '/tracking/statistics', method: 'GET' },
      SEARCH: { path: '/tracking/search', method: 'GET' },
      EXPORT: { path: '/tracking/export', method: 'GET' }
    };
  }

  getEndpoint(name) {
    const endpoint = this.endpoints[name];
    if (!endpoint) {
      throw new Error(`Endpoint ${name} not found in registry`);
    }
    return endpoint;
  }

  buildUrl(baseURL, endpointName, pathParams = {}, queryParams = {}) {
    const endpoint = this.getEndpoint(endpointName);
    let path = endpoint.path;
    
    
    Object.entries(pathParams).forEach(([key, value]) => {
      path = path.replace(`{${key}}`, value);
    });
    
    const url = new URL(`${baseURL}${path}`);
    
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
    
    return url.toString();
  }
}


class TrackingDataTransformer {
  constructor() {
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

  mapApiStageToFrontend(apiStage) {
    return this.STAGE_MAPPINGS.API_TO_FRONTEND[apiStage] || 'initiation';
  }

  mapApiStatusToFrontend(apiStatus) {
    return this.STAGE_MAPPINGS.STATUS_TO_FRONTEND[apiStatus] || 'under_review';
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

  formatDate(dateString) {
    if (!dateString) return null;
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

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

  createStagesObject(apiData) {
    const stages = this.STAGE_ORDER.reduce((acc, stage) => {
      acc[stage] = {
        status: 'pending',
        documents: [],
        notes: '',
        assignedTo: null,
        startedDate: null,
        completedDate: null,
        estimatedStart: null,
        feedback: null
      };
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

    return {
      
      id: apiData.id,
      trackingId: apiData.trackingId,
      
      // Curriculum information 
      curriculumId: apiData.curriculumId,
      curriculumName: apiData.curriculumName,
      curriculumCode: apiData.curriculumCode,
      title: apiData.displayCurriculumName || apiData.proposedCurriculumName || apiData.curriculumName,
      displayTitle: apiData.displayCurriculumName,
      displayCode: apiData.displayCurriculumCode,
      proposedCurriculumName: apiData.proposedCurriculumName,
      proposedCurriculumCode: apiData.proposedCurriculumCode,
      proposedDurationSemesters: apiData.proposedDurationSemesters,
      curriculumDescription: apiData.curriculumDescription,
      
      // Academic structure
      schoolId: apiData.schoolId,
      schoolName: apiData.schoolName,
      school: apiData.schoolName,
      departmentId: apiData.departmentId,
      departmentName: apiData.departmentName,
      department: apiData.departmentName,
      academicLevelId: apiData.academicLevelId,
      academicLevelName: apiData.academicLevelName,
      academicLevel: apiData.academicLevelName,
      
      // Workflow status
      currentStage: this.mapApiStageToFrontend(apiData.currentStage),
      currentStageDisplayName: apiData.currentStageDisplayName,
      originalCurrentStage: apiData.currentStage,
      status: this.mapApiStatusToFrontend(apiData.status),
      statusDisplayName: apiData.statusDisplayName,
      originalStatus: apiData.status,
      
      // People information
      initiatedByName: apiData.initiatedByName,
      initiatedByEmail: apiData.initiatedByEmail,
      currentAssigneeName: apiData.currentAssigneeName,
      currentAssigneeEmail: apiData.currentAssigneeEmail,
      
      // Timeline data
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
      expectedCompletionDate: apiData.expectedCompletionDate,
      actualCompletionDate: apiData.actualCompletionDate,
      submittedDate: this.formatDate(apiData.createdAt),
      lastUpdated: this.formatDate(apiData.updatedAt),
      
      // Calculated fields
      daysInCurrentStage: this.calculateDaysFromDate(apiData.updatedAt),
      totalDays: this.calculateDaysFromDate(apiData.createdAt),
      priority: this.determinePriority(apiData),
      
      // Status flags
      isActive: apiData.isActive,
      isCompleted: apiData.isCompleted,
      isIdeationStage: apiData.isIdeationStage,
      
      // Workflow stages
      stages: this.createStagesObject(apiData),
      
      // Additional fields from new endpoints
      proposedEffectiveDate: apiData.proposedEffectiveDate,
      proposedExpiryDate: apiData.proposedExpiryDate,
      initialNotes: apiData.initialNotes,
      recentSteps: apiData.recentSteps,
      
      // Preserve raw API data for debugging and future use
      _rawApiData: apiData,
      
      // Metadata
      _transformedAt: new Date().toISOString(),
      _dataSource: 'api'
    };
  }

  transformApiResponse(response, dataKey = 'data') {
    const data = response[dataKey];
    
    if (Array.isArray(data)) {
      return data.map(item => this.transformTrackingData(item));
    }
    
    if (data && data.trackings && Array.isArray(data.trackings)) {
      return {
        trackings: data.trackings.map(item => this.transformTrackingData(item)),
        pagination: {
          currentPage: data.currentPage || 0,
          totalPages: data.totalPages || 1,
          totalElements: data.totalElements || data.trackings.length,
          pageSize: data.pageSize || 20,
          hasNext: data.hasNext || false,
          hasPrevious: data.hasPrevious || false,
          first: data.first || true,
          last: data.last || true
        }
      };
    }
    
    return this.transformTrackingData(data);
  }
}


class TrackingCacheManager {
  constructor() {
    this.cache = new Map();
    this.expiry = new Map();
    this.CACHE_DURATION = 2 * 60 * 1000; 
  }

  generateKey(endpoint, params = {}) {
    const paramStr = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${endpoint}${paramStr ? `|${paramStr}` : ''}`;
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

  isValid(key) {
    const expiry = this.expiry.get(key);
    return expiry && Date.now() < expiry;
  }
}

class CurriculumTrackingService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    this.endpointsRegistry = new TrackingEndpointsRegistry();
    this.dataTransformer = new TrackingDataTransformer();
    this.cacheManager = new TrackingCacheManager();
    
    console.log('🔄 Enhanced Curriculum Tracking Service initialized');
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

  async makeRequest(endpointName, options = {}) {
    const {
      pathParams = {},
      queryParams = {},
      body = null,
      useCache = true,
      cacheKey = null
    } = options;

    try {
     
      const finalCacheKey = cacheKey || this.cacheManager.generateKey(endpointName, { ...pathParams, ...queryParams });
      
     
      const endpoint = this.endpointsRegistry.getEndpoint(endpointName);
      if (endpoint.method === 'GET' && useCache) {
        const cached = this.cacheManager.get(finalCacheKey);
        if (cached) {
          console.log(`📦 [Tracking Service] Using cached data for: ${endpointName}`);
          return cached;
        }
      }

      // Build URL
      const url = this.endpointsRegistry.buildUrl(this.baseURL, endpointName, pathParams, queryParams);
      console.log(`🔄 [Tracking Service] ${endpoint.method} ${url}`);

      
      const requestOptions = {
        method: endpoint.method,
        headers: await this.getHeaders(body instanceof FormData)
      };

      if (body && endpoint.method !== 'GET') {
        requestOptions.body = body instanceof FormData ? body : JSON.stringify(body);
      }

      // Make request
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${endpoint.method} ${endpointName} failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ [Tracking Service] ${endpointName} successful:`, result);

      
      const transformedData = this.dataTransformer.transformApiResponse(result);
      
      const finalResult = {
        success: true,
        message: result.message || 'Request successful',
        data: transformedData,
        raw: result,
        _requestInfo: {
          endpoint: endpointName,
          method: endpoint.method,
          url,
          timestamp: new Date().toISOString()
        }
      };

      
      if (endpoint.method === 'GET' && useCache) {
        this.cacheManager.set(finalCacheKey, finalResult);
      }

      
      if (endpoint.method !== 'GET') {
        this.cacheManager.clear();
      }

      return finalResult;

    } catch (error) {
      console.error(`❌ [Tracking Service] ${endpointName} failed:`, error);
      throw new Error(`Failed to ${endpointName}: ${error.message}`);
    }
  }


  async getTrackingById(trackingId) {
    return this.makeRequest('GET_BY_ID', {
      pathParams: { id: trackingId }
    });
  }

  async getMyInitiatedTrackings(page = 0, size = 20) {
    return this.makeRequest('GET_MY_INITIATED', {
      queryParams: { page, size }
    });
  }

  async getMyAssignedTrackings(page = 0, size = 20) {
    return this.makeRequest('GET_MY_ASSIGNED', {
      queryParams: { page, size }
    });
  }

  async getTrackingBySchool(schoolId, page = 0, size = 20) {
    return this.makeRequest('GET_BY_SCHOOL', {
      pathParams: { schoolId },
      queryParams: { page, size }
    });
  }

  async getTrackingsByStage(stage, page = 0, size = 20) {
    return this.makeRequest('GET_BY_STAGE', {
      pathParams: { stage: stage.toUpperCase() },
      queryParams: { page, size }
    });
  }

 
  async getTrackingsByAssignee(assigneeId, page = 0, size = 20) {
    console.log('🔄 [Tracking Service] Getting trackings by assignee:', assigneeId);
    return this.makeRequest('GET_BY_ASSIGNEE', {
      pathParams: { assigneeId },
      queryParams: { page, size }
    });
  }

  async getTrackingsByInitiator(initiatorId, page = 0, size = 20) {
    console.log('🔄 [Tracking Service] Getting trackings by initiator:', initiatorId);
    return this.makeRequest('GET_BY_INITIATOR', {
      pathParams: { initiatorId },
      queryParams: { page, size }
    });
  }

  async getTrackingsByDepartment(departmentId, page = 0, size = 20) {
    console.log('🔄 [Tracking Service] Getting trackings by department:', departmentId);
    return this.makeRequest('GET_BY_DEPARTMENT', {
      pathParams: { departmentId },
      queryParams: { page, size }
    });
  }

  async getTrackingsForViewMode(viewMode, identifier = null, page = 0, size = 20) {
    console.log('🔄 [Tracking Service] Getting trackings for view mode:', viewMode);

    switch (viewMode) {
      case 'my-initiated':
        return this.getMyInitiatedTrackings(page, size);
      
      case 'my-assigned':
        return this.getMyAssignedTrackings(page, size);
      
      case 'by-school':
        if (!identifier) throw new Error('School ID required for by-school view');
        return this.getTrackingBySchool(identifier, page, size);
      
      case 'by-department':
        if (!identifier) throw new Error('Department ID required for by-department view');
        return this.getTrackingsByDepartment(identifier, page, size);
      
      case 'by-assignee':
        if (!identifier) throw new Error('Assignee ID required for by-assignee view');
        return this.getTrackingsByAssignee(identifier, page, size);
      
      case 'by-initiator':
        if (!identifier) throw new Error('Initiator ID required for by-initiator view');
        return this.getTrackingsByInitiator(identifier, page, size);
      
      case 'by-stage':
        if (!identifier) throw new Error('Stage required for by-stage view');
        return this.getTrackingsByStage(identifier, page, size);
      
      case 'all':
      default:
        return this.getAllCurricula(page, size);
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
        data: { trackings: [], pagination: { currentPage: page, totalPages: 0, totalElements: 0, pageSize: size } }
      };
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

    throw new Error(`Cannot extract numeric ID from curriculum object`);
  }

  async performStageAction(curriculumIdentifier, stage, action, data = {}) {
    try {
      console.log('🔄 [Tracking Service] Performing stage action:', { curriculumIdentifier, stage, action, data });
      
      const backendAction = this.mapFrontendActionToBackend(action);
      const notes = data.feedback || data.notes || '';
      const documents = data.documents || [];
      
      return await this.performTrackingAction(curriculumIdentifier, backendAction, notes, documents);
    } catch (error) {
      console.error('❌ [Tracking Service] Failed to perform stage action:', error);
      throw error;
    }
  }

  mapFrontendActionToBackend(frontendAction) {
    const actionMappings = {
      'approve': 'APPROVE',
      'reject': 'REJECT', 
      'hold': 'HOLD',
      'resume': 'RESUME',
      'request_changes': 'REQUEST_CHANGES'
    };
    return actionMappings[frontendAction] || frontendAction.toUpperCase();
  }

  async performTrackingAction(trackingIdentifier, action, notes = '', documents = []) {
    try {
      console.log('🔄 [Tracking Service] Performing tracking action:', { trackingIdentifier, action, notes });

      let numericId;
      if (typeof trackingIdentifier === 'object') {
        numericId = this.extractNumericId(trackingIdentifier);
      } else if (typeof trackingIdentifier === 'string' && /^\d+$/.test(trackingIdentifier)) {
        numericId = parseInt(trackingIdentifier);
      } else if (typeof trackingIdentifier === 'number') {
        numericId = trackingIdentifier;
      } else {
        throw new Error(`Invalid tracking identifier: ${trackingIdentifier}`);
      }

      const formData = new FormData();
      formData.append('trackingId', String(numericId));
      formData.append('action', action.toUpperCase());
      
      if (notes) formData.append('notes', notes);

      documents.forEach((file, index) => {
        formData.append('documents', file);
        console.log(`📎 [Tracking Service] Added action document ${index + 1}: ${file.name}`);
      });

      return this.makeRequest('PERFORM_ACTION', {
        body: formData,
        useCache: false
      });

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to perform tracking action:', error);
      throw new Error(`Failed to perform tracking action: ${error.message}`);
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

      documents.forEach((file, index) => {
        formData.append('documents', file);
        console.log(`📎 [Tracking Service] Added document ${index + 1}: ${file.name}`);
      });

      return this.makeRequest('INITIATE', {
        body: formData,
        useCache: false
      });

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to initiate tracking:', error);
      throw new Error(`Failed to initiate curriculum tracking: ${error.message}`);
    }
  }


  async getTrackingStatistics() {
    try {
      console.log('🔄 [Tracking Service] Getting tracking statistics...');

      const cacheKey = 'tracking_statistics';
      const cached = this.cacheManager.get(cacheKey);
      if (cached) return cached;

      const [myInitiated, myAssigned, allTrackings] = await Promise.allSettled([
        this.getMyInitiatedTrackings(0, 1000),
        this.getMyAssignedTrackings(0, 1000),
        this.getAllCurricula(0, 1000)
      ]);

      const stats = {
        myInitiated: myInitiated.status === 'fulfilled' ? myInitiated.value.data.trackings?.length || 0 : 0,
        myAssigned: myAssigned.status === 'fulfilled' ? myAssigned.value.data.trackings?.length || 0 : 0,
        total: allTrackings.status === 'fulfilled' ? allTrackings.value.data.trackings?.length || 0 : 0,
        byStatus: {},
        byStage: {},
        byPriority: {}
      };

      if (allTrackings.status === 'fulfilled' && allTrackings.value.data.trackings) {
        const trackings = allTrackings.value.data.trackings;
        
        stats.byStatus = trackings.reduce((acc, tracking) => {
          acc[tracking.status] = (acc[tracking.status] || 0) + 1;
          return acc;
        }, {});

        stats.byStage = trackings.reduce((acc, tracking) => {
          acc[tracking.currentStage] = (acc[tracking.currentStage] || 0) + 1;
          return acc;
        }, {});

        stats.byPriority = trackings.reduce((acc, tracking) => {
          acc[tracking.priority] = (acc[tracking.priority] || 0) + 1;
          return acc;
        }, {});

        stats.completed = stats.byStatus.completed || 0;
        stats.inProgress = (stats.byStatus.under_review || 0) + (stats.byStatus.pending_approval || 0);
        stats.onHold = stats.byStatus.on_hold || 0;
        stats.overdue = trackings.filter(t => this.dataTransformer.isOverdue(t._rawApiData)).length;
      }

      const result = {
        success: true,
        message: 'Tracking statistics retrieved successfully',
        data: stats
      };

      this.cacheManager.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to get tracking statistics:', error);
      throw new Error(`Failed to get tracking statistics: ${error.message}`);
    }
  }

  async searchTrackings(searchParams = {}, page = 0, size = 20) {
    try {
      console.log('🔄 [Tracking Service] Searching trackings:', { searchParams, page, size });

      let allTrackings = [];
      
      if (searchParams.schoolId) {
        const schoolResult = await this.getTrackingBySchool(searchParams.schoolId, 0, 1000);
        allTrackings = schoolResult.data.trackings || schoolResult.data || [];
      } else if (searchParams.stage) {
        const stageResult = await this.getTrackingsByStage(searchParams.stage, 0, 1000);
        allTrackings = stageResult.data.trackings || stageResult.data || [];
      } else {
        const allResult = await this.getAllCurricula(0, 1000);
        allTrackings = allResult.data.trackings || allResult.data || [];
      }

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

      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedTrackings = filteredTrackings.slice(startIndex, endIndex);

      return {
        success: true,
        message: `Found ${filteredTrackings.length} matching trackings`,
        data: {
          trackings: paginatedTrackings,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredTrackings.length / size),
            totalElements: filteredTrackings.length,
            pageSize: size,
            hasNext: endIndex < filteredTrackings.length,
            hasPrevious: page > 0,
            first: page === 0,
            last: endIndex >= filteredTrackings.length
          }
        },
        searchParams
      };

    } catch (error) {
      console.error('❌ [Tracking Service] Failed to search trackings:', error);
      throw new Error(`Failed to search trackings: ${error.message}`);
    }
  }

  async downloadTrackingDocument(documentId, filename = null) {
    try {
      console.log('🔄 [Tracking Service] Downloading document:', documentId);

      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const response = await fetch(this.endpointsRegistry.buildUrl(this.baseURL, 'DOWNLOAD_DOCUMENT', { documentId }), {
        method: 'GET',
        headers: await this.getHeaders(),
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

  async exportTrackings(format = 'json', filters = {}) {
    try {
      console.log('🔄 [Tracking Service] Exporting trackings:', { format, filters });

      const searchResult = await this.searchTrackings(filters, 0, 10000);
      const trackings = searchResult.data.trackings || [];

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

  convertToCsv(trackings) {
    if (trackings.length === 0) return '';

    const headers = [
      'Tracking ID', 'Title', 'Display Title', 'Display Code', 'School', 'Department', 
      'Academic Level', 'Current Stage', 'Status', 'Priority', 'Initiated By', 
      'Initiated By Email', 'Current Assignee', 'Current Assignee Email',
      'Created Date', 'Expected Completion', 'Days in Stage', 'Total Days',
      'Is Active', 'Is Completed', 'Is Ideation Stage', 'Proposed Duration',
      'Proposed Effective Date', 'Proposed Expiry Date'
    ];

    const rows = trackings.map(tracking => [
      tracking.trackingId || '',
      tracking.title || '',
      tracking.displayTitle || '',
      tracking.displayCode || '',
      tracking.school || '',
      tracking.department || '',
      tracking.academicLevel || '',
      tracking.currentStage || '',
      tracking.status || '',
      tracking.priority || '',
      tracking.initiatedByName || '',
      tracking.initiatedByEmail || '',
      tracking.currentAssigneeName || '',
      tracking.currentAssigneeEmail || '',
      tracking.submittedDate || '',
      tracking.expectedCompletionDate || '',
      tracking.daysInCurrentStage || 0,
      tracking.totalDays || 0,
      tracking.isActive || false,
      tracking.isCompleted || false,
      tracking.isIdeationStage || false,
      tracking.proposedDurationSemesters || '',
      tracking.proposedEffectiveDate || '',
      tracking.proposedExpiryDate || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }

  
  async testAllNewEndpoints() {
    console.log('🔄 Testing all new endpoints...');
    
    try {
      console.log('1. Testing getTrackingsByAssignee...');
      const byAssignee = await this.getTrackingsByAssignee(15, 0, 5);
      console.log('✅ getTrackingsByAssignee result:', byAssignee);
      
      console.log('2. Testing getTrackingsByInitiator...');
      const byInitiator = await this.getTrackingsByInitiator(15, 0, 5);
      console.log('✅ getTrackingsByInitiator result:', byInitiator);
      
      console.log('3. Testing getTrackingsByDepartment...');
      const byDepartment = await this.getTrackingsByDepartment(1, 0, 5);
      console.log('✅ getTrackingsByDepartment result:', byDepartment);
      
      console.log('4. Testing enhanced view mode handler...');
      const viewModeTest = await this.getTrackingsForViewMode('by-assignee', 15, 0, 5);
      console.log('✅ getTrackingsForViewMode result:', viewModeTest);
      
      console.log('🎉 All new endpoints tested successfully!');
      return {
        byAssignee, byInitiator, byDepartment, viewModeTest
      };
      
    } catch (error) {
      console.error('❌ Error testing new endpoints:', error);
      return { error: error.message };
    }
  }

  getServiceInfo() {
    return {
      baseURL: this.baseURL,
      availableEndpoints: Object.keys(this.endpointsRegistry.endpoints),
      cacheStats: {
        size: this.cacheManager.cache.size,
        keys: Array.from(this.cacheManager.cache.keys())
      },
      transformationInfo: {
        stageOrder: this.dataTransformer.STAGE_ORDER,
        stageMappings: Object.keys(this.dataTransformer.STAGE_MAPPINGS.API_TO_FRONTEND).length,
        statusMappings: Object.keys(this.dataTransformer.STAGE_MAPPINGS.STATUS_TO_FRONTEND).length
      }
    };
  }

  
  clearAllCaches() {
    this.cacheManager.clear();
    console.log('🧹 [Tracking Service] All caches cleared');
  }
}


const curriculumTrackingService = new CurriculumTrackingService();

// Debugging tools for development
if (typeof window !== 'undefined') {
  window.curriculumTrackingService = curriculumTrackingService;
  
  //  testing functions
  window.testTrackingsByAssignee = (assigneeId, page, size) => 
    curriculumTrackingService.getTrackingsByAssignee(assigneeId, page, size);
  window.testTrackingsByInitiator = (initiatorId, page, size) => 
    curriculumTrackingService.getTrackingsByInitiator(initiatorId, page, size);
  window.testTrackingsByDepartment = (departmentId, page, size) => 
    curriculumTrackingService.getTrackingsByDepartment(departmentId, page, size);
  window.testTrackingsForViewMode = (viewMode, identifier, page, size) => 
    curriculumTrackingService.getTrackingsForViewMode(viewMode, identifier, page, size);
  
  
  window.testAllNewTrackingEndpoints = () => curriculumTrackingService.testAllNewEndpoints();
  window.getTrackingServiceInfo = () => curriculumTrackingService.getServiceInfo();
  window.clearTrackingCache = () => curriculumTrackingService.clearAllCaches();
  
  // Registry inspection tools
  window.inspectTrackingEndpoints = () => curriculumTrackingService.endpointsRegistry.endpoints;
  window.testEndpointUrl = (endpointName, pathParams, queryParams) => 
    curriculumTrackingService.endpointsRegistry.buildUrl(
      curriculumTrackingService.baseURL, 
      endpointName, 
      pathParams, 
      queryParams
    );
}

export default curriculumTrackingService;