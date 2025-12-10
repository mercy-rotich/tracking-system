export class TrackingEndpointsRegistry {
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
      GET_ALL_TRACKINGS: { path: '/tracking', method: 'GET' },

      INITIATE: { path: '/tracking/initiate', method: 'POST' },
      UPDATE_TRACKING: { path: '/tracking/{id}', method: 'PUT' },

      PERFORM_ACTION: { path: '/tracking/action', method: 'POST' },
      DEACTIVATE_TRACKING: { path: '/tracking/{id}/deactivate', method: 'POST' },
      REACTIVATE_TRACKING: { path: '/tracking/{id}/reactivate', method: 'POST' },
      ASSIGN_TRACKING: { path: '/tracking/{id}/assign/{userId}', method: 'POST' },
      
      UPLOAD_DOCUMENT: { path: '/tracking/documents/upload', method: 'POST' },
      UPLOAD_BATCH_DOCUMENTS: { path: '/tracking/documents/upload/batch', method: 'POST' },
      DOWNLOAD_DOCUMENT: { path: '/tracking/documents/download/{documentId}', method: 'GET' },
      GET_DOWNLOAD_URL: { path: '/tracking/documents/download-url/{documentId}', method: 'GET' },
      GET_DOCUMENT_METADATA: { path: '/tracking/documents/{documentId}', method: 'GET' },
      GET_DOCUMENTS_BY_TRACKING: { path: '/tracking/documents/tracking/{trackingId}', method: 'GET' },
      GET_DOCUMENTS_BY_STEP: { path: '/tracking/documents/step/{stepId}', method: 'GET' },
      UPDATE_DOCUMENT: { path: '/tracking/documents/{documentId}', method: 'PUT' },
      DELETE_DOCUMENT: { path: '/tracking/documents/{documentId}', method: 'DELETE' },
      
      GET_STATISTICS: { path: '/tracking/statistics', method: 'GET' },
      SEARCH: { path: '/tracking/search', method: 'POST' },
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

  getAllEndpoints() {
    return Object.keys(this.endpoints);
  }

  getEndpointsByMethod(method) {
    return Object.entries(this.endpoints)
      .filter(([, endpoint]) => endpoint.method === method)
      .map(([name]) => name);
  }

  getDocumentEndpoints() {
    return Object.entries(this.endpoints)
      .filter(([name]) => name.includes('DOCUMENT') || name.includes('UPLOAD'))
      .reduce((acc, [name, endpoint]) => {
        acc[name] = endpoint;
        return acc;
      }, {});
  }
}