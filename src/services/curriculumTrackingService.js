import apiClient from "./apiClient";

const ENDPOINTS = {
  BASE: '/tracking',
  CREATE: '/tracking/create',
  DOCUMENTS: '/tracking/documents'
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

// Document type mapping for better UI display
const DOCUMENT_TYPE_MAPPING = {
  'SUPPORTING_DOCUMENTS': 'Supporting Documents',
  'CURRICULUM_PROPOSAL': 'Curriculum Proposal',
  'APPROVAL_LETTER': 'Approval Letter',
  'REVIEW_FEEDBACK': 'Review Feedback',
  'FINAL_DOCUMENT': 'Final Document'
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

  addFiles(files) {
    if (files?.length > 0) {
      files.forEach(file => this.formData.append('files', file));
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

class DocumentTransformer {
  static transform(apiDocument) {
    if (!apiDocument) {
      console.warn('⚠️ [DocumentTransformer] Null or undefined document provided');
      return null;
    }

    try {
      return {
        id: apiDocument.id,
        name: apiDocument.documentName || apiDocument.originalFilename,
        originalFilename: apiDocument.originalFilename,
        documentType: apiDocument.documentType,
        documentTypeDisplayName: apiDocument.documentTypeDisplayName || 
                                 DOCUMENT_TYPE_MAPPING[apiDocument.documentType] || 
                                 'Document',
        filePath: apiDocument.filePath,
        fileSize: apiDocument.fileSize,
        formattedFileSize: apiDocument.formattedFileSize,
        contentType: apiDocument.contentType,
        fileExtension: apiDocument.fileExtension,
        description: apiDocument.description,
        uploadedBy: apiDocument.uploadedByName,
        versionNumber: apiDocument.versionNumber || 1,
        uploadedAt: apiDocument.uploadedAt,
        isActive: apiDocument.isActive !== false,
        // Helper properties for UI
        icon: this.getFileIcon(apiDocument.fileExtension || apiDocument.contentType),
        iconColor: this.getFileIconColor(apiDocument.fileExtension || apiDocument.contentType),
        downloadable: true,
        _raw: apiDocument
      };
    } catch (error) {
      console.error('❌ [DocumentTransformer] Transform failed:', error);
      return {
        id: apiDocument.id || Math.random().toString(),
        name: apiDocument.documentName || 'Unknown Document',
        error: error.message,
        _raw: apiDocument
      };
    }
  }

  static transformArray(apiDocuments) {
    if (!Array.isArray(apiDocuments)) {
      console.warn('⚠️ [DocumentTransformer] Expected array, got:', typeof apiDocuments);
      if (apiDocuments && typeof apiDocuments === 'object') {
        const singleTransform = this.transform(apiDocuments);
        return singleTransform ? [singleTransform] : [];
      }
      return [];
    }

    return apiDocuments
      .map((doc, index) => {
        try {
          return this.transform(doc);
        } catch (error) {
          console.error(`❌ [DocumentTransformer] Failed to transform document at index ${index}:`, error);
          return null;
        }
      })
      .filter(Boolean);
  }

  static getFileIcon(typeOrExtension) {
    if (!typeOrExtension) return 'fas fa-file';
    
    const type = typeOrExtension.toLowerCase();
    
    if (type.includes('pdf')) return 'fas fa-file-pdf';
    if (type.includes('word') || type.includes('doc')) return 'fas fa-file-word';
    if (type.includes('excel') || type.includes('sheet')) return 'fas fa-file-excel';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'fas fa-file-powerpoint';
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(type)) return 'fas fa-file-image';
    if (type.includes('video')) return 'fas fa-file-video';
    if (type.includes('audio')) return 'fas fa-file-audio';
    if (['txt', 'text'].includes(type)) return 'fas fa-file-alt';
    if (['zip', 'rar', '7z'].includes(type)) return 'fas fa-file-archive';
    
    return 'fas fa-file';
  }

  static getFileIconColor(typeOrExtension) {
    if (!typeOrExtension) return '#6b7280';
    
    const type = typeOrExtension.toLowerCase();
    
    if (type.includes('pdf')) return '#dc2626';
    if (type.includes('word') || type.includes('doc')) return '#2563eb';
    if (type.includes('excel') || type.includes('sheet')) return '#059669';
    if (type.includes('powerpoint') || type.includes('presentation')) return '#d97706';
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(type)) return '#7c3aed';
    if (type.includes('video')) return '#dc2626';
    if (type.includes('audio')) return '#059669';
    if (['zip', 'rar', '7z'].includes(type)) return '#6366f1';
    
    return '#6b7280';
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
        
        // Additional properties
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
      
      // Return basic fallback object
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
  // ==============================================
  // EXISTING TRACKING METHODS (unchanged)
  // ==============================================
  
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

  async getAllCurricula(filters = {}) {
    try {
      console.log('🔄 [TrackingService] Getting all curricula with filters:', filters);
      
      const url = QueryBuilder.buildUrl(ENDPOINTS.BASE, filters);
      console.log('📞 [TrackingService] API URL:', url);
      
      const response = await apiClient.get(url);
      console.log('📋 [TrackingService] Raw API response:', response.data);
      
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

  // Query methods (existing - keeping as is)
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

  // Action methods (existing - keeping as is)
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

  // ==============================================
  // NEW DOCUMENT METHODS
  // ==============================================

  /**
   * Get all documents for a specific tracking ID
   * @param {string|number} trackingId - The tracking ID
   * @returns {Promise<Object>} Response with documents array
   */
  async getDocumentsByTrackingId(trackingId) {
    try {
      console.log('🔄 [TrackingService] Getting documents for tracking ID:', trackingId);
      
      if (!trackingId) {
        throw new Error('Tracking ID is required');
      }

      const response = await apiClient.get(`${ENDPOINTS.DOCUMENTS}/tracking/${trackingId}`);
      console.log('📋 [TrackingService] Documents response:', response.data);
      
      const documents = DocumentTransformer.transformArray(response.data.data || []);
      
      return ResponseFormatter.success(
        documents,
        response.data.message || `${documents.length} documents retrieved successfully`
      );
    } catch (error) {
      console.error('❌ [TrackingService] GetDocumentsByTrackingId failed:', error);
      return ResponseFormatter.error(error, 'Failed to fetch tracking documents');
    }
  }

  /**
   * Get metadata for a specific document
   * @param {string|number} documentId - The document ID
   * @returns {Promise<Object>} Response with document metadata
   */
  async getDocumentMetadata(documentId) {
    try {
      console.log('🔄 [TrackingService] Getting document metadata:', documentId);
      
      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const response = await apiClient.get(`${ENDPOINTS.DOCUMENTS}/${documentId}`);
      console.log('📋 [TrackingService] Document metadata response:', response.data);
      
      const document = DocumentTransformer.transform(response.data.data);
      
      return ResponseFormatter.success(
        document,
        response.data.message || 'Document metadata retrieved successfully'
      );
    } catch (error) {
      console.error('❌ [TrackingService] GetDocumentMetadata failed:', error);
      return ResponseFormatter.error(error, 'Failed to fetch document metadata');
    }
  }

  /**
   * Get download URL for a specific document
   * @param {string|number} documentId - The document ID
   * @returns {Promise<Object>} Response with download URL and expiry info
   */
  async getDocumentDownloadUrl(documentId) {
    try {
      console.log('🔄 [TrackingService] Getting download URL for document:', documentId);
      
      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const response = await apiClient.get(`${ENDPOINTS.DOCUMENTS}/download-url/${documentId}`);
      console.log('📋 [TrackingService] Download URL response:', response.data);
      
      return ResponseFormatter.success(
        {
          downloadUrl: response.data.data.downloadUrl,
          expiresInMinutes: response.data.data.expiresInMinutes,
          expiresAt: new Date(Date.now() + (response.data.data.expiresInMinutes * 60 * 1000)).toISOString()
        },
        response.data.message || 'Download URL generated successfully'
      );
    } catch (error) {
      console.error('❌ [TrackingService] GetDocumentDownloadUrl failed:', error);
      return ResponseFormatter.error(error, 'Failed to generate download URL');
    }
  }

  /**
   * Download a document directly as blob
   * @param {string|number} documentId - The document ID
   * @returns {Promise<Object>} Response with blob data
   */
  async downloadDocument(documentId) {
    try {
      console.log('🔄 [TrackingService] Downloading document:', documentId);
      
      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const response = await apiClient.get(`${ENDPOINTS.DOCUMENTS}/download/${documentId}`, {
        responseType: 'blob'
      });
      
      return ResponseFormatter.success(
        response.data,
        'Document downloaded successfully'
      );
    } catch (error) {
      console.error('❌ [TrackingService] DownloadDocument failed:', error);
      return ResponseFormatter.error(error, 'Failed to download document');
    }
  }

  /**
   * Upload a single document
   * @param {Object} uploadData - Upload data
   * @param {File} uploadData.file - File to upload
   * @param {string|number} uploadData.trackingId - Tracking ID
   * @param {string|number} uploadData.stepId - Step ID
   * @param {string} uploadData.documentType - Document type
   * @param {string} uploadData.description - Document description
   * @returns {Promise<Object>} Response with uploaded document data
   */
  async uploadSingleDocument(uploadData) {
    try {
      console.log('🔄 [TrackingService] Uploading single document:', uploadData);
      
      const { file, trackingId, stepId, documentType = 'SUPPORTING_DOCUMENTS', description = '' } = uploadData;
      
      if (!file || !trackingId || !stepId) {
        throw new Error('File, tracking ID, and step ID are required');
      }

      const formData = FormDataBuilder
        .create()
        .addField('trackingId', trackingId)
        .addField('stepId', stepId)
        .addField('documentType', documentType)
        .addOptionalField('description', description)
        .build();
      
      formData.append('file', file);

      const response = await apiClient.post(`${ENDPOINTS.DOCUMENTS}/upload`, formData);
      console.log('📋 [TrackingService] Single upload response:', response.data);
      
      const document = DocumentTransformer.transform(response.data.data);
      
      return ResponseFormatter.success(
        document,
        response.data.message || 'Document uploaded successfully'
      );
    } catch (error) {
      console.error('❌ [TrackingService] UploadSingleDocument failed:', error);
      return ResponseFormatter.error(error, 'Failed to upload document');
    }
  }

  /**
   * Upload multiple documents in batch
   * @param {Object} uploadData - Upload data
   * @param {File[]} uploadData.files - Files to upload
   * @param {string|number} uploadData.trackingId - Tracking ID
   * @param {string|number} uploadData.stepId - Step ID
   * @param {string} uploadData.documentType - Document type
   * @param {string[]} uploadData.descriptions - Document descriptions (optional)
   * @returns {Promise<Object>} Response with uploaded documents data
   */
  async uploadBatchDocuments(uploadData) {
    try {
      console.log('🔄 [TrackingService] Uploading batch documents:', uploadData);
      
      const { files, trackingId, stepId, documentType = 'SUPPORTING_DOCUMENTS', descriptions = [] } = uploadData;
      
      if (!files || !Array.isArray(files) || files.length === 0) {
        throw new Error('Files array is required and must not be empty');
      }
      
      if (!trackingId || !stepId) {
        throw new Error('Tracking ID and step ID are required');
      }

      const formData = FormDataBuilder
        .create()
        .addField('trackingId', trackingId)
        .addField('stepId', stepId)
        .addField('documentType', documentType)
        .build();

      // Add files
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      // Add descriptions if provided
      if (descriptions.length > 0) {
        descriptions.forEach((description, index) => {
          if (description) {
            formData.append('descriptions', description);
          }
        });
      }

      const response = await apiClient.post(`${ENDPOINTS.DOCUMENTS}/upload/batch`, formData);
      console.log('📋 [TrackingService] Batch upload response:', response.data);
      
      const documents = DocumentTransformer.transformArray(response.data.data || []);
      
      return ResponseFormatter.success(
        documents,
        response.data.message || `${documents.length} documents uploaded successfully`
      );
    } catch (error) {
      console.error('❌ [TrackingService] UploadBatchDocuments failed:', error);
      return ResponseFormatter.error(error, 'Failed to upload documents');
    }
  }

  /**
   * Helper method to handle document download with proper filename
   * @param {string|number} documentId - Document ID
   * @param {string} filename - Optional custom filename
   * @returns {Promise<void>}
   */
  async downloadDocumentToFile(documentId, filename = null) {
    try {
      console.log('🔄 [TrackingService] Downloading document to file:', documentId);
      
      // Get document metadata first for filename if not provided
      if (!filename) {
        const metadataResult = await this.getDocumentMetadata(documentId);
        if (metadataResult.success) {
          filename = metadataResult.data.originalFilename || 
                    metadataResult.data.name || 
                    `document-${documentId}`;
        } else {
          filename = `document-${documentId}`;
        }
      }

      // Download the document
      const downloadResult = await this.downloadDocument(documentId);
      
      if (!downloadResult.success) {
        throw new Error(downloadResult.error);
      }

      // Create download link
      const url = window.URL.createObjectURL(downloadResult.data);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      console.log('✅ [TrackingService] Document downloaded successfully:', filename);
      
    } catch (error) {
      console.error('❌ [TrackingService] Download to file failed:', error);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use downloadDocumentToFile instead
   */
  async downloadTrackingDocument(documentId, documentName = null) {
    console.warn('⚠️ downloadTrackingDocument is deprecated. Use downloadDocumentToFile instead.');
    return this.downloadDocumentToFile(documentId, documentName);
  }

  // ==============================================
  // HELPER METHODS FOR EXTERNAL USE
  // ==============================================

  transformApiData(apiData) {
    return DataTransformer.transform(apiData);
  }

  transformApiDataArray(apiDataArray) {
    return DataTransformer.transformArray(apiDataArray);
  }

  transformDocumentData(apiDocument) {
    return DocumentTransformer.transform(apiDocument);
  }

  transformDocumentDataArray(apiDocuments) {
    return DocumentTransformer.transformArray(apiDocuments);
  }

  // ==============================================
  // DIAGNOSTIC METHODS
  // ==============================================

  async diagnoseDocumentService() {
    console.log('🔍 DOCUMENT SERVICE DIAGNOSIS');
    console.log('==============================');
    
    const results = {};
    
    try {
      // Test document endpoints with a known tracking ID
      console.log('1. Testing getDocumentsByTrackingId(2)...');
      const documentsResult = await this.getDocumentsByTrackingId(2);
      results.getDocumentsByTrackingId = {
        success: documentsResult.success,
        dataCount: documentsResult.data?.length || 0,
        message: documentsResult.message
      };
      console.log('   ✅ getDocumentsByTrackingId:', results.getDocumentsByTrackingId);

      // Test document metadata if we have documents
      if (documentsResult.success && documentsResult.data?.length > 0) {
        const firstDocId = documentsResult.data[0].id;
        console.log(`2. Testing getDocumentMetadata(${firstDocId})...`);
        const metadataResult = await this.getDocumentMetadata(firstDocId);
        results.getDocumentMetadata = {
          success: metadataResult.success,
          hasData: !!metadataResult.data,
          message: metadataResult.message
        };
        console.log('   ✅ getDocumentMetadata:', results.getDocumentMetadata);

        // Test download URL generation
        console.log(`3. Testing getDocumentDownloadUrl(${firstDocId})...`);
        const downloadUrlResult = await this.getDocumentDownloadUrl(firstDocId);
        results.getDocumentDownloadUrl = {
          success: downloadUrlResult.success,
          hasUrl: !!downloadUrlResult.data?.downloadUrl,
          expiresInMinutes: downloadUrlResult.data?.expiresInMinutes
        };
        console.log('   ✅ getDocumentDownloadUrl:', results.getDocumentDownloadUrl);
      }

      // Test document transformation
      console.log('4. Testing document transformation...');
      const sampleDoc = {
        id: 1,
        documentName: 'test-doc',
        originalFilename: 'test.pdf',
        documentType: 'SUPPORTING_DOCUMENTS',
        fileSize: 1024,
        formattedFileSize: '1 KB',
        contentType: 'application/pdf',
        uploadedByName: 'Test User',
        uploadedAt: new Date().toISOString(),
        isActive: true
      };
      
      const transformed = this.transformDocumentData(sampleDoc);
      results.documentTransformation = {
        success: !!transformed,
        hasRequiredFields: !!(transformed?.id && transformed?.name && transformed?.icon)
      };
      console.log('   ✅ Document transformation:', results.documentTransformation);

    } catch (error) {
      console.error('❌ Document service diagnosis failed:', error);
      results.error = error.message;
    }

    console.log('\n📋 DOCUMENT SERVICE DIAGNOSIS SUMMARY:');
    console.log('=======================================');
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

  // Existing diagnostic methods (unchanged)
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
      { name: 'getMyAssignedTrackings', method: () => this.getMyAssignedTrackings() },
      { name: 'getDocumentsByTrackingId(2)', method: () => this.getDocumentsByTrackingId(2) }
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
  window.diagnoseDocumentService = () => curriculumTrackingService.diagnoseDocumentService();
  window.getWorkingEndpoints = () => curriculumTrackingService.getWorkingEndpoints();
  window.testTrackingTransform = (data) => curriculumTrackingService.transformApiData(data);
  window.testDocumentTransform = (data) => curriculumTrackingService.transformDocumentData(data);
  
  // Quick test methods
  window.testDocuments = (trackingId = 2) => curriculumTrackingService.getDocumentsByTrackingId(trackingId);
  window.testDocumentMeta = (docId = 11) => curriculumTrackingService.getDocumentMetadata(docId);
  window.testDownloadUrl = (docId = 11) => curriculumTrackingService.getDocumentDownloadUrl(docId);
  window.testDownload = (docId = 11) => curriculumTrackingService.downloadDocumentToFile(docId);
}

export default curriculumTrackingService;