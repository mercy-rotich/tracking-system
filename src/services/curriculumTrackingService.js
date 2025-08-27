import apiClient from "./apiClient";

const ENDPOINTS = {
  BASE: '/tracking',
  CREATE: '/tracking/create',
  DOCUMENTS: '/tracking/documents/download'
};

const STAGE_MAPPING = {
  'IDEATION': 'initiation',
  'SCHOOL_BOARD_REVIEW': 'school_board', 
  'DEAN_COMMITTEE_REVIEW': 'dean_committee',
  'SENATE_REVIEW': 'senate',
  'QA_REVIEW': 'qa_review',
  'VICE_CHANCELLOR_APPROVAL': 'vice_chancellor',
  'CUE_REVIEW': 'cue_review',
  'SITE_INSPECTION': 'site_inspection',
  'ACCREDITED': 'site_inspection' 
};

const STATUS_MAPPING = {
  'INITIATED': 'under_review',
  'IN_PROGRESS': 'under_review', 
  'PENDING_APPROVAL': 'pending_approval',
  'ON_HOLD': 'on_hold',
  'COMPLETED': 'completed',
  'REJECTED': 'rejected'
};

const PRIORITY_THRESHOLDS = {
  IDEATION_HIGH: 14,
  GENERAL_HIGH: 30,
  MEDIUM: 14
};

class FormDataBuilder {
  constructor() {
    this.formData = new FormData();
  }

  static create() {
    return new FormDataBuilder();
  }

  addField(key, value) {
    if (value !== null && value !== undefined) {
      this.formData.append(key, value.toString());
    }
    return this;
  }

  addOptionalField(key, value) {
    if (value) {
      this.formData.append(key, value);
    }
    return this;
  }

  addDocuments(documents) {
    if (documents?.length > 0) {
      documents.forEach(doc => this.formData.append('documents', doc));
    }
    return this;
  }

  build() {
    return this.formData;
  }
}

class ResponseFormatter {
  static success(data, message = '') {
    return {
      success: true,
      data,
      message
    }
  }

  static error(error, defaultMessage) {
    return {
      success: false,
      error: error.message || defaultMessage,
      details: error.data || error
    }
  }
}

class DataTransformer {
  static transform(apiData) {
    if (!apiData) {
      console.warn('⚠️ [DataTransformer] Null or undefined data provided');
      return null;
    }

    console.log('🔄 [DataTransformer] Transforming data:', JSON.stringify(apiData, null, 2));

    try {
      const daysInCurrentStage = this.calculateDaysInStage(apiData.updatedAt);
      const totalDays = this.calculateTotalDays(apiData.createdAt);

      const transformed = {
        id: apiData.id || apiData.trackingId,
        trackingId: apiData.trackingId || `TRACK-${apiData.id}`,
        title: apiData.name || apiData.displayCurriculumName || apiData.proposedCurriculumName || apiData.curriculumName ||
        
        'Untitled Curriculum',
        school:apiData.schoolName || 
        apiData.school_name || 
        apiData.school || 
        'Unknown School',
        department: apiData.departmentName || 
        apiData.department_name || 
        apiData.department || 
        'Unknown Department',
        currentStage: STAGE_MAPPING[apiData.currentStage] || 'initiation',
        status: STATUS_MAPPING[apiData.status] || 'under_review',
        priority: this.calculatePriority(apiData.currentStage, daysInCurrentStage, apiData.isIdeationStage),
        submittedDate: apiData.createdAt ? apiData.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        lastUpdated: apiData.updatedAt ? apiData.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
        daysInCurrentStage,
        totalDays,
        estimatedCompletion: apiData.expectedCompletionDate || null,
        stages: this.buildStagesObject(apiData),
        
        
        code: apiData.proposedCurriculumCode || apiData.curriculumCode || 'N/A',
        description: apiData.curriculumDescription || '',
        schoolId: apiData.schoolId,
        departmentId: apiData.departmentId,
        initiatedBy: apiData.initiatedByName || apiData.initiatorName || 'System',
        assignedTo: apiData.currentAssigneeName || apiData.assigneeName || null,
        isActive: apiData.isActive !== false, 
        
        // Raw data for debugging
        _raw: apiData
      };

      console.log('✅ [DataTransformer] Transformation successful:', transformed);
      return transformed;

    } catch (error) {
      console.error('❌ [DataTransformer] Transformation failed:', error);
      console.error('📋 [DataTransformer] Failed data:', apiData);
      
     
      return {
        id: apiData.id || Math.random().toString(),
        trackingId: apiData.trackingId || `ERROR-${Date.now()}`,
        title: apiData.name || apiData.proposedCurriculumName || 'Error Loading Curriculum',
        school: apiData.schoolName || 'Unknown',
        department: apiData.departmentName || 'Unknown',
        currentStage: 'initiation',
        status: 'under_review',
        priority: 'low',
        submittedDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        daysInCurrentStage: 0,
        totalDays: 0,
        estimatedCompletion: null,
        stages: {},
        _error: error.message,
        _raw: apiData
      };
    }
  }

  static transformArray(apiDataArray) {
    if (!Array.isArray(apiDataArray)) {
      console.warn('⚠️ [DataTransformer] Expected array, got:', typeof apiDataArray);
      if (apiDataArray && typeof apiDataArray === 'object') {
        // Try to transform single object
        const singleTransform = this.transform(apiDataArray);
        return singleTransform ? [singleTransform] : [];
      }
      return [];
    }

    console.log(`🔄 [DataTransformer] Transforming array of ${apiDataArray.length} items`);
    
    const transformed = apiDataArray
      .map((item, index) => {
        try {
          return this.transform(item);
        } catch (error) {
          console.error(`❌ [DataTransformer] Failed to transform item at index ${index}:`, error);
          return null;
        }
      })
      .filter(Boolean); 

    console.log(`✅ [DataTransformer] Successfully transformed ${transformed.length}/${apiDataArray.length} items`);
    return transformed;
  }

  static calculatePriority(stage, daysInStage, isIdeationStage) {
    if (isIdeationStage && daysInStage > PRIORITY_THRESHOLDS.IDEATION_HIGH) return 'high';
    if (daysInStage > PRIORITY_THRESHOLDS.GENERAL_HIGH) return 'high';
    if (daysInStage > PRIORITY_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
  }

  static calculateDaysInStage(lastUpdated) {
    if (!lastUpdated) return 0;
    const diffTime = Math.abs(new Date() - new Date(lastUpdated));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  static calculateTotalDays(createdAt) {
    if (!createdAt) return 0;
    const diffTime = Math.abs(new Date() - new Date(createdAt));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static buildStagesObject(apiData) {
    const currentStage = STAGE_MAPPING[apiData.currentStage] || 'initiation';
    const stageOrder = this.getStageOrder(currentStage);

    const stages = {};

    Object.values(STAGE_MAPPING).forEach(stage => {
      const order = this.getStageOrder(stage);
      stages[stage] = {
        status: order < stageOrder ? 'completed' :
               order === stageOrder ? 'under_review' : 'pending',
        assignedTo: stage === 'initiation' ? apiData.initiatedByName || 'System' : apiData.currentAssigneeName || '',
        documents: [],
        notes: stage === 'initiation' ? apiData.initialNotes || '' : '',
        startedDate: stage === 'initiation' ? apiData.createdAt : null,
        dueDate: null,
        completedDate: order < stageOrder ? apiData.updatedAt : null       
      }
    });
    
    return stages;
  }

  static getStageOrder(stage) {
    const stageOrder = {
      'initiation': 1,
      'school_board': 2,
      'dean_committee': 3,
      'senate': 4,
      'qa_review': 5,
      'vice_chancellor': 6,
      'cue_review': 7,
      'site_inspection': 8
    };
    return stageOrder[stage] || 0;
  }
}

class QueryBuilder {
  static buildUrl(baseUrl, params = {}) {
    const validParams = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const queryString = new URLSearchParams(validParams).toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }
}

class CurriculumTrackingService {
  // Initiate curriculum method
  async initiateCurriculum(curriculumData) {
    try {
      console.log('🔄 [TrackingService] Initiating curriculum:', curriculumData);
      
      const formData = FormDataBuilder
        .create()
        .addField('schoolId', curriculumData.schoolId)
        .addField('departmentId', curriculumData.departmentId)
        .addField('academicLevelId', curriculumData.academicLevelId)
        .addField('proposedCurriculumName', curriculumData.proposedCurriculumName)
        .addField('proposedCurriculumCode', curriculumData.proposedCurriculumCode)
        .addField('proposedDurationSemesters', curriculumData.proposedDurationSemesters)
        .addField('curriculumDescription', curriculumData.curriculumDescription)
        .addOptionalField('initialNotes', curriculumData.initialNotes)
        .addDocuments(curriculumData.documents)
        .build();

      const response = await apiClient.post(ENDPOINTS.CREATE, formData);
      
      return ResponseFormatter.success(
        DataTransformer.transform(response.data.data),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] Initiation failed:', error);
      return ResponseFormatter.error(error, 'Failed to initiate curriculum');
    }
  }

  // Get all curricula method
  async getAllCurricula(filters = {}) {
    try {
      console.log('🔄 [TrackingService] Getting all curricula with filters:', filters);
      
      const url = QueryBuilder.buildUrl(ENDPOINTS.BASE, filters);
      console.log('📞 [TrackingService] API URL:', url);
      
      const response = await apiClient.get(url);
      console.log('📋 [TrackingService] Raw API response:', response.data);
      
      // Handle different response structures
      let rawData = [];
      
      if (response.data && response.data.data) {
        if (Array.isArray(response.data.data)) {
          rawData = response.data.data;
        } else if (response.data.data.trackings && Array.isArray(response.data.data.trackings)) {
          rawData = response.data.data.trackings;
        } else if (response.data.data.curricula && Array.isArray(response.data.data.curricula)) {
          rawData = response.data.data.curricula;
        } else {
          console.warn('⚠️ [TrackingService] Unexpected data structure, using data object as single item');
          rawData = [response.data.data];
        }
      } else if (Array.isArray(response.data)) {
        rawData = response.data;
      } else {
        console.warn('⚠️ [TrackingService] No recognizable data structure found');
        rawData = [];
      }
      
      console.log(`📋 [TrackingService] Extracted ${rawData.length} raw items for transformation`);
      
      const transformedData = DataTransformer.transformArray(rawData);
      
      return ResponseFormatter.success(
        transformedData,
        response.data.message || `${transformedData.length} curricula retrieved successfully`
      );
      
    } catch (error) {
      console.error('❌ [TrackingService] GetAllCurricula failed:', error);
      return ResponseFormatter.error(error, 'Failed to fetch curriculum tracking data');
    }
  }

  async getCurriculumById(trackingId) {
    try {
      console.log('🔄 [TrackingService] Getting curriculum by ID:', trackingId);
      
      const response = await apiClient.get(`${ENDPOINTS.BASE}/${trackingId}`);
      console.log('📋 [TrackingService] GetById response:', response.data);
      
      return ResponseFormatter.success(
        DataTransformer.transform(response.data.data),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] GetById failed:', error);
      return ResponseFormatter.error(error, 'Failed to fetch curriculum details');
    }
  }

  async updateTracking(trackingId, trackingData) {
    try {
      console.log('🔄 [TrackingService] Updating tracking:', trackingId, trackingData);
      
      if (!trackingId) {
        throw new Error('Tracking ID is required');
      }

      const formData = FormDataBuilder
        .create()
        .addOptionalField('proposedCurriculumName', trackingData.proposedCurriculumName)
        .addOptionalField('proposedCurriculumCode', trackingData.proposedCurriculumCode)
        .addOptionalField('proposedDurationSemesters', trackingData.proposedDurationSemesters)
        .addOptionalField('curriculumDescription', trackingData.curriculumDescription)
        .addOptionalField('schoolId', trackingData.schoolId)
        .addOptionalField('departmentId', trackingData.departmentId)
        .addOptionalField('academicLevelId', trackingData.academicLevelId)
        .addOptionalField('proposedEffectiveDate', trackingData.proposedEffectiveDate)
        .addOptionalField('proposedExpiryDate', trackingData.proposedExpiryDate)
        .addOptionalField('initialNotes', trackingData.initialNotes)
        .addDocuments(trackingData.documents)
        .build();

      const response = await apiClient.put(`${ENDPOINTS.BASE}/${trackingId}`, formData);
      
      return ResponseFormatter.success(
        DataTransformer.transform(response.data.data),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] Update failed:', error);
      return ResponseFormatter.error(error, 'Failed to update tracking');
    }
  }

  async assignTracking(trackingId, userId) {
    try {
      console.log('🔄 [TrackingService] Assigning tracking:', trackingId, 'to user:', userId);
      
      if (!trackingId || !userId) {
        throw new Error('Both tracking ID and user ID are required');
      }

      const response = await apiClient.post(`${ENDPOINTS.BASE}/${trackingId}/assign/${userId}`);
      
      return ResponseFormatter.success(
        DataTransformer.transform(response.data.data),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] Assignment failed:', error);
      return ResponseFormatter.error(error, 'Failed to assign tracking');
    }
  }

  async reactivateTracking(trackingId) {
    try {
      console.log('🔄 [TrackingService] Reactivating tracking:', trackingId);
      
      if (!trackingId) {
        throw new Error('Tracking ID is required');
      }

      const response = await apiClient.post(`${ENDPOINTS.BASE}/${trackingId}/reactivate`);
      
      return ResponseFormatter.success(
        DataTransformer.transform(response.data.data),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] Reactivation failed:', error);
      return ResponseFormatter.error(error, 'Failed to reactivate tracking');
    }
  }

  async deactivateTracking(trackingId) {
    try {
      console.log('🔄 [TrackingService] Deactivating tracking:', trackingId);
      
      if (!trackingId) {
        throw new Error('Tracking ID is required');
      }

      const response = await apiClient.post(`${ENDPOINTS.BASE}/${trackingId}/deactivate`);
      
      return ResponseFormatter.success(
        response.data.data,
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] Deactivation failed:', error);
      return ResponseFormatter.error(error, 'Failed to deactivate tracking');
    }
  }

  // Query methods
  async getTrackingByDepartment(departmentId, params = {}) {
    try {
      console.log('🔄 [TrackingService] Getting tracking by department:', departmentId);
      
      if (!departmentId) {
        throw new Error('Department ID is required');
      }

      const url = QueryBuilder.buildUrl(`${ENDPOINTS.BASE}/department/${departmentId}`, params);
      const response = await apiClient.get(url);
      console.log('📋 [TrackingService] Department response:', response.data);
      
      let rawData = [];
      if (response.data && response.data.data) {
        rawData = response.data.data.trackings || response.data.data || [];
      }
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(rawData),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] GetByDepartment failed:', error);
      return ResponseFormatter.error(error, 'Failed to fetch department tracking data');
    }
  }

  async getTrackingBySchool(schoolId) {
    try {
      console.log('🔄 [TrackingService] Getting tracking by school:', schoolId);
      
      const response = await apiClient.get(`${ENDPOINTS.BASE}/school/${schoolId}`);
      console.log('📋 [TrackingService] School response:', response.data);
      
      let rawData = [];
      if (response.data && response.data.data) {
        rawData = response.data.data.trackings || response.data.data || [];
      }
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(rawData),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] GetBySchool failed:', error);
      return ResponseFormatter.error(error, 'Failed to fetch school tracking data');
    }
  }

  async getTrackingByInitiator(initiatorId) {
    try {
      console.log('🔄 [TrackingService] Getting tracking by initiator:', initiatorId);
      
      const response = await apiClient.get(`${ENDPOINTS.BASE}/initiator/${initiatorId}`);
      console.log('📋 [TrackingService] Initiator response:', response.data);
      
      let rawData = [];
      if (response.data && response.data.data) {
        rawData = response.data.data.trackings || response.data.data || [];
      }
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(rawData),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] GetByInitiator failed:', error);
      return ResponseFormatter.error(error, 'Failed to fetch initiator tracking data');
    }
  }

  async getTrackingByAssignee(assigneeId) {
    try {
      console.log('🔄 [TrackingService] Getting tracking by assignee:', assigneeId);
      
      const response = await apiClient.get(`${ENDPOINTS.BASE}/assignee/${assigneeId}`);
      console.log('📋 [TrackingService] Assignee response:', response.data);
      
      let rawData = [];
      if (response.data && response.data.data) {
        rawData = response.data.data.trackings || response.data.data || [];
      }
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(rawData),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] GetByAssignee failed:', error);
      return ResponseFormatter.error(error, 'Failed to fetch assignee tracking data');
    }
  }

  async getMyInitiatedTrackings() {
    try {
      console.log('🔄 [TrackingService] Getting my initiated trackings');
      
      const response = await apiClient.get(`${ENDPOINTS.BASE}/my-trackings`);
      console.log('📋 [TrackingService] My trackings response:', response.data);
      
      let rawData = [];
      if (response.data && response.data.data) {
        rawData = response.data.data.trackings || response.data.data || [];
      }
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(rawData),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] GetMyInitiated failed:', error);
      return ResponseFormatter.error(error, 'Failed to fetch my tracking data');
    }
  }

  async getMyAssignedTrackings() {
    try {
      console.log('🔄 [TrackingService] Getting my assigned trackings');
      
      const response = await apiClient.get(`${ENDPOINTS.BASE}/my-assignments`);
      console.log('📋 [TrackingService] My assignments response:', response.data);
      
      let rawData = [];
      if (response.data && response.data.data) {
        rawData = response.data.data.trackings || response.data.data || [];
      }
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(rawData),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] GetMyAssigned failed:', error);
      return ResponseFormatter.error(error, 'Failed to fetch my assignment data');
    }
  }

  async getTrackingByStage(stage) {
    try {
      console.log('🔄 [TrackingService] Getting tracking by stage:', stage);
      
      const response = await apiClient.get(`${ENDPOINTS.BASE}/stage/${stage}`);
      console.log('📋 [TrackingService] Stage response:', response.data);
      
      let rawData = [];
      if (response.data && response.data.data) {
        rawData = response.data.data.trackings || response.data.data || [];
      }
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(rawData),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] GetByStage failed:', error);
      return ResponseFormatter.error(error, 'Failed to fetch stage tracking data');
    }
  }

  // Action and document methods
  async performTrackingAction(actionData) {
    try {
      console.log('🔄 [TrackingService] Performing tracking action:', actionData);
      
      const formData = FormDataBuilder
        .create()
        .addField('trackingId', actionData.trackingId)
        .addField('action', actionData.action)
        .addOptionalField('notes', actionData.notes)
        .addDocuments(actionData.documents)
        .build();

      const response = await apiClient.post(`${ENDPOINTS.BASE}/action`, formData);
      
      return ResponseFormatter.success(
        DataTransformer.transform(response.data.data),
        response.data.message
      );
    } catch (error) {
      console.error('❌ [TrackingService] Action failed:', error);
      return ResponseFormatter.error(error, 'Failed to perform tracking action');
    }
  }

  async downloadTrackingDocument(documentId) {
    try {
      console.log('🔄 [TrackingService] Downloading document:', documentId);
      
      const response = await apiClient.get(`${ENDPOINTS.DOCUMENTS}/${documentId}`, {
        responseType: 'blob'
      });
      
      return ResponseFormatter.success(response.data, 'Document downloaded successfully');
    } catch (error) {
      console.error('❌ [TrackingService] Download failed:', error);
      return ResponseFormatter.error(error, 'Failed to download document');
    }
  }

  // Helper methods for external use
  transformApiData(apiData) {
    return DataTransformer.transform(apiData);
  }

  transformApiDataArray(apiDataArray) {
    return DataTransformer.transformArray(apiDataArray);
  }

  // Diagnostic methods
  async diagnoseService() {
    console.log('🔍 CURRICULUM TRACKING SERVICE DIAGNOSIS');
    console.log('=========================================');
    
    const results = {};
    
    // Test getAllCurricula
    try {
      console.log('1. Testing getAllCurricula...');
      const allResult = await this.getAllCurricula();
      results.getAllCurricula = {
        success: allResult.success,
        dataCount: allResult.data?.length || 0,
        message: allResult.message
      };
      console.log('   ✅ getAllCurricula:', results.getAllCurricula);
    } catch (error) {
      results.getAllCurricula = { success: false, error: error.message };
      console.log('   ❌ getAllCurricula failed:', error.message);
    }

    // Test getTrackingBySchool
    try {
      console.log('2. Testing getTrackingBySchool(1)...');
      const schoolResult = await this.getTrackingBySchool(1);
      results.getTrackingBySchool = {
        success: schoolResult.success,
        dataCount: schoolResult.data?.length || 0,
        message: schoolResult.message
      };
      console.log('   ✅ getTrackingBySchool:', results.getTrackingBySchool);
    } catch (error) {
      results.getTrackingBySchool = { success: false, error: error.message };
      console.log('   ❌ getTrackingBySchool failed:', error.message);
    }

    // Test getTrackingByInitiator
    try {
      console.log('3. Testing getTrackingByInitiator(15)...');
      const initiatorResult = await this.getTrackingByInitiator(15);
      results.getTrackingByInitiator = {
        success: initiatorResult.success,
        dataCount: initiatorResult.data?.length || 0,
        message: initiatorResult.message
      };
      console.log('   ✅ getTrackingByInitiator:', results.getTrackingByInitiator);
    } catch (error) {
      results.getTrackingByInitiator = { success: false, error: error.message };
      console.log('   ❌ getTrackingByInitiator failed:', error.message);
    }

    // Test data transformation
    try {
      console.log('4. Testing data transformation...');
      const sampleData = {
        id: 1,
        trackingId: 'TEST-123',
        displayCurriculumName: 'Test Curriculum',
        schoolName: 'Test School',
        departmentName: 'Test Department',
        currentStage: 'IDEATION',
        status: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const transformed = this.transformApiData(sampleData);
      results.dataTransformation = {
        success: !!transformed,
        hasRequiredFields: !!(transformed?.id && transformed?.title && transformed?.currentStage)
      };
      console.log('   ✅ Data transformation:', results.dataTransformation);
    } catch (error) {
      results.dataTransformation = { success: false, error: error.message };
      console.log('   ❌ Data transformation failed:', error.message);
    }

    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('====================');
    Object.entries(results).forEach(([test, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${test}: ${result.success ? 'PASSED' : 'FAILED'}`);
      if (result.dataCount !== undefined) {
        console.log(`   Data count: ${result.dataCount}`);
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    return results;
  }

  async getWorkingEndpoints() {
    const endpoints = [
      { name: 'getAllCurricula', method: () => this.getAllCurricula() },
      { name: 'getTrackingBySchool(1)', method: () => this.getTrackingBySchool(1) },
      { name: 'getTrackingByInitiator(15)', method: () => this.getTrackingByInitiator(15) },
      { name: 'getTrackingByAssignee(15)', method: () => this.getTrackingByAssignee(15) },
      { name: 'getMyInitiatedTrackings', method: () => this.getMyInitiatedTrackings() },
      { name: 'getMyAssignedTrackings', method: () => this.getMyAssignedTrackings() }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Testing ${endpoint.name}...`);
        const result = await endpoint.method();
        
        results.push({
          name: endpoint.name,
          success: result.success,
          dataCount: result.data?.length || 0,
          message: result.message,
          hasData: result.success && result.data?.length > 0
        });
        
        console.log(`   ${result.success && result.data?.length > 0 ? '✅' : '⚠️'} ${endpoint.name}: ${result.data?.length || 0} items`);
      } catch (error) {
        results.push({
          name: endpoint.name,
          success: false,
          error: error.message,
          hasData: false
        });
        console.log(`   ❌ ${endpoint.name}: ${error.message}`);
      }
    }

    const workingEndpoints = results.filter(r => r.hasData);
    console.log(`\n🎯 Working endpoints with data: ${workingEndpoints.length}/${results.length}`);
    
    return {
      all: results,
      working: workingEndpoints,
      recommended: workingEndpoints.length > 0 ? workingEndpoints[0].name : null
    };
  }
}

// Create and export singleton instance
const curriculumTrackingService = new CurriculumTrackingService();

if (typeof window !== 'undefined') {
  window.curriculumTrackingService = curriculumTrackingService;
  window.diagnoseTrackingService = () => curriculumTrackingService.diagnoseService();
  window.getWorkingEndpoints = () => curriculumTrackingService.getWorkingEndpoints();
  window.testTrackingTransform = (data) => curriculumTrackingService.transformApiData(data);
}

export default curriculumTrackingService;