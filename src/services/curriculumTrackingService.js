import apiClient from "./apiClient";

const BASE_URL = '/tracking';
class CurriculumTrackingService{


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

async initiateCurriculum(curriculumData){
    try{
        const formData = new FormData();

        formData.append('schoolId', curriculumData.schoolId.toString());
        formData.append('departmentId', curriculumData.departmentId.toString());
        formData.append('academicLevelId', curriculumData.academicLevelId.toString());
        formData.append('proposedCurriculumName', curriculumData.proposedCurriculumName);
        formData.append('proposedCurriculumCode', curriculumData.proposedCurriculumCode);
        formData.append('proposedDurationSemesters', curriculumData.proposedDurationSemesters.toString());
        formData.append('curriculumDescription', curriculumData.curriculumDescription);
        formData.append('initialNotes', curriculumData.initialNotes || '');

        if (curriculumData.documents && curriculumData.length > 0){
            curriculumData.documents.forEach(document =>{
                formData.append('documents',document);
            });
        }
        const response = await apiClient.post(`${BASE_URL}/initiate`,formData,{
            headers:{
                'content-Type': 'multipart/form-data',
            },
        });

        return{
            success: true,
            data: response.data.data,
            message: response.data.message
        }
    }catch(error){
        console.error('Error initiating curriculum:', error);
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


async getAllCurricula(filters = {}){
    try{
        const params = new URLSearchParams();

        Object.keys(filters).forEach(key=>{
            if(filters[key] !== null && filters[key] !== undefined && filters[key] !== ''){
                params.append(key,filters[key]);
            }
        });

        const response = await apiClient.get(`${BASE_URL}?${params.toString()}`);

        return {
            success: true,
            data: response.data.data || [],
            message: response.data.message
          };
    }catch(error){
        console.error('Error fetching curricula:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch curriculum data',
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
    try{
        const response = await apiClient.get(`${BASE_URL}/${trackingId}`);

        return{
          success: true,
          data: response.data.data,
          message: response.data.message
        };

    }catch (error){
        console.error('error fetching curriculumn:',error)
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to fetch curriculum details',
            details: error.response?.data
          };
    }
}

/**
   * Update curriculum stage
   * @param {string} trackingId 
   * @param {Object} stageData 
   * @returns {Promise<Object>}
   */

async updatestage(trackingId,stageData){
    try{
        const response = await apiClient.put(`${BASE_URL}/{trackingId}/stage`,stageData);

        return {
            success: true,
            data: response.data.data,
            message: response.data.message
          };

    }catch (error){
        console.error('Error updating stage:', error);
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to update stage',
            details: error.response?.data
          };
    }
}

 /**
   * Upload documents for a curriculum
   * @param {string} trackingId 
   * @param {File[]} documents 
   * @param {string} stage
   * @returns {Promise<Object>}
   */

 async uploadDocuments (trackingId,documents,stage){
    try{
        const formData = new FormData();

        documents.forEach(document =>{
            formData.append('documents', document)
        });

        if(stage){
            formData.append('stage',stage);
        }

        const response = await apiClient.post(`${BASE_URL}/${trackingId}/documents`, formData,{
            headers:{
                'Content-Type':'multipart/form-data',
            }
        })
        return {
            success: true,
            data: response.data.data,
            message: response.data.message
          };
    }catch (error){
        console.error('Error uploading documents:', error);
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
TransformApiData(apiData){
    if(!apiData) return null;

    const stageMapping = {
      'IDEATION': 'initiation',
      'SCHOOL_BOARD_REVIEW': 'school_board',
      'DEAN_COMMITTEE_REVIEW': 'dean_committee',
      'SENATE_REVIEW': 'senate',
      'QA_REVIEW': 'qa_review',
      'VICE_CHANCELLOR_APPROVAL': 'vice_chancellor',
      'CUE_REVIEW': 'cue_review',
      'SITE_INSPECTION': 'site_inspection'
    }

    const statusMapping = {
        'INITIATED': 'under_review',
        'IN_PROGRESS': 'under_review',
        'PENDING_APPROVAL': 'pending_approval',
        'ON_HOLD': 'on_hold',
        'COMPLETED': 'completed',
        'REJECTED': 'rejected'
      };

      const getPriority  = (stage,daysInStage,isIdeationStage) => {
        if (isIdeationStage && daysInStage > 14) return 'high';
        if (daysInStage > 30) return 'high';
        if (daysInStage > 14) return 'medium';
        return 'low';
      };
      const daysInCurrentStage = this.calculateDaysInStage(apiData.updatedAt);

      return{
        
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
      }
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
   * @param {string} createdAt - 
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
    
    const stages = {
      initiation: {
        status: apiData.currentStage === 'IDEATION' ? 'under_review' : 'completed',
        assignedTo: apiData.initiatedByName,
        documents: [],
        notes: apiData.initialNotes || ''
      },
      school_board: { status: 'pending', assignedTo: '', documents: [], notes: '' },
      dean_committee: { status: 'pending', assignedTo: '', documents: [], notes: '' },
      senate: { status: 'pending', assignedTo: '', documents: [], notes: '' },
      qa_review: { status: 'pending', assignedTo: '', documents: [], notes: '' },
      vice_chancellor: { status: 'pending', assignedTo: '', documents: [], notes: '' },
      cue_review: { status: 'pending', assignedTo: '', documents: [], notes: '' },
      site_inspection: { status: 'pending', assignedTo: '', documents: [], notes: '' }
    };

    return stages;
  }
}
export default new CurriculumTrackingService();
