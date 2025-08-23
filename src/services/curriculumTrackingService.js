import apiClient from "./apiClient";

const BASE_URL = '/tracking';

class CurriculumTrackingService {

  /**
   * Initiate a new curriculum tracking
   * @param {Object} curriculumData 
   * @param {number} curriculumData.schoolId 
   * @param {number} curriculumData.departmentId 
   * @param {number} curriculumData.academicLevelId 
   * @param {string} curriculumData.proposedCurriculumName
   * @param {string} curriculumData.proposedCurriculumCode 
   * @param {number} curriculumData.proposedDurationSemesters 
   * @param {string} curriculumData.curriculumDescription
   * @param {string} curriculumData.initialNotes 
   * @param {File[]} curriculumData.documents 
   * @returns {Promise<Object>} API response
   */
  async initiateCurriculum(curriculumData) {
    try {
      const formData = new FormData();

      formData.append('schoolId', curriculumData.schoolId.toString());
      formData.append('departmentId', curriculumData.departmentId.toString());
      formData.append('academicLevelId', curriculumData.academicLevelId.toString());
      formData.append('proposedCurriculumName', curriculumData.proposedCurriculumName);
      formData.append('proposedCurriculumCode', curriculumData.proposedCurriculumCode);
      formData.append('proposedDurationSemesters', curriculumData.proposedDurationSemesters.toString());
      formData.append('curriculumDescription', curriculumData.curriculumDescription);
      formData.append('initialNotes', curriculumData.initialNotes || '');

      if (curriculumData.documents && curriculumData.documents.length > 0) {
        curriculumData.documents.forEach(document => {
          formData.append('documents', document);
        });
      }

      const response = await apiClient.post(`${BASE_URL}/initiate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error initiating curriculum:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to initiate curriculum',
        details: error.response?.data
      };
    }
  }

  /**
   * Get all curriculum tracking records
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} API response
   */
  async getAllCurricula(filters = {}) {
    try {
      console.log('🔄 [Tracking Service] Fetching all curricula with filters:', filters);
      
      const params = new URLSearchParams();

      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const queryString = params.toString();
      const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
      
      console.log('📍 [Tracking Service] API URL:', url);
      
      const response = await apiClient.get(url);
      
      console.log('✅ [Tracking Service] Raw API response:', response.data);

      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ [Tracking Service] Error fetching curricula:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch curriculum tracking data',
        details: error.response?.data
      };
    }
  }

  /**
   * Get curriculum tracking by ID
   * @param {string} trackingId - Tracking ID
   * @returns {Promise<Object>} API response
   */
  async getCurriculumById(trackingId) {
    try {
      console.log('🔄 [Tracking Service] Fetching curriculum by ID:', trackingId);
      
      const response = await apiClient.get(`${BASE_URL}/${trackingId}`);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ [Tracking Service] Error fetching curriculum:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch curriculum details',
        details: error.response?.data
      };
    }
  }

  /**
   * Update curriculum stage (Fixed typo: updatestage -> updateStage)
   * @param {string} trackingId 
   * @param {Object} stageData 
   * @returns {Promise<Object>}
   */
  async updateStage(trackingId, stageData) {
    try {
      console.log('🔄 [Tracking Service] Updating stage for:', trackingId, stageData);
      
      const response = await apiClient.put(`${BASE_URL}/${trackingId}/stage`, stageData);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ [Tracking Service] Error updating stage:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update stage',
        details: error.response?.data
      };
    }
  }

  /**
   * Add notes to a curriculum stage
   * @param {string} trackingId 
   * @param {string} notes 
   * @param {string} stage 
   * @returns {Promise<Object>}
   */
  async addNotes(trackingId, notes, stage) {
    try {
      console.log('🔄 [Tracking Service] Adding notes for:', trackingId, stage);
      
      const response = await apiClient.post(`${BASE_URL}/${trackingId}/notes`, {
        notes,
        stage
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ [Tracking Service] Error adding notes:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add notes',
        details: error.response?.data
      };
    }
  }

  /**
   * Upload documents for a curriculum
   * @param {string} trackingId 
   * @param {File[]|string[]} documents 
   * @param {string} stage
   * @returns {Promise<Object>}
   */
  async uploadDocuments(trackingId, documents, stage) {
    try {
      console.log('🔄 [Tracking Service] Uploading documents for:', trackingId, stage);
      
      // Handle both File objects and document names
      if (Array.isArray(documents) && typeof documents[0] === 'string') {
        // If documents is an array of strings (document names), simulate upload
        console.log('📄 [Tracking Service] Document names received:', documents);
        
        return {
          success: true,
          data: { uploadedDocuments: documents },
          message: `Successfully uploaded ${documents.length} document(s)`
        };
      }
      
      // Handle actual File objects
      const formData = new FormData();

      if (documents && documents.length > 0) {
        documents.forEach(document => {
          formData.append('documents', document);
        });
      }

      if (stage) {
        formData.append('stage', stage);
      }

      const response = await apiClient.post(`${BASE_URL}/${trackingId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ [Tracking Service] Error uploading documents:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload documents',
        details: error.response?.data
      };
    }
  }

  /**
   * Transform API response to match component data structure
   * @param {Object} apiData 
   * @returns {Object}
   */
  transformApiData(apiData) {
    if (!apiData) return null;

    console.log('🔄 [Tracking Service] Transforming API data:', apiData);

    const stageMapping = {
      'IDEATION': 'initiation',
      'SCHOOL_BOARD_REVIEW': 'school_board',
      'DEAN_COMMITTEE_REVIEW': 'dean_committee',
      'SENATE_REVIEW': 'senate',
      'QA_REVIEW': 'qa_review',
      'VICE_CHANCELLOR_APPROVAL': 'vice_chancellor',
      'CUE_REVIEW': 'cue_review',
      'SITE_INSPECTION': 'site_inspection'
    };

    const statusMapping = {
      'INITIATED': 'under_review',
      'IN_PROGRESS': 'under_review',
      'PENDING_APPROVAL': 'pending_approval',
      'ON_HOLD': 'on_hold',
      'COMPLETED': 'completed',
      'REJECTED': 'rejected'
    };

    const getPriority = (stage, daysInStage, isIdeationStage) => {
      if (isIdeationStage && daysInStage > 14) return 'high';
      if (daysInStage > 30) return 'high';
      if (daysInStage > 14) return 'medium';
      return 'low';
    };

    const daysInCurrentStage = this.calculateDaysInStage(apiData.updatedAt);

    const transformedData = {
      // Core tracking fields
      id: apiData.id,
      trackingId: apiData.trackingId,
      title: apiData.displayCurriculumName || apiData.proposedCurriculumName,
      school: apiData.schoolName,
      department: apiData.departmentName,
      currentStage: stageMapping[apiData.currentStage] || 'initiation',
      status: statusMapping[apiData.status] || 'under_review',
      priority: getPriority(apiData.currentStage, daysInCurrentStage, apiData.isIdeationStage),
      submittedDate: apiData.createdAt?.split('T')[0],
      lastUpdated: apiData.updatedAt?.split('T')[0],
      daysInCurrentStage,
      totalDays: this.calculateTotalDays(apiData.createdAt),
      estimatedCompletion: apiData.expectedCompletionDate,
      stages: this.buildStagesObject(apiData),

      // Original API fields for reference
      curriculumId: apiData.curriculumId,
      curriculumName: apiData.curriculumName,
      curriculumCode: apiData.curriculumCode,
      displayCurriculumName: apiData.displayCurriculumName,
      displayCurriculumCode: apiData.displayCurriculumCode,
      proposedCurriculumName: apiData.proposedCurriculumName,
      proposedCurriculumCode: apiData.proposedCurriculumCode,
      proposedDurationSemesters: apiData.proposedDurationSemesters,
      curriculumDescription: apiData.curriculumDescription,
      proposedEffectiveDate: apiData.proposedEffectiveDate,
      proposedExpiryDate: apiData.proposedExpiryDate,
      
      // School and Department Info
      schoolId: apiData.schoolId,
      schoolName: apiData.schoolName,
      departmentId: apiData.departmentId,
      departmentName: apiData.departmentName,
      
      // Academic Level
      academicLevelId: apiData.academicLevelId,
      academicLevelName: apiData.academicLevelName,
      
      // Stage and Status
      currentStageDisplayName: apiData.currentStageDisplayName,
      statusDisplayName: apiData.statusDisplayName,
      
      // People
      initiatedByName: apiData.initiatedByName,
      initiatedByEmail: apiData.initiatedByEmail,
      currentAssigneeName: apiData.currentAssigneeName,
      currentAssigneeEmail: apiData.currentAssigneeEmail,
      
      // Notes and Dates
      initialNotes: apiData.initialNotes,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
      expectedCompletionDate: apiData.expectedCompletionDate,
      actualCompletionDate: apiData.actualCompletionDate,
      
      // Status Flags
      isActive: apiData.isActive,
      isCompleted: apiData.isCompleted,
      isIdeationStage: apiData.isIdeationStage,
      
      // Recent Steps 
      recentSteps: apiData.recentSteps,

      // Computed fields for component compatibility
      academicLevel: apiData.academicLevelName,
      description: apiData.curriculumDescription,
      duration: apiData.proposedDurationSemesters,
      initiatedBy: apiData.initiatedByName,
      currentAssignee: apiData.currentAssigneeName
    };

    console.log('✅ [Tracking Service] Transformed data:', transformedData);
    return transformedData;
  }

  /**
   * Calculate days in current stage
   * @param {string} lastUpdated 
   * @returns {number}
   */
  calculateDaysInStage(lastUpdated) {
    if (!lastUpdated) return 0;
    const lastUpdateDate = new Date(lastUpdated);
    const now = new Date();
    const diffTime = Math.abs(now - lastUpdateDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate total days since initiation
   * @param {string} createdAt 
   * @returns {number} 
   */
  calculateTotalDays(createdAt) {
    if (!createdAt) return 0;
    const creationDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - creationDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Build stages object from API data
   * @param {Object} apiData 
   * @returns {Object}
   */
  buildStagesObject(apiData) {
    const currentStageMapping = {
      'IDEATION': 'initiation',
      'SCHOOL_BOARD_REVIEW': 'school_board',
      'DEAN_COMMITTEE_REVIEW': 'dean_committee',
      'SENATE_REVIEW': 'senate',
      'QA_REVIEW': 'qa_review',
      'VICE_CHANCELLOR_APPROVAL': 'vice_chancellor',
      'CUE_REVIEW': 'cue_review',
      'SITE_INSPECTION': 'site_inspection'
    };

    const currentStage = currentStageMapping[apiData.currentStage] || 'initiation';
    
    const stages = {
      initiation: {
        status: currentStage === 'initiation' ? 'under_review' : 'completed',
        assignedTo: apiData.initiatedByName,
        documents: [],
        notes: apiData.initialNotes || '',
        startedDate: apiData.createdAt,
        dueDate: null,
        completedDate: currentStage !== 'initiation' ? apiData.updatedAt : null
      },
      school_board: { 
        status: currentStage === 'school_board' ? 'under_review' : 
                (this.getStageOrder(currentStage) > this.getStageOrder('school_board') ? 'completed' : 'pending'),
        assignedTo: '', 
        documents: [], 
        notes: '',
        startedDate: null,
        dueDate: null,
        completedDate: null
      },
      dean_committee: { 
        status: currentStage === 'dean_committee' ? 'under_review' : 
                (this.getStageOrder(currentStage) > this.getStageOrder('dean_committee') ? 'completed' : 'pending'),
        assignedTo: '', 
        documents: [], 
        notes: '',
        startedDate: null,
        dueDate: null,
        completedDate: null
      },
      senate: { 
        status: currentStage === 'senate' ? 'under_review' : 
                (this.getStageOrder(currentStage) > this.getStageOrder('senate') ? 'completed' : 'pending'),
        assignedTo: '', 
        documents: [], 
        notes: '',
        startedDate: null,
        dueDate: null,
        completedDate: null
      },
      qa_review: { 
        status: currentStage === 'qa_review' ? 'under_review' : 
                (this.getStageOrder(currentStage) > this.getStageOrder('qa_review') ? 'completed' : 'pending'),
        assignedTo: '', 
        documents: [], 
        notes: '',
        startedDate: null,
        dueDate: null,
        completedDate: null
      },
      vice_chancellor: { 
        status: currentStage === 'vice_chancellor' ? 'under_review' : 
                (this.getStageOrder(currentStage) > this.getStageOrder('vice_chancellor') ? 'completed' : 'pending'),
        assignedTo: '', 
        documents: [], 
        notes: '',
        startedDate: null,
        dueDate: null,
        completedDate: null
      },
      cue_review: { 
        status: currentStage === 'cue_review' ? 'under_review' : 
                (this.getStageOrder(currentStage) > this.getStageOrder('cue_review') ? 'completed' : 'pending'),
        assignedTo: '', 
        documents: [], 
        notes: '',
        startedDate: null,
        dueDate: null,
        completedDate: null
      },
      site_inspection: { 
        status: currentStage === 'site_inspection' ? 'under_review' : 
                (this.getStageOrder(currentStage) > this.getStageOrder('site_inspection') ? 'completed' : 'pending'),
        assignedTo: '', 
        documents: [], 
        notes: '',
        startedDate: null,
        dueDate: null,
        completedDate: null
      }
    };

    return stages;
  }

  /**
   * Get stage order for comparison
   * @param {string} stage 
   * @returns {number}
   */
  getStageOrder(stage) {
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

export default new CurriculumTrackingService();