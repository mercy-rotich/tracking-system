import apiClient from "./apiClient";

const ENDPOINTS ={
  BASE:'/tracking',
  CREATE:'/tracking/create',
  DOCUMENTS:'/tracking/documents/download'
};
const STAGE_MAPPING = {
  'IDEATION': 'initiation',
  'SCHOOL_BOARD_REVIEW': 'school_board', 
  'DEAN_COMMITTEE_REVIEW': 'dean_committee',
  'SENATE_REVIEW': 'senate',
  'QA_REVIEW': 'qa_review',
  'VICE_CHANCELLOR_APPROVAL': 'vice_chancellor',
  'CUE_REVIEW': 'cue_review',
  'SITE_INSPECTION': 'site_inspection'
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

class FormDataBuilder{
  constructor(){
    this.formData = new FormData();
  }

  static create(){
    return new FormDataBuilder();
  }

  addField(key,value){
    if(value !== null && value !== undefined) {
      this.formData.append(key,value.toString());
    }
    return this;
  }

  addOptionalField(key,value){
    if(value){
      this.formData.append(key,value);
    }
    return this;
  }

  addDocuments(documents){
    if(documents?.length > 0){
      documents.forEach(doc => this.formData.append('documents',doc));
    }
    return this;
  }

  build(){
    return this.formData;
  }
}

class ResponseFormatter{
  static success(data,message = ''){
    return{
      success:true,
      data,
      message
    }
  }

  static error(error,defaultMessage){
    return{
      success:false,
      error:error.message || defaultMessage,
      details:error.data || error
    }
  }
}

class DataTransformer{
  static transform(apiData){
    if(!apiData) return null;

    const daysInCurrentStage = this.calculateDaysInStage(apiData.updatedAt);

    return{
      id: apiData.id,
      trackingId: apiData.trackingId,
      title: apiData.displayCurriculumName || apiData.proposedCurriculumName,
      school: apiData.schoolName,
      department: apiData.departmentName,
      currentStage: STAGE_MAPPING[apiData.currentStage] || 'initiation',
      status: STATUS_MAPPING[apiData.status] || 'under_review',
      priority: this.calculatePriority(apiData.currentStage, daysInCurrentStage, apiData.isIdeationStage),
      submittedDate: apiData.createdAt?.split('T')[0],
      lastUpdated: apiData.updatedAt?.split('T')[0],
      daysInCurrentStage,
      totalDays: this.calculateTotalDays(apiData.createdAt),
      estimatedCompletion: apiData.expectedCompletionDate,
      stages: this.buildStagesObject(apiData),
      ...apiData 
    }
  }

  static transformArray(apiDataArray){
     return Array.isArray(apiDataArray)
     ? apiDataArray.map(item => this.transform(item)).filter(Boolean)
     :[];
  }

  static calculatePriority(stage,daysInStage,isIdeationStage){
    if(isIdeationStage && daysInStage > PRIORITY_THRESHOLDS.IDEATION_HIGH)return 'high';
    if (daysInStage > PRIORITY_THRESHOLDS.GENERAL_HIGH) return 'high';
    if (daysInStage > PRIORITY_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
  }

  static calculateDaysInStage(lastUpdated){
    if(!lastUpdated) return 0;
    const diffTime = Math.abs(new Date() - new Date(lastUpdated));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  static calculateTotalDays(createdAt){
    if(!createdAt) return 0;
    const diffTime = Math.abs(new Date() - new Date(createdAt));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static buildStagesObject(apiData){
    const currentStage = STAGE_MAPPING[apiData.currentStage] || 'initiation';
    const stageOrder = this.getStageOrder(currentStage)

    const stages = {};

    Object.values(STAGE_MAPPING).forEach(stage=>{
      const order = this.getStageOrder(stage);
      stages[stage]={
        status:order < stageOrder ? 'completed':
               order === stageOrder ? 'under_review' : 'pending',
        assignedTo: stage === 'initiation' ? apiData.initiatedByName : '',
        documents: [],
        notes: stage === 'initiation' ? apiData.initialNotes || '' : '',
        startedDate: stage === 'initiation' ? apiData.createdAt : null,
        dueDate: null,
        completedDate: order < stageOrder ? apiData.updatedAt : null       
      }
    })
    return stages;
  }

  static getStageOrder(stage){
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

class QueryBuilder{
  static buildUrl(baseUrl,params ={}){
    const validParams = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const queryString = new URLSearchParams(validParams).toString();
    return queryString  ? `${baseUrl}?${queryString}` :baseUrl  
  }
}

class CurriculumTrackingService{
  async initiateCurriculum(curriculumData){
    try{
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
    }catch(error){
      return ResponseFormatter.error(error, 'Failed to initiate curriculum');
    }
  }

  async getAllCurricula(filters = {}) {
    try {
      const url = QueryBuilder.buildUrl(ENDPOINTS.BASE, filters);
      const response = await apiClient.get(url);
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(response.data.data || []),
        response.data.message
      );
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to fetch curriculum tracking data');
    }
  }

  async getCurriculumById(trackingId) {
    try {
      const response = await apiClient.get(`${ENDPOINTS.BASE}/${trackingId}`);
      
      return ResponseFormatter.success(
        DataTransformer.transform(response.data.data),
        response.data.message
      );
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to fetch curriculum details');
    }
  }

  async updateTracking(trackingId, trackingData) {
    try {
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
      return ResponseFormatter.error(error, 'Failed to update tracking');
    }
  }

  async assignTracking(trackingId, userId) {
    try {
      if (!trackingId || !userId) {
        throw new Error('Both tracking ID and user ID are required');
      }

      const response = await apiClient.post(`${ENDPOINTS.BASE}/${trackingId}/assign/${userId}`);
      
      return ResponseFormatter.success(
        DataTransformer.transform(response.data.data),
        response.data.message
      );
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to assign tracking');
    }
  }

  async reactivateTracking(trackingId) {
    try {
      if (!trackingId) {
        throw new Error('Tracking ID is required');
      }

      const response = await apiClient.post(`${ENDPOINTS.BASE}/${trackingId}/reactivate`);
      
      return ResponseFormatter.success(
        DataTransformer.transform(response.data.data),
        response.data.message
      );
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to reactivate tracking');
    }
  }

  async deactivateTracking(trackingId) {
    try {
      if (!trackingId) {
        throw new Error('Tracking ID is required');
      }

      const response = await apiClient.post(`${ENDPOINTS.BASE}/${trackingId}/deactivate`);
      
      return ResponseFormatter.success(
        response.data.data,
        response.data.message
      );
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to deactivate tracking');
    }
  }

  // === Query Methods ===

  async getTrackingByDepartment(departmentId, params = {}) {
    try {
      if (!departmentId) {
        throw new Error('Department ID is required');
      }

      const url = QueryBuilder.buildUrl(`${ENDPOINTS.BASE}/department/${departmentId}`, params);
      const response = await apiClient.get(url);
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(response.data.data?.trackings || []),
        response.data.message
      );
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to fetch department tracking data');
    }
  }

  async getTrackingBySchool(schoolId) {
    try {
      const response = await apiClient.get(`${ENDPOINTS.BASE}/school/${schoolId}`);
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(response.data.data?.trackings || []),
        response.data.message
      );
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to fetch school tracking data');
    }
  }

  async getTrackingByInitiator(initiatorId) {
    try {
      const response = await apiClient.get(`${ENDPOINTS.BASE}/initiator/${initiatorId}`);
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(response.data.data?.trackings || []),
        response.data.message
      );
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to fetch initiator tracking data');
    }
  }

  async getTrackingByAssignee(assigneeId) {
    try {
      const response = await apiClient.get(`${ENDPOINTS.BASE}/assignee/${assigneeId}`);
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(response.data.data?.trackings || []),
        response.data.message
      );
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to fetch assignee tracking data');
    }
  }

  async getMyInitiatedTrackings() {
    try {
      const response = await apiClient.get(`${ENDPOINTS.BASE}/my-trackings`);
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(response.data.data?.trackings || []),
        response.data.message
      );
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to fetch my tracking data');
    }
  }

  async getMyAssignedTrackings() {
    try {
      const response = await apiClient.get(`${ENDPOINTS.BASE}/my-assignments`);
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(response.data.data?.trackings || []),
        response.data.message
      );
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to fetch my assignment data');
    }
  }

  async getTrackingByStage(stage) {
    try {
      const response = await apiClient.get(`${ENDPOINTS.BASE}/stage/${stage}`);
      
      return ResponseFormatter.success(
        DataTransformer.transformArray(response.data.data?.trackings || []),
        response.data.message
      );
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to fetch stage tracking data');
    }
  }

  // === Action & Document Methods ===

  async performTrackingAction(actionData) {
    try {
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
      return ResponseFormatter.error(error, 'Failed to perform tracking action');
    }
  }

  async downloadTrackingDocument(documentId) {
    try {
      const response = await apiClient.get(`${ENDPOINTS.DOCUMENTS}/${documentId}`, {
        responseType: 'blob'
      });
      
      return ResponseFormatter.success(response.data, 'Document downloaded successfully');
    } catch (error) {
      return ResponseFormatter.error(error, 'Failed to download document');
    }
  }
}
export default new CurriculumTrackingService();